import { GoogleGenAI } from "@google/genai";
import { VideoAspectRatio, VideoResolution } from '../types';

async function streamToArrayBuffer(stream: ReadableStream<Uint8Array>): Promise<ArrayBuffer> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const buffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        buffer.set(chunk, offset);
        offset += chunk.length;
    }
    return buffer.buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function POST(request: Request) {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: "API key is not configured on the server" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
        
        const ai = new GoogleGenAI({ apiKey });
        const formData = await request.formData();

        const prompt = formData.get('prompt') as string;
        const aspectRatio = formData.get('aspectRatio') as VideoAspectRatio;
        const resolution = formData.get('resolution') as VideoResolution;
        const imageFile = formData.get('image') as File | null;

        if (!prompt && !imageFile) {
            return new Response(JSON.stringify({ error: "Prompt or image is required" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        
        let imagePayload;
        if (imageFile) {
            const imageBuffer = await streamToArrayBuffer(imageFile.stream());
            const imageBase64 = arrayBufferToBase64(imageBuffer);
            imagePayload = {
                imageBytes: imageBase64,
                mimeType: imageFile.type,
            };
        }

        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            ...(imagePayload && { image: imagePayload }),
            config: {
                numberOfVideos: 1,
                resolution: resolution,
                aspectRatio: aspectRatio,
            },
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error('Video generation finished, but no download link was provided.');
        }
        
        const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
        if (!videoResponse.ok) {
            throw new Error(`Failed to download the generated video. Status: ${videoResponse.status}`);
        }

        const videoBlob = await videoResponse.blob();
        
        return new Response(videoBlob, {
            status: 200,
            headers: {
                'Content-Type': 'video/mp4',
            }
        });

    } catch (error) {
        console.error("Error in generateVideo API:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
