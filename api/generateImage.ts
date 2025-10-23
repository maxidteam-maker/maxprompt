import { getGeminiClient } from '../services/geminiService';
import { ImageAspectRatio } from '../types';

export interface GenerateImageParams {
  prompt: string;
  aspectRatio: ImageAspectRatio;
}

export const generateImage = async ({ prompt, aspectRatio }: GenerateImageParams): Promise<string> => {
  const ai = getGeminiClient();
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      throw new Error('No image was generated.');
    }
  } catch (error) {
    console.error('Error generating image:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating the image.');
  }
};
