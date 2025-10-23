import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { ImageAspectRatio } from '../types';
import { SparklesIcon } from './icons';
import Spinner from './Spinner';
import FileUpload from './FileUpload';

interface ImageGeneratorProps {
  apiKey: string;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ apiKey }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>(ImageAspectRatio.Square);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setGeneratedImage(null);
    setError(null);
    try {
      const imageUrl = await generateImage(apiKey, prompt, aspectRatio, imageFile);
      setGeneratedImage(imageUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      // Simple parsing for JSON error strings from the backend
      try {
        const parsedError = JSON.parse(message);
        setError(parsedError.error?.message || message);
      } catch {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isEditing = !!imageFile;

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FileUpload
            label={isEditing ? '1. Image to Edit' : '1. Upload Image (Optional for Editing)'}
            onFileSelect={setImageFile}
            disabled={isLoading}
        />
        
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
            {isEditing ? '2. Describe Your Edit' : '2. Describe the Image to Generate'}
          </label>
          <textarea
            id="prompt"
            rows={3}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-lime-500 focus:border-lime-500 transition"
            placeholder={isEditing ? "e.g., add sunglasses to the person" : "e.g., A cute cat astronaut on the moon"}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Aspect Ratio 
            {isEditing && <span className="text-xs text-gray-500"> (disabled for editing)</span>}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {Object.values(ImageAspectRatio).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => setAspectRatio(ratio)}
                disabled={isLoading || isEditing}
                className={`p-2 rounded-lg text-sm font-semibold transition ${
                  aspectRatio === ratio
                    ? 'bg-lime-500 text-gray-900'
                    : 'bg-gray-700 hover:bg-gray-600'
                } disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 bg-lime-500 text-gray-900 font-bold py-3 px-4 rounded-lg hover:bg-lime-600 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {isLoading ? <Spinner className="w-6 h-6" /> : <SparklesIcon className="w-6 h-6" />}
          {isLoading ? 'sabar lur, lagi proses' : (isEditing ? 'Generate Edited Image' : 'Generate New Image')}
        </button>
      </form>

      {error && <div className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-lg break-words">{error}</div>}

      <div className="mt-6">
        {isLoading && (
            <div className="flex flex-col items-center justify-center bg-gray-900/50 rounded-lg p-8 min-h-[200px]">
                <Spinner />
                <p className="mt-4 text-gray-400">sabar lur, lagi proses...</p>
            </div>
        )}
        {generatedImage && (
          <div className="rounded-lg overflow-hidden bg-gray-900">
            <img src={generatedImage} alt="Generated" className="w-full h-auto" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
