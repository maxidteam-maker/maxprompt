import React, { useState, useEffect, useContext } from 'react';
import { UploadedFile, AspectRatio } from '../types';
import { fileToBase64 } from '../utils/fileUtils';
import { combineImagesWithText, generatePromptForImages } from '../services/geminiService';
import Loader from './common/Loader';
import Icon from './common/Icon';
import { ApiKeyContext } from '../context/ApiKeyContext';

// A reusable file upload component for this page
const FileUploader: React.FC<{ onFileUpload: (file: UploadedFile) => void; uploadedFile: UploadedFile | null; title: string; id: string; }> = ({ onFileUpload, uploadedFile, title, id }) => {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        onFileUpload({ file, base64, mimeType: file.type });
      } catch (err) {
        console.error("Failed to read file.", err);
      }
    }
  };

  return (
    <div className="flex-1">
      <label className="block text-sm font-medium text-zinc-300 mb-2">{title}</label>
      {uploadedFile ? (
        <div className="p-2 bg-zinc-800 rounded-lg text-center">
          <img src={URL.createObjectURL(uploadedFile.file)} alt="Uploaded" className="rounded-md max-h-40 mx-auto" />
          <p className="text-xs text-zinc-400 mt-2 truncate">{uploadedFile.file.name}</p>
        </div>
      ) : (
        <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-700 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <Icon name="upload" className="mx-auto h-10 w-10 text-zinc-500" />
            <div className="flex text-sm text-zinc-400">
              <label htmlFor={id} className="relative cursor-pointer bg-zinc-900 rounded-md font-medium text-green-400 hover:text-green-300">
                <span>Upload a file</span>
                <input id={id} name={id} type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const ProductStudioPlus: React.FC = () => {
  const { apiKey } = useContext(ApiKeyContext);
  const [modelFile, setModelFile] = useState<UploadedFile | null>(null);
  const [productFile, setProductFile] = useState<UploadedFile | null>(null);
  const [promptMode, setPromptMode] = useState<'auto' | 'manual'>('auto');
  const [manualPrompt, setManualPrompt] = useState<string>('');
  const [autoPrompt, setAutoPrompt] = useState<string | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ASPECT_RATIOS: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4'];

  const handleGeneratePrompt = async () => {
    if (!modelFile || !productFile || !apiKey) return;
    setIsGeneratingPrompt(true);
    setError(null);
    setAutoPrompt(null);
    try {
        const generated = await generatePromptForImages(modelFile.base64, modelFile.mimeType, productFile.base64, productFile.mimeType, apiKey);
        setAutoPrompt(generated);
    } catch (err) {
        setError("Could not generate a prompt automatically. Please check your API key or write one manually.");
        setPromptMode('manual');
    } finally {
        setIsGeneratingPrompt(false);
    }
  };

  useEffect(() => {
    if (modelFile && productFile && promptMode === 'auto' && apiKey) {
      handleGeneratePrompt();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelFile, productFile, promptMode, apiKey]);

  const handleSubmit = async () => {
    if (!apiKey) {
      setError("Please set your API key in the header before generating.");
      return;
    }
    const finalPrompt = promptMode === 'auto' ? autoPrompt : manualPrompt;

    if (!modelFile || !productFile || !finalPrompt) {
      setError("Please upload a model, a product, and ensure there is a prompt.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const resultBase64 = await combineImagesWithText(
        modelFile.base64,
        modelFile.mimeType,
        productFile.base64,
        productFile.mimeType,
        finalPrompt,
        aspectRatio,
        apiKey
      );
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
      <h2 className="text-3xl font-bold text-zinc-100">Product + Model Generator</h2>
      <p className="text-zinc-400">Upload an image of a model and a product, and we'll merge them into a professional lifestyle photo.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <FileUploader id="model-upload" title="1. Upload Model Image" uploadedFile={modelFile} onFileUpload={setModelFile} />
            <FileUploader id="product-upload" title="2. Upload Product Image" uploadedFile={productFile} onFileUpload={setProductFile} />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">3. Describe The Scene</label>
            <div className="flex items-center gap-4 mb-3">
              {(['auto', 'manual'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setPromptMode(mode)}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    promptMode === mode
                      ? 'bg-green-500 text-zinc-900 font-semibold'
                      : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                  }`}
                >
                  {mode === 'auto' ? '🤖 Auto Prompt' : '✍️ Manual Prompt'}
                </button>
              ))}
            </div>

            {promptMode === 'auto' ? (
              <div className="relative">
                <textarea
                  rows={3}
                  className="w-full bg-zinc-800 border-zinc-700 rounded-md text-zinc-300 resize-none"
                  placeholder={
                    isGeneratingPrompt 
                      ? "Generating creative prompt..." 
                      : (modelFile && productFile ? "Auto-generated prompt will appear here." : "Upload both images to generate a prompt.")
                  }
                  value={isGeneratingPrompt ? "" : autoPrompt || ''}
                  readOnly
                />
                {(isGeneratingPrompt) && <div className="absolute inset-0 flex items-center justify-center"><Loader text="" /></div>}
                {autoPrompt && !isGeneratingPrompt && (
                  <button onClick={handleGeneratePrompt} className="absolute bottom-2 right-2 text-xs bg-zinc-600 hover:bg-zinc-500 p-1.5 rounded-md">Regenerate</button>
                )}
              </div>
            ) : (
              <textarea
                rows={3}
                className="w-full bg-zinc-800 border-zinc-700 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-zinc-100"
                placeholder="e.g., A model with curly hair smiling while holding the product."
                value={manualPrompt}
                onChange={(e) => setManualPrompt(e.target.value)}
              />
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">4. Select Aspect Ratio</label>
            <div className="flex flex-wrap gap-2">
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


          <button
            onClick={handleSubmit}
            disabled={isLoading || !modelFile || !productFile || !(promptMode === 'auto' ? autoPrompt : manualPrompt)}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-zinc-900 bg-green-500 hover:bg-green-600 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed"
          >
            <Icon name="sparkles" className="w-5 h-5" />
            {isLoading ? 'Generating...' : 'Generate Image'}
          </button>
        </div>
        
        <div className="flex items-center justify-center bg-zinc-800/50 rounded-lg min-h-[300px] p-4">
          {isLoading && <Loader text="Placing your product in the scene..." />}
          {error && <p className="text-red-400">{error}</p>}
          {generatedImage && (
            <div className="w-full">
                <img src={generatedImage} alt="Generated lifestyle" className="rounded-lg shadow-2xl w-full" />
                <a href={generatedImage} download="lifestyle-photo.jpg" className="mt-4 inline-block w-full text-center py-2 px-4 bg-zinc-700 hover:bg-zinc-600 rounded-md text-sm font-medium">Download Image</a>
            </div>
          )}
          {!isLoading && !generatedImage && !error && (
            <p className="text-zinc-500">Your generated lifestyle image will appear here</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductStudioPlus;