import { GoogleGenAI } from "@google/genai";

/**
 * Creates and returns a new GoogleGenAI client instance.
 * As per guidelines for features that use the API key selection dialog (like Veo),
 * a new client should be instantiated before each API call to ensure the latest key is used.
 * This function centralizes client creation.
 */
export const getGeminiClient = () => {
    // The API key is expected to be populated in process.env.API_KEY by the environment,
    // potentially after user selection via window.aistudio.
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};
