import React, { useState, useCallback, useEffect } from 'react';
import { generateVideo } from '../services/geminiService';
import { VideoAspectRatio, VideoResolution } from '../types';
import Spinner from './Spinner';
import { SparklesIcon } from './icons';
import FileUpload from './FileUpload';

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>(VideoAspectRatio.Portrait);
  const [resolution, setResolution] = useState<VideoResolution>(VideoResolution.SD);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  
  const checkApiKey = useCallback(async () => {
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const keyStatus = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(keyStatus);
    }
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      // Assume success to avoid race condition and allow user to proceed.
      // The API call itself will fail if the key is invalid.
      setHasApiKey(true);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !imageFile) {
      setError('Please enter a prompt or upload a starting image.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);
    setLoadingMessage("Preparing for generation...");

    try {
      const videoBlob = await generateVideo(prompt, imageFile, aspectRatio, resolution, setLoadingMessage);
      const url = URL.createObjectURL(videoBlob);
      setGeneratedVideoUrl(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      console.error(err);
      if (errorMessage.includes("Requested entity was not found")) {
        setError("API Key not found or invalid. Please select your API key again.");
        setHasApiKey(false);
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [prompt, imageFile, aspectRatio, resolution]);

  if (!hasApiKey) {
    return (
        <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
            <h2 className="text-xl font-bold text-gray-100 mb-2">API Key Required for Video Generation</h2>
            <p className="text-gray-400 mb-4 max-w-md">
                The Veo video model requires you to select your own API key. This is a one-time step.
            </p>
             <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-sm text-lime-400 hover:underline mb-6">Learn more about billing</a>
            <button
                onClick={handleSelectKey}
                className="bg-lime-400 text-black font-bold py-2 px-6 rounded-lg hover:bg-lime-500 transition"
            >
                Select API Key
            </button>
        </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div>
            <label htmlFor="prompt-video" className="block text-sm font-medium text-gray-300 mb-2">Video Prompt</label>
            <textarea
              id="prompt-video"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A dynamic shot of a product being used, UGC style, bright lighting"
              className="w-full h-28 p-3 bg-[#1F1F1F] border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition"
              disabled={isLoading}
            />
          </div>

          <FileUpload 
            label="Starting Image (Optional)"
            onFileSelect={setImageFile}
            disabled={isLoading}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                <div className="flex gap-2">
                    {Object.values(VideoAspectRatio).map(ratio => (
                        <button type="button" key={ratio} onClick={() => setAspectRatio(ratio)}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition ${aspectRatio === ratio ? 'bg-lime-400 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`} disabled={isLoading}>
                            {ratio === '9:16' ? 'Portrait' : 'Landscape'}
                        </button>
                    ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Resolution</label>
                 <div className="flex gap-2">
                    {Object.values(VideoResolution).map(res => (
                        <button type="button" key={res} onClick={() => setResolution(res)}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition ${resolution === res ? 'bg-lime-400 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`} disabled={isLoading}>
                            {res}
                        </button>
                    ))}
                </div>
              </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || (!prompt.trim() && !imageFile)}
            className="w-full flex items-center justify-center gap-2 bg-lime-400 text-black font-bold py-3 px-4 rounded-lg hover:bg-lime-500 transition-transform duration-150 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isLoading ? <><Spinner className="w-5 h-5" /> Generating Video...</> : <><SparklesIcon className="w-5 h-5" /> Generate Video</>}
          </button>
        </div>
      </form>

      {error && <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">{error}</div>}

      <div className="mt-8">
        {isLoading && (
          <div className="w-full aspect-video bg-gray-800/50 rounded-lg flex flex-col items-center justify-center gap-4 text-gray-300">
            <Spinner className="w-12 h-12" />
            <p className="font-semibold text-lg">sabar lur, lagi proses</p>
            <p className="text-sm text-gray-400">{loadingMessage}</p>
          </div>
        )}
        {generatedVideoUrl && (
          <div className="relative group">
            <video src={generatedVideoUrl} controls autoPlay loop className="w-full rounded-lg shadow-lg" />
            <a 
              href={generatedVideoUrl} 
              download={`ai-imageedit-video-${Date.now()}.mp4`} 
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

export default VideoGenerator;
