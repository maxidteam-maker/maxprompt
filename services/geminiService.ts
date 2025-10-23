import { ImageAspectRatio, VideoAspectRatio, VideoResolution } from '../types';

export const generateImage = async (
  prompt: string,
  aspectRatio: ImageAspectRatio,
  imageFile: File | null
): Promise<string> => {
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('aspectRatio', aspectRatio);
    if (imageFile) {
        formData.append('imageFile', imageFile);
    }

    const response = await fetch('/api/generateImage', {
        method: 'POST',
        body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Failed to generate image.');
    }

    return `data:${result.mimeType};base64,${result.base64Image}`;
};


export const generateVideo = async (
  prompt: string,
  imageFile: File | null,
  aspectRatio: VideoAspectRatio,
  resolution: VideoResolution,
  setLoadingMessage: (message: string) => void // This can be used for more granular updates if needed
): Promise<Blob> => {
    
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('aspectRatio', aspectRatio);
    formData.append('resolution', resolution);
    if (imageFile) {
        formData.append('imageFile', imageFile);
    }
    
    setLoadingMessage('Sending request to the server...');

    const response = await fetch('/api/generateVideo', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        // Try to parse error from JSON, otherwise use status text
        try {
            const result = await response.json();
            throw new Error(result.error || 'Failed to generate video.');
        } catch (e) {
            throw new Error(response.statusText || 'Failed to generate video.');
        }
    }
    
    setLoadingMessage('Video processing complete!');
    return await response.blob();
};