import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { ImageAspectRatio } from '../types';
import FileUpload from './FileUpload';
import Spinner from './Spinner';
import { SparklesIcon } from './icons';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>(ImageAspectRatio.Square);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt && !imageFile) {
      setError('Please describe the image or upload one to edit.');
      return;
    }
    setLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const imageUrl = await generateImage(prompt, aspectRatio, imageFile);
      setResultImage(imageUrl);
    } catch (err) {
       if (err instanceof Error) {
          if (err.message.toLowerCase().includes('quota')) {
              setError('Error: Kuota API Key Anda telah habis atau perlu aktivasi billing di akun Google Cloud Anda. Ini bukan kesalahan aplikasi, silakan periksa detail akun Google Anda.');
          } else {
              setError(err.message);
          }
      } else {
          setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const labelText = imageFile 
    ? "2. Describe Your Edit (Optional)" 
    : "1. Describe the Image to Generate";
  
  const buttonText = imageFile 
    ? (loading ? 'Editing Image...' : 'Generate Edited Image')
    : (loading ? 'Generating...' : 'Generate New Image');

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <FileUpload 
          onFileSelect={setImageFile}
          label="1. Upload Image (Optional for Editing)"
          disabled={loading}
        />
        
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
            {labelText}
          </label>
          <textarea
            id="prompt"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-lime-500 focus:outline-none transition"
            placeholder={imageFile ? "e.g., add sunglasses to the person" : "e.g., A cat wearing a wizard hat"}
            disabled={loading}
          />
        </div>

        <div>
           <label className={`block text-sm font-medium mb-2 transition-colors ${imageFile ? 'text-gray-500' : 'text-gray-300'}`}>
            Aspect Ratio {imageFile && '(Disabled during edit)'}
            </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.values(ImageAspectRatio).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => setAspectRatio(ratio)}
                disabled={loading || !!imageFile}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  aspectRatio === ratio
                    ? 'bg-lime-500 text-gray-900 ring-2 ring-lime-400'
                    : 'bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || (!prompt && !imageFile)}
          className="w-full flex justify-center items-center gap-2 bg-lime-500 hover:bg-lime-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {loading ? <Spinner className="w-6 h-6" /> : <SparklesIcon className="w-6 h-6" />}
          {buttonText}
        </button>
      </form>

      {error && <div className="mt-4 text-red-300 bg-red-900/50 p-4 rounded-lg text-sm">{error}</div>}


      {resultImage && (
        <div className="mt-6 animate-fade-in">
          <h3 className="text-lg font-semibold mb-2">Result:</h3>
          <div className="w-full overflow-hidden rounded-lg bg-gray-800/50">
            <img src={resultImage} alt="Generated" className="w-full h-full object-contain" />
          </div>
           <a
              href={resultImage}
              download={`maxprompt_${Date.now()}.png`}
              className="mt-4 inline-block w-full text-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Download Image
            </a>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
