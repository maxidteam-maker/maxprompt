import { getGeminiClient } from '../services/geminiService';
import { VideoAspectRatio, VideoResolution } from '../types';

export interface GenerateVideoParams {
  prompt: string;
  aspectRatio: VideoAspectRatio;
  resolution: VideoResolution;
  image?: {
    base64: string;
    mimeType: string;
  };
}

export const generateVideo = async ({
  prompt,
  aspectRatio,
  resolution,
  image,
}: GenerateVideoParams): Promise<string> => {
  const ai = getGeminiClient();

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      ...(image && { 
        image: {
            imageBytes: image.base64,
            mimeType: image.mimeType,
        }
      }),
      config: {
        numberOfVideos: 1,
        resolution: resolution,
        aspectRatio: aspectRatio,
      },
    });

    while (!operation.done) {
      // Polling every 10 seconds as recommended in the docs.
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error('Video generation finished, but no download link was provided.');
    }
    
    // The link needs the API key to be accessed.
    return `${downloadLink}&key=${process.env.API_KEY}`;

  } catch (error) {
    console.error('Error generating video:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate video: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating the video.');
  }
};
