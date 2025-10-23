import React, { useState, useContext } from 'react';
import { UploadedFile } from '../types';
import { fileToBase64 } from '../utils/fileUtils';
import { editImageWithText } from '../services/geminiService';
import Loader from './common/Loader';
import Icon from './common/Icon';
import { ApiKeyContext } from '../context/ApiKeyContext';

const ProductStudio: React.FC = () => {
  const { apiKey } = useContext(ApiKeyContext);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const PRESET_PROMPTS = [
    "on a marble countertop with soft, natural lighting",
    "floating in a minimalist scene with geometric shapes",
    "on a wet, black slate surface with water droplets",
    "surrounded by ingredients that match its fragrance notes",
    "with a dramatic, single-source spotlight on a dark background",
  ];

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setUploadedFile({ file, base64, mimeType: file.type });
        setGeneratedImage(null);
        setError(null);
      } catch (err) {
        setError("Failed to read file.");
      }
    }
  };

  const handleSubmit = async () => {
    if (!apiKey) {
      setError("Please set your API key in the header before generating.");
      return;
    }
    if (!uploadedFile || !prompt) {
      setError("Please upload an image and enter a prompt.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const resultBase64 = await editImageWithText(uploadedFile.base64, uploadedFile.mimeType, prompt, apiKey);
      setGeneratedImage(`data:image/jpeg;base64,${resultBase64}`);
    } catch (err) {
      setError("Failed to generate image. Please check your API key and try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-zinc-100">Image Editor</h2>
      <p className="text-zinc-400">Upload your image and describe the edits you want to make.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label htmlFor="file-upload" className="block text-sm font-medium text-zinc-300">1. Upload Image</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-700 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Icon name="upload" className="mx-auto h-12 w-12 text-zinc-500" />
              <div className="flex text-sm text-zinc-400">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-zinc-900 rounded-md font-medium text-green-400 hover:text-green-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-zinc-900 focus-within:ring-green-500">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-zinc-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>

          {uploadedFile && (
            <div className="p-2 bg-zinc-800 rounded-lg">
              <p className="text-sm text-zinc-300 truncate">Uploaded: {uploadedFile.file.name}</p>
              <img src={URL.createObjectURL(uploadedFile.file)} alt="Uploaded product" className="mt-2 rounded-md max-h-48 mx-auto" />
            </div>
          )}

          <label htmlFor="prompt" className="block text-sm font-medium text-zinc-300">2. Describe Your Edits</label>
          <textarea
            id="prompt"
            rows={3}
            className="w-full bg-zinc-800 border-zinc-700 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-zinc-100"
            placeholder="e.g., Change the background to a beach at sunset"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {PRESET_PROMPTS.map(p => (
                <button key={p} onClick={() => setPrompt(p)} className="px-3 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded-full text-zinc-300 transition-colors">
                    {p}
                </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || !uploadedFile || !prompt}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-zinc-900 bg-green-500 hover:bg-green-600 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-green-500"
          >
            <Icon name="sparkles" className="w-5 h-5" />
            {isLoading ? 'Generating...' : 'Generate Image'}
          </button>
        </div>
        
        <div className="flex items-center justify-center bg-zinc-800/50 rounded-lg min-h-[300px] p-4">
          {isLoading && <Loader text="Applying your edits..." />}
          {error && <p className="text-red-400">{error}</p>}
          {generatedImage && (
            <div className="w-full">
                <img src={generatedImage} alt="Generated product" className="rounded-lg shadow-2xl w-full" />
                <a href={generatedImage} download="edited-photo.jpg" className="mt-4 inline-block w-full text-center py-2 px-4 bg-zinc-700 hover:bg-zinc-600 rounded-md text-sm font-medium">Download Image</a>
            </div>
          )}
          {!isLoading && !generatedImage && !error && (
            <p className="text-zinc-500">Your edited image will appear here</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductStudio;