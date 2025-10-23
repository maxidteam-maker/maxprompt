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
    if (imageFile && !prompt.trim()) {
      setError('Please enter a prompt to describe your edit.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      const base64Image = await generateImage(prompt, aspectRatio, imageFile);
      const url = `data:image/png;base64,${base64Image}`;
      setGeneratedImageUrl(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, aspectRatio, imageFile]);

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
              {imageFile ? '2. Describe Your Edit' : '2. Describe the Image to Generate'}
            </label>
            <textarea
              id="prompt-image"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={imageFile ? "e.g., add sunglasses to the person" : "e.g., A majestic lion jumping from a fire hoop"}
              className="w-full h-28 p-3 bg-[#1F1F1F] border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
                Aspect Ratio
                {imageFile && <span className="text-gray-400 font-normal text-xs ml-2">(Disabled when editing an image)</span>}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.values(ImageAspectRatio).map(ratio => (
                    <button type="button" key={ratio} onClick={() => setAspectRatio(ratio)}
                    className={`py-2 px-4 rounded-lg font-semibold text-sm transition ${aspectRatio === ratio ? 'bg-lime-400 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'} disabled:opacity-50 disabled:cursor-not-allowed`} 
                    disabled={isLoading || !!imageFile}>
                        {ratio}
                    </button>
                ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || (!prompt && !imageFile)}
            className="w-full flex items-center justify-center gap-2 bg-lime-400 text-black font-bold py-3 px-4 rounded-lg hover:bg-lime-500 transition-transform duration-150 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isLoading ? (
                <>
                    <Spinner className="w-5 h-5" />
                    {imageFile ? 'Applying Edits...' : 'Generating Image...'}
                </>
            ) : (
                <>
                    <SparklesIcon className="w-5 h-5" />
                    {imageFile ? 'Generate Edited Image' : 'Generate New Image'}
                </>
            )}
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
            <img src={generatedImageUrl} alt="Generated" className="w-full rounded-lg shadow-lg" />
            <a 
              href={generatedImageUrl} 
              download={`ai-imageedit-image-${Date.now()}.png`} 
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
