import React, { useState } from 'react';
import { generateImage } from '../api/generateImage';
import { ImageAspectRatio } from '../types';
import { SparklesIcon } from './icons';
import Spinner from './Spinner';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>(ImageAspectRatio.Square);
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
      const imageUrl = await generateImage({ prompt, aspectRatio });
      setGeneratedImage(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
            Prompt
          </label>
          <textarea
            id="prompt"
            rows={3}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-lime-500 focus:border-lime-500 transition"
            placeholder="e.g., A cute cat astronaut on the moon"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-300 mb-2">
            Aspect Ratio
          </label>
          <select
            id="aspect-ratio"
            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-lime-500 focus:border-lime-500 transition"
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as ImageAspectRatio)}
            disabled={isLoading}
          >
            {Object.values(ImageAspectRatio).map((ratio) => (
              <option key={ratio} value={ratio}>
                {ratio}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 bg-lime-500 text-gray-900 font-bold py-3 px-4 rounded-lg hover:bg-lime-600 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {isLoading ? <Spinner className="w-6 h-6" /> : <SparklesIcon className="w-6 h-6" />}
          {isLoading ? 'Generating...' : 'Generate Image'}
        </button>
      </form>

      {error && <div className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</div>}

      <div className="mt-6">
        {isLoading && (
            <div className="flex flex-col items-center justify-center bg-gray-900/50 rounded-lg p-8">
                <Spinner />
                <p className="mt-4 text-gray-400">Generating your image, please wait...</p>
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
