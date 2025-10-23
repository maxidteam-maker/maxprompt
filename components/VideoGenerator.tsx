import React, { useState } from 'react';
import { generateVideo } from '../services/geminiService';
import { VideoAspectRatio, VideoResolution } from '../types';
import { SparklesIcon } from './icons';
import Spinner from './Spinner';
import FileUpload from './FileUpload';

interface VideoGeneratorProps {
    apiKey: string;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ apiKey }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>(VideoAspectRatio.Landscape);
  const [resolution, setResolution] = useState<VideoResolution>(VideoResolution.SD);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('sabar lur, lagi proses');
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !imageFile) {
      setError('Please enter a prompt or upload an image.');
      return;
    }

    setIsLoading(true);
    setGeneratedVideoUrl(null);
    setError(null);
    setLoadingMessage('Initializing video generation...');

    try {
      setLoadingMessage('Sending request to Gemini... This can take a few minutes.');
      const videoUrl = await generateVideo(
        apiKey,
        prompt,
        aspectRatio,
        resolution,
        imageFile,
      );
      setGeneratedVideoUrl(videoUrl);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="prompt-video" className="block text-sm font-medium text-gray-300 mb-2">
                Prompt (optional if image is provided)
              </label>
              <textarea
                id="prompt-video"
                rows={3}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-lime-500 focus:border-lime-500 transition"
                placeholder="e.g., A futuristic city with flying cars"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
                <label htmlFor="aspect-ratio-video" className="block text-sm font-medium text-gray-300 mb-2">
                    Aspect Ratio
                </label>
                <select
                    id="aspect-ratio-video"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-lime-500 focus:border-lime-500 transition"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as VideoAspectRatio)}
                    disabled={isLoading}
                >
                    {Object.values(VideoAspectRatio).map((ratio) => (
                    <option key={ratio} value={ratio}>{ratio}</option>
                    ))}
                </select>
            </div>
             <div>
                <label htmlFor="resolution-video" className="block text-sm font-medium text-gray-300 mb-2">
                    Resolution
                </label>
                <select
                    id="resolution-video"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-lime-500 focus:border-lime-500 transition"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as VideoResolution)}
                    disabled={isLoading}
                >
                    {Object.values(VideoResolution).map((res) => (
                    <option key={res} value={res}>{res}</option>
                    ))}
                </select>
            </div>
          </div>
          <FileUpload label="Starting Image (optional)" onFileSelect={setImageFile} disabled={isLoading} />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || (!prompt.trim() && !imageFile)}
          className="w-full mt-6 flex items-center justify-center gap-2 bg-lime-500 text-gray-900 font-bold py-3 px-4 rounded-lg hover:bg-lime-600 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {isLoading ? <Spinner className="w-6 h-6" /> : <SparklesIcon className="w-6 h-6" />}
          {isLoading ? 'Generating...' : 'Generate Video'}
        </button>
      </form>

      {error && <div className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-lg break-words">{error}</div>}

      <div className="mt-6">
        {isLoading && (
            <div className="flex flex-col items-center justify-center bg-gray-900/50 rounded-lg p-8">
                <Spinner />
                <p className="mt-4 text-gray-400">{loadingMessage}</p>
                <p className="mt-2 text-sm text-gray-500">Video generation is a lengthy process. Please be patient.</p>
            </div>
        )}
        {generatedVideoUrl && (
          <div className="rounded-lg overflow-hidden bg-gray-900">
            <video src={generatedVideoUrl} controls autoPlay loop className="w-full h-auto" />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGenerator;
