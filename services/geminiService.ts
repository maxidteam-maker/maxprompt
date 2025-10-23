import { GoogleGenAI, Modality } from '@google/genai';
import { ImageAspectRatio, VideoAspectRatio, VideoResolution } from '../types';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to read file as base64 string.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const generateImage = async (
  prompt: string,
  aspectRatio: ImageAspectRatio,
  imageFile: File | null
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // --- EDITING FLOW ---
  // If an image file is provided, use the multimodal model for editing.
  if (imageFile) {
    const base64Image = await fileToBase64(imageFile);
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: imageFile.type,
      },
    };
    const textPart = { text: prompt };
    const parts = [imagePart, textPart];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Nano Banana for editing
      contents: { role: 'user', parts }, // FIX: Add role for better multimodal understanding
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error('Image editing failed or no image was returned.');
  }
  // --- GENERATION FLOW ---
  // If no image file, use the Imagen model for high-quality generation with guaranteed aspect ratio.
  else {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001', // Imagen for pure generation
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio, // Direct aspect ratio control for perfect results
        outputMimeType: 'image/png',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages[0].image.imageBytes;
    }

    throw new Error('Image generation failed or no image was returned.');
  }
};

export const generateVideo = async (
  prompt: string,
  imageFile: File | null,
  aspectRatio: VideoAspectRatio,
  resolution: VideoResolution,
  setLoadingMessage: (message: string) => void
): Promise<Blob> => {
  // A new instance is created to ensure it uses the most up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const config: any = {
    numberOfVideos: 1,
    resolution,
    aspectRatio,
  };

  let imagePayload;
  if (imageFile) {
    setLoadingMessage('Encoding image...');
    const base64Image = await fileToBase64(imageFile);
    imagePayload = {
      imageBytes: base64Image,
      mimeType: imageFile.type,
    };
  }

  setLoadingMessage('Sending request to Gemini...');
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || undefined, // Prompt is optional if image is provided
    image: imagePayload,
    config,
  });

  setLoadingMessage('Video generation started. This may take a few minutes...');
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
    setLoadingMessage('Checking video status...');
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

  if (!downloadLink) {
    throw new Error('Video generation failed or returned no link.');
  }

  setLoadingMessage('Downloading video...');
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Download error:', errorBody);
    throw new Error(`Failed to download video: ${response.statusText}`);
  }

  const videoBlob = await response.blob();
  return videoBlob;
};