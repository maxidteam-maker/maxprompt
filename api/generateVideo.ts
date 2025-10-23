// File: api/generateVideo.ts
// This is a Vercel Serverless Function that acts as a secure backend proxy for video generation.

import { GoogleGenAI, VideoAspectRatio, VideoResolution } from '@google/genai';

// FIX: Added a helper function to convert ArrayBuffer to base64 string for edge runtime, as 'Buffer' is not available.
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export const config = {
    runtime: 'edge',
    maxDuration: 60, // Set a longer duration for video generation
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error('API_KEY environment variable is not set.');
        }

        const formData = await req.formData();
        const prompt = formData.get('prompt') as string;
        const aspectRatio = formData.get('aspectRatio') as VideoAspectRatio;
        const resolution = formData.get('resolution') as VideoResolution;
        const imageFile = formData.get('imageFile') as File | null;

        const ai = new GoogleGenAI({ apiKey });

        // FIX: Replaced Node.js 'Buffer' with a custom base64 conversion function as Buffer is not available in edge runtime.
        const imagePayload = imageFile ? {
            imageBytes: arrayBufferToBase64(await imageFile.arrayBuffer()),
            mimeType: imageFile.type,
        } : undefined;

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

        // Polling loop
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error('Video generation failed: No download link found.');
        }
        
        const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
        
        if (!videoResponse.ok) {
            throw new Error(`Failed to download video: ${videoResponse.statusText}`);
        }

        const videoBlob = await videoResponse.blob();
        
        return new Response(videoBlob, {
            status: 200,
            headers: { 'Content-Type': 'video/mp4' },
        });

    } catch (error) {
        console.error('Error in /api/generateVideo:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
