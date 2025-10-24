import React, { useState, useEffect, useContext, useCallback } from 'react';
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
  
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ASPECT_RATIOS: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4'];

  const handleGeneratePrompt = useCallback(async () => {
    if (!modelFile || !productFile || !apiKey) return;
    setIsGeneratingPrompt(true);
    setError(null);
    setAutoPrompt(''); // Clear previous prompt
    try {
        const generated = await generatePromptForImages(modelFile.base64, modelFile.mimeType, productFile.base64, productFile.mimeType, apiKey);
        setAutoPrompt(generated);
    } catch (err: any) {
        let errorMessage = "Error: Could not generate a prompt. Please check your API key or write one manually.";
         if (err && err.message) {
            if (err.message.includes('suspended')) {
                errorMessage = "Error: Your API key has been suspended. Please use a valid key.";
            } else if (err.message.includes('Permission denied')) {
                errorMessage = "Error: Permission denied. Your API key might not be valid.";
            }
        }
        setAutoPrompt(errorMessage);
        setError("Auto prompt generation failed.");
    } finally {
        setIsGeneratingPrompt(false);
    }
  }, [apiKey, modelFile, productFile]);

  useEffect(() => {
    if (promptMode !== 'auto') return;
    
    // Clear previous state when files change in auto mode
    setAutoPrompt(null);
    setError(null);

    if (modelFile && productFile) {
      if (!apiKey) {
        setAutoPrompt("Error: Please set your API key in the header to use Auto Prompt.");
        return;
      }
      handleGeneratePrompt();
    }
  }, [modelFile, productFile, promptMode, apiKey, handleGeneratePrompt]);


  const handleSubmit = async () => {
    if (!apiKey) {
      setError("Please set your API key in the header before generating.");
      return;
    }
    const finalPrompt = promptMode === 'auto' ? autoPrompt : manualPrompt;

    if (!modelFile || !productFile || !finalPrompt || finalPrompt.startsWith('Error:')) {
      setError("Please upload a model, a product, and ensure there is a valid prompt.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const resultBase64Array = await combineImagesWithText(
        modelFile.base64,
        modelFile.mimeType,
        productFile.base64,
        productFile.mimeType,
        finalPrompt,
        aspectRatio,
        apiKey
      );
      setGeneratedImages(resultBase64Array.map(b64 => `data:image/jpeg;base64,${b64}`));
    } catch (err: any {
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
  
  const hasAutoPromptError = autoPrompt?.startsWith('Error:');

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
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
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
                  className={`w-full bg-zinc-800 border rounded-md resize-none transition-colors ${
                    hasAutoPromptError ? 'border-red-500/50 text-red-400' : 'border-zinc-700 text-zinc-300'
                  }`}
                  placeholder={
                    isGeneratingPrompt 
                      ? "Generating creative prompt..." 
                      : (modelFile && productFile ? "Auto-generated prompt will appear here." : "Upload both images to generate a prompt.")
                  }
                  value={autoPrompt || ''}
                  readOnly
                />
                {(isGeneratingPrompt) && <div className="absolute inset-0 flex items-center justify-center"><Loader text="" /></div>}
                {autoPrompt && !isGeneratingPrompt && !hasAutoPromptError && (
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
            disabled={isLoading || !modelFile || !productFile || !(promptMode === 'auto' ? autoPrompt && !hasAutoPromptError : manualPrompt)}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-zinc-900 bg-green-500 hover:bg-green-600 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed"
          >
            <Icon name="sparkles" className="w-5 h-5" />
            {isLoading ? 'Generating...' : 'Generate Image'}
          </button>
        </div>
        
        <div className="flex items-center justify-center bg-zinc-800/50 rounded-lg min-h-[300px] p-4">
          {isLoading && <Loader text="Placing your product in the scene..." />}
          {error && <p className="text-red-400">{error}</p>}
          {generatedImages.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {generatedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img src={image} alt={`Generated variation ${index + 1}`} className="rounded-lg shadow-lg w-full" />
                  <a href={image} download={`lifestyle-photo-${index + 1}.jpg`} className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/50 text-white p-1.5 rounded-full hover:bg-zinc-900">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </a>
                </div>
              ))}
            </div>
          )}
          {!isLoading && generatedImages.length === 0 && !error && (
            <p className="text-zinc-500">Your generated lifestyle image will appear here</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductStudioPlus;