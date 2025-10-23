import { GoogleGenAI, Modality } from '@google/genai';
import { ImageAspectRatio, VideoAspectRatio, VideoResolution } from '../types';

// Helper function to convert File to base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const generateImage = async (
  prompt: string,
  aspectRatio: ImageAspectRatio,
  imageFile: File | null
): Promise<string> => {
  // A new GoogleGenAI instance should be created before each API call to ensure it uses the latest API key.
  const ai = new GoogleGenAI({});

  // --- IMAGE EDITING LOGIC ---
  if (imageFile) {
    const base64Data = await fileToBase64(imageFile);
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: imageFile.type,
      },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        role: 'user', // Explicitly set the role for multimodal input
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const imageEditPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!imageEditPart?.inlineData) {
      throw new Error("Image editing failed or no image was returned.");
    }
    const base64ImageBytes: string = imageEditPart.inlineData.data;
    const mimeType = imageEditPart.inlineData.mimeType;
    return `data:${mimeType};base64,${base64ImageBytes}`;
  } 
  
  // --- NEW IMAGE GENERATION LOGIC ---
  else {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("Image generation failed or returned no images.");
    }

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  }
};


export const generateVideo = async (
  prompt: string,
  imageFile: File | null,
  aspectRatio: VideoAspectRatio,
  resolution: VideoResolution,
  setLoadingMessage: (message: string) => void
): Promise<Blob> => {
    
  // A new GoogleGenAI instance should be created before each API call to ensure it uses the latest API key.
  const ai = new GoogleGenAI({});

  setLoadingMessage('Preparing for generation...');
  
  const imagePayload = imageFile ? {
    imageBytes: await fileToBase64(imageFile),
    mimeType: imageFile.type,
  } : undefined;

  setLoadingMessage('Sending request to the model...');

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: imagePayload,
    config: {
      numberOfVideos: 1,
      resolution: resolution,
      aspectRatio: aspectRatio,
    },
  });

  setLoadingMessage('Video generation in progress... this can take a few minutes.');

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    setLoadingMessage('Checking generation status...');
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error('Video generation failed: No download link found.');
  }

  setLoadingMessage('Downloading generated video...');

  // The fetch call will automatically use the correct authentication context provided by the environment.
  const response = await fetch(downloadLink);
  if (!response.ok) {
    const errorText = await response.text();
    // Propagate the error message so the component can check for "Requested entity was not found"
    // which suggests an API key issue.
    throw new Error(`Failed to download video: ${response.statusText} - ${errorText}`);
  }

  setLoadingMessage('Video processing complete!');
  return await response.blob();
};