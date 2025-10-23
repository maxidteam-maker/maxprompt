import React, { useState, useContext } from 'react';
import { UploadedFile } from '../types';
import { fileToBase64 } from '../utils/fileUtils';
import { analyzeContent } from '../services/geminiService';
import Loader from './common/Loader';
import Icon from './common/Icon';
// @ts-ignore
import { Remarkable } from 'remarkable';
import { ApiKeyContext } from '../context/ApiKeyContext';

const md = new Remarkable({
  html: true,
  breaks: true,
  linkify: true,
});

const ContentAnalyzer: React.FC = () => {
  const { apiKey } = useContext(ApiKeyContext);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setUploadedFile({ file, base64, mimeType: file.type });
        setAnalysisResult(null);
        setError(null);
      } catch (err) {
        setError("Failed to read file.");
      }
    }
  };

  const handleSubmit = async () => {
    if (!apiKey) {
      setError("Please set your API key in the header before analyzing content.");
      return;
    }
    if (!uploadedFile || !prompt) {
      setError("Please upload a file and enter a question.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const result = await analyzeContent(uploadedFile.base64, uploadedFile.mimeType, prompt, apiKey);
      setAnalysisResult(result);
    } catch (err) {
      setError("Failed to analyze content. Please check your API key and try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderFilePreview = () => {
    if(!uploadedFile) return null;
    const url = URL.createObjectURL(uploadedFile.file);
    if(uploadedFile.mimeType.startsWith('image')) {
        return <img src={url} alt="Uploaded content" className="rounded-md max-h-64 mx-auto shadow-lg" />
    }
    if(uploadedFile.mimeType.startsWith('video')) {
        return <video src={url} controls className="rounded-md max-h-64 mx-auto shadow-lg" />
    }
    return <p className="text-zinc-400">Unsupported file type preview.</p>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-zinc-100">Content Analyzer</h2>
      <p className="text-zinc-400">Upload an image or video and ask Gemini questions about it.</p>
      
      <div className="space-y-4">
        <label htmlFor="analyzer-upload" className="block text-sm font-medium text-zinc-300">1. Upload Image or Video</label>
        <div className="mt-1 flex justify-center px-6 py-5 border-2 border-zinc-700 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <Icon name="upload" className="mx-auto h-12 w-12 text-zinc-500" />
            <div className="flex text-sm text-zinc-400">
              <label htmlFor="analyzer-upload" className="relative cursor-pointer bg-zinc-900 rounded-md font-medium text-green-400 hover:text-green-300">
                <span>Upload a file</span>
                <input id="analyzer-upload" name="analyzer-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,video/*" />
              </label>
            </div>
          </div>
        </div>

        {uploadedFile && (
          <div className="p-4 bg-zinc-800 rounded-lg">
            {renderFilePreview()}
          </div>
        )}

        <label htmlFor="analyzer-prompt" className="block text-sm font-medium text-zinc-300">2. Ask a Question</label>
        <textarea
          id="analyzer-prompt"
          rows={3}
          className="w-full bg-zinc-800 border-zinc-700 rounded-md text-zinc-100 focus:ring-green-500 focus:border-green-500"
          placeholder="e.g., What are the main objects in this image? or Summarize this video."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        
        <button
          onClick={handleSubmit}
          disabled={isLoading || !uploadedFile || !prompt}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 text-sm font-semibold text-zinc-900 bg-green-500 hover:bg-green-600 disabled:bg-zinc-700 disabled:text-zinc-400"
        >
          <Icon name="analyze" className="w-5 h-5" />
          {isLoading ? 'Analyzing...' : 'Analyze Content'}
        </button>
      </div>
      
      <div className="bg-zinc-800/50 rounded-lg min-h-[150px] p-6">
          <h3 className="text-lg font-semibold mb-2 text-zinc-100">Analysis Result</h3>
        {isLoading && <Loader text="Analyzing content..." />}
        {error && <p className="text-red-400">{error}</p>}
        {analysisResult && (
          <div 
            className="prose prose-sm prose-invert max-w-none text-zinc-300"
            dangerouslySetInnerHTML={{ __html: md.render(analysisResult) }}
          />
        )}
        {!isLoading && !analysisResult && !error && (
          <p className="text-zinc-500">The analysis from Gemini Pro will appear here.</p>
        )}
      </div>
    </div>
  );
};

export default ContentAnalyzer;