import React, { useState } from 'react';

interface ApiKeyModalProps {
  onKeySubmit: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 font-sans">
      <div className="bg-white/10 backdrop-blur-2xl rounded-lg shadow-xl max-w-md w-full m-4 p-6 text-white border border-white/20">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-4 text-lime-400">Enter Your API Key</h2>
          <p className="text-gray-200 mb-4">
            To use MAXPROMPT, please provide your Google AI Studio API key. Your key will be saved securely in your browser's local storage.
          </p>
          <div className="mb-4">
            <label htmlFor="apiKey" className="sr-only">
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-gray-900/50 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-lime-500 focus:border-lime-500 transition"
              placeholder="Paste your Gemini API Key here"
              required
            />
          </div>
          <p className="text-gray-300 mb-6 text-sm">
            Don't have a key?{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lime-400 hover:text-lime-500 underline"
            >
              Get one from Google AI Studio
            </a>.
          </p>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-lime-500 text-gray-900 font-semibold hover:bg-lime-600 transition disabled:bg-gray-600"
              disabled={!apiKey.trim()}
            >
              Save & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;