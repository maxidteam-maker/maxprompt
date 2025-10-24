import React, { useState, useContext } from 'react';
import { generateImage } from '../services/geminiService';
import { AspectRatio } from '../types';
import Loader from './common/Loader';
import Icon from './common/Icon';
import { ApiKeyContext } from '../context/ApiKeyContext';

const ImageGenerator: React.FC = () => {
  const { apiKey } = useContext(ApiKeyContext);
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ASPECT_RATIOS: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4'];

  const EXAMPLE_IMAGES = [
    { src: 'https://i.imgur.com/sd1iG2p.jpeg', prompt: 'High-detail RAW photo of a tiger' },
    { src: 'https://i.imgur.com/J3t5t6F.jpeg', prompt: 'A sleeping fox, sculpted stories' },
    { src: 'https://i.imgur.com/2sL2l5V.jpeg', prompt: 'Vintage mascots, surfing sticker' },
    { src: 'https://i.imgur.com/RCA4SHI.jpeg', prompt: 'Bramblewind Village, cozy cottage' },
    { src: 'https://i.imgur.com/kPFEA2N.jpeg', prompt: 'Flash portrait of a person with vitiligo' },
  ];

  const handleSubmit = async () => {
    if (!apiKey) {
      setError("Please set your API key in the header before generating.");
      return;
    }
    if (!prompt) {
      setError("Please enter a prompt.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const resultBase64 = await generateImage(prompt, aspectRatio, apiKey);
      setGeneratedImage(`data:image/jpeg;base64,${resultBase64}`);
    } catch (err: any) {
      let errorMessage = "Failed to generate image. Please check your API key and try again.";
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

  const renderContent = () => {
    if (isLoading) return <Loader text="Summoning pixels..." />;
    if (error) return <p className="text-red-400">{error}</p>;
    if (generatedImage) {
      return (
        <div className="max-w-2xl w-full">
          <img src={generatedImage} alt="Generated from prompt" className="rounded-lg shadow-2xl w-full" />
          <div className="mt-4 flex gap-4">
            <a href={generatedImage} download="generated-image.jpg" className="flex-1 text-center py-2 px-4 bg-zinc-700 hover:bg-zinc-600 rounded-md text-sm font-medium">Download Image</a>
            <button onClick={() => setGeneratedImage(null)} className="flex-1 text-center py-2 px-4 bg-green-500 hover:bg-green-600 text-zinc-900 rounded-md text-sm font-medium">Generate New Image</button>
          </div>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-4">
        {EXAMPLE_IMAGES.map((img) => (
          <div key={img.src} className="group relative cursor-pointer" onClick={() => setPrompt(img.prompt)}>
            <img src={img.src} alt={img.prompt} className="w-full h-auto rounded-lg aspect-square object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <p className="text-white text-xs">{img.prompt}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-150px)]">
      <div className="text-center pt-0 pb-6">
        <div className="inline-flex items-center justify-center bg-zinc-800 p-3 rounded-xl mb-4">
          <Icon name="imageGen" className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-4xl font-bold text-zinc-100">ImageGen</h2>
        <p className="text-zinc-400 mt-2 max-w-xl mx-auto">Let's create! Powered by the leading AI models, your creativity has no limits.</p>
      </div>
      
      <div className="flex-grow flex items-center justify-center p-4 overflow-y-auto">
        {renderContent()}
      </div>
      
      <div className="mt-auto p-3 bg-zinc-950/50 border-t border-zinc-800 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="relative">
            <textarea
              id="prompt-gen"
              rows={2}
              className="w-full bg-zinc-800 border-zinc-700 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-zinc-100 resize-none pr-28 pl-4 py-3"
              placeholder="Describe your image..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }}}
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || !prompt}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-semibold text-zinc-900 bg-green-500 hover:bg-green-600 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed"
            >
              Generate
              <Icon name="sparkles" className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
             {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  aspectRatio === ratio ? 'bg-zinc-600 text-zinc-100 font-semibold' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;