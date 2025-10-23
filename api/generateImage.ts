// File: api/generateImage.ts
// This is a Vercel Serverless Function that acts as a secure backend proxy.

import { GoogleGenAI, Modality, ImageAspectRatio } from '@google/genai';

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
    api: {
        bodyParser: false, // We need to handle the stream ourselves
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
        const aspectRatio = formData.get('aspectRatio') as ImageAspectRatio;
        const imageFile = formData.get('imageFile') as File | null;

        const ai = new GoogleGenAI({ apiKey });

        // --- IMAGE EDITING LOGIC ---
        if (imageFile) {
            const buffer = await imageFile.arrayBuffer();
            // FIX: Replaced Node.js 'Buffer' with a custom base64 conversion function as Buffer is not available in edge runtime.
            const base64Data = arrayBufferToBase64(buffer);
            
            const imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: imageFile.type,
                },
            };
            const textPart = { text: prompt };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                // FIX: Removed invalid 'role' property. The 'contents' object should directly contain 'parts'.
                contents: {
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
            return new Response(JSON.stringify({
                mimeType: imageEditPart.inlineData.mimeType,
                base64Image: imageEditPart.inlineData.data,
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
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

            return new Response(JSON.stringify({
                mimeType: 'image/jpeg',
                base64Image: response.generatedImages[0].image.imageBytes,
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

    } catch (error) {
        console.error('Error in /api/generateImage:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
