import React, { useState, useCallback } from 'react';
import { generateImage } from '../services/geminiService';
import { ImageAspectRatio } from '../types';
import Spinner from './Spinner';
import { SparklesIcon } from './icons';
import FileUpload from './FileUpload';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>(ImageAspectRatio.Square);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !imageFile) {
      setError('Please enter a prompt or upload an image to edit.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      const url = await generateImage(prompt, aspectRatio, imageFile);
      setGeneratedImageUrl(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, aspectRatio, imageFile]);

  const isEditing = imageFile !== null;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <FileUpload
            label="1. Upload Image (Optional for Editing)"
            onFileSelect={setImageFile}
            disabled={isLoading}
          />
           <div>
            <label htmlFor="prompt-image" className="block text-sm font-medium text-gray-300 mb-2">
              {isEditing ? '2. Describe Your Edit' : '1. Describe the Image to Generate'}
            </label>
            <textarea
              id="prompt-image"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isEditing ? "e.g., Add sunglasses to the person" : "e.g., A photorealistic image of a futuristic city"}
              className="w-full h-28 p-3 bg-[#1F1F1F] border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Aspect Ratio 
              {isEditing && <span className="text-xs text-gray-500 ml-2">(Follows original image)</span>}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.values(ImageAspectRatio).map(ratio => (
                    <button type="button" key={ratio} onClick={() => setAspectRatio(ratio)}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition ${aspectRatio === ratio ? 'bg-lime-400 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'} ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isLoading || isEditing}>
                        {ratio}
                    </button>
                ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || (!prompt.trim() && !imageFile)}
            className="w-full flex items-center justify-center gap-2 bg-lime-400 text-black font-bold py-3 px-4 rounded-lg hover:bg-lime-500 transition-transform duration-150 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isLoading ? <><Spinner className="w-5 h-5" /> sabar lur, lagi proses</> : <><SparklesIcon className="w-5 h-5" /> {isEditing ? 'Generate Edited Image' : 'Generate New Image'}</>}
          </button>
        </div>
      </form>

      {error && <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">{error}</div>}

      <div className="mt-8">
        {isLoading && (
          <div className="w-full aspect-square bg-gray-800/50 rounded-lg flex flex-col items-center justify-center gap-4 text-gray-300">
            <Spinner className="w-12 h-12" />
            <p className="font-semibold text-lg">sabar lur, lagi proses</p>
          </div>
        )}
        {generatedImageUrl && (
          <div className="relative group">
            <img src={generatedImageUrl} alt="Generated image" className="w-full rounded-lg shadow-lg" />
            <a 
              href={generatedImageUrl} 
              download={`maxprompt-image-${Date.now()}.jpeg`} 
              className="absolute bottom-4 right-4 bg-black/50 text-white py-2 px-4 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;