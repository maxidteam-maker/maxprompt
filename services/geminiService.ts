import { GoogleGenAI, Modality } from '@google/genai';
import { AspectRatio } from '../types';

const getAI = (apiKey: string) => new GoogleGenAI({ apiKey });

/**
 * Generates an image using the Imagen 4.0 model.
 */
export const generateImage = async (prompt: string, aspectRatio: AspectRatio, apiKey: string): Promise<string> => {
  const ai = getAI(apiKey);
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: aspectRatio,
    },
  });

  const base64ImageBytes = response.generatedImages[0].image.imageBytes;
  if (!base64ImageBytes) {
    throw new Error('No image bytes returned from API.');
  }
  return base64ImageBytes;
};

/**
 * Edits an image based on a text prompt using the Gemini 2.5 Flash Image model.
 */
export const editImageWithText = async (base64ImageData: string, mimeType: string, prompt: string, apiKey: string): Promise<string> => {
  const ai = getAI(apiKey);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64ImageData,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error('No image data found in the response.');
};


/**
 * Generates a video from a starting image and a text prompt using the Veo 3.1 model.
 */
export const generateVideoFromImage = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string,
  aspectRatio: '16:9' | '9:16',
  apiKey: string
): Promise<string> => {
  const ai = getAI(apiKey);

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: {
      imageBytes: base64ImageData,
      mimeType: mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio,
    },
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error('Video generation succeeded but no download link was provided.');
  }
  
  const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
  if (!videoResponse.ok) {
    throw new Error(`Failed to download video: ${videoResponse.statusText}`);
  }

  const blob = await videoResponse.blob();
  return URL.createObjectURL(blob);
};

/**
 * Analyzes image or video content based on a text prompt using Gemini 2.5 Pro.
 */
export const analyzeContent = async (base64Data: string, mimeType: string, prompt: string, apiKey: string): Promise<string> => {
  const ai = getAI(apiKey);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
  });

  return response.text;
};

/**
 * Combines a model image and a product image with a text prompt.
 */
export const combineImagesWithText = async (
  modelBase64: string,
  modelMimeType: string,
  productBase64: string,
  productMimeType: string,
  prompt: string,
  aspectRatio: AspectRatio,
  apiKey: string
): Promise<string> => {
  const ai = getAI(apiKey);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: modelBase64,
            mimeType: modelMimeType,
          },
        },
        {
          inlineData: {
            data: productBase64,
            mimeType: productMimeType,
          },
        },
        {
          text: `${prompt}. Generate the final image in a ${aspectRatio} aspect ratio.`,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error('No image data found in the response.');
};


/**
 * Generates a descriptive prompt for combining a model and product image.
 */
export const generatePromptForImages = async (
  modelBase64: string,
  modelMimeType: string,
  productBase64: string,
  productMimeType: string,
  apiKey: string
): Promise<string> => {
  const ai = getAI(apiKey);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            data: modelBase64,
            mimeType: modelMimeType,
          },
        },
        {
          inlineData: {
            data: productBase64,
            mimeType: productMimeType,
          },
        },
        {
          text: 'You are an expert creative director. Based on the two images provided (a person and a product), write a short, single-sentence prompt to combine them into a professional, photorealistic lifestyle photo. Describe the scene, the model\'s action, and the interaction with the product. For example: "A smiling woman in a bright, modern kitchen, holding and looking at the product."',
        },
      ],
    },
  });

  return response.text;
};