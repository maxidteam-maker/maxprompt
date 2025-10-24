import React, { useState, useContext } from 'react';
import { UploadedFile } from '../types';
import { fileToBase64 } from '../utils/fileUtils';
import { generateVideoFromImage } from '../services/geminiService';
import Loader from './common/Loader';
import Icon from './common/Icon';
import { ApiKeyContext } from '../context/ApiKeyContext';

const VideoGenerator: React.FC = () => {
  const { apiKey } = useContext(ApiKeyContext);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setUploadedFile({ file, base64, mimeType: file.type });
        setGeneratedVideo(null);
        setError(null);
      } catch (err) {
        setError("Failed to read file.");
      }
    }
  };

  const handleSubmit = async () => {
    if (!apiKey) {
      setError("Please set your API key in the header before generating a video.");
      return;
    }
    if (!uploadedFile || !prompt) {
      setError("Please upload an image and enter a prompt.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedVideo(null);

    try {
      const videoUrl = await generateVideoFromImage(uploadedFile.base64, uploadedFile.mimeType, prompt, aspectRatio, apiKey);
      setGeneratedVideo(videoUrl);
    } catch (err: any) {
      let errorMessage = "Failed to generate video. Please check your API key and try again.";
      if (err && err.message) {
        if (err.message.includes('suspended')) {
          errorMessage = "Your API key has been suspended. Please check its status in your Google Cloud project.";
        } else if (err.message.includes('Permission denied')) {
          errorMessage = "Permission denied. Please ensure your API key is valid and has the necessary permissions enabled.";
        } else if (err.message.includes('API key not valid')) {
          errorMessage = "The API key you provided is not valid. Please check for typos and try again.";
        }
      }
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-zinc-100">Image to Video Generator</h2>
      <p className="text-zinc-400">Bring your product image to life with a short, dynamic video clip.</p>
      
       {!apiKey && (
        <div className="bg-zinc-800 border border-yellow-600/50 text-yellow-300 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">Action Required:</strong>
          <span className="block sm:inline ml-2">Video generation requires an API key. Please click "Set API Key" in the header.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-zinc-300">1. Upload Starting Image</label>
           <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-700 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Icon name="upload" className="mx-auto h-12 w-12 text-zinc-500" />
              <div className="flex text-sm text-zinc-400">
                <label htmlFor="video-file-upload" className="relative cursor-pointer bg-zinc-900 rounded-md font-medium text-green-400 hover:text-green-300 focus-within:outline-none">
                  <span>Upload a file</span>
                  <input id="video-file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                </label>
              </div>
            </div>
          </div>
          {uploadedFile && <img src={URL.createObjectURL(uploadedFile.file)} alt="Uploaded" className="rounded-md max-h-32 mx-auto" />}
          
          <label htmlFor="video-prompt" className="block text-sm font-medium text-zinc-300">2. Describe Video Action</label>
          <textarea id="video-prompt" rows={3} className="w-full bg-zinc-800 border-zinc-700 rounded-md text-zinc-100 focus:ring-green-500 focus:border-green-500" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., The camera slowly zooms out, revealing a beautiful landscape..."/>

          <label className="block text-sm font-medium text-zinc-300">3. Select Aspect Ratio</label>
          <div className="flex gap-2">
            {(['16:9', '9:16'] as const).map(r => 
                <button key={r} onClick={() => setAspectRatio(r)} className={`px-4 py-2 text-sm rounded-md transition-colors ${aspectRatio === r ? 'bg-green-500 text-zinc-900 font-semibold' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}`}>{r} {r === '16:9' ? '(Landscape)' : '(Portrait)'}</button>
            )}
          </div>

          <button onClick={handleSubmit} disabled={isLoading || !uploadedFile || !prompt || !apiKey} className="w-full flex justify-center items-center gap-2 py-3 px-4 text-sm font-semibold text-zinc-900 bg-green-500 hover:bg-green-600 disabled:bg-zinc-700 disabled:text-zinc-400">
            <Icon name="video" className="w-5 h-5" />
            {isLoading ? 'Generating Video...' : 'Generate Video'}
          </button>
        </div>
        
        <div className="flex items-center justify-center bg-zinc-800/50 rounded-lg min-h-[300px] p-4">
          {isLoading && <Loader text="Video generation can take a few minutes..." />}
          {error && <p className="text-red-400">{error}</p>}
          {generatedVideo && <video src={generatedVideo} controls autoPlay loop className="rounded-lg w-full" />}
          {!isLoading && !generatedVideo && !error && <p className="text-zinc-500">Your generated video will appear here</p>}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;