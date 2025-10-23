import { ImageAspectRatio, VideoAspectRatio, VideoResolution } from "../types";

const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = (error) => reject(error);
    });
};

export const generateImage = async (
    prompt: string,
    aspectRatio: ImageAspectRatio,
    imageFile?: File | null
) : Promise<string> => {
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('aspectRatio', aspectRatio);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const response = await fetch('/api/generateImage', {
        method: 'POST',
        body: formData,
    });
    
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
    }

    return data.imageUrl;
};


export const generateVideo = async (
    prompt: string,
    aspectRatio: VideoAspectRatio,
    resolution: VideoResolution,
    imageFile?: File | null
) : Promise<string> => {
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('aspectRatio', aspectRatio);
    formData.append('resolution', resolution);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const response = await fetch('/api/generateVideo', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate video');
    }
    
    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);
};
