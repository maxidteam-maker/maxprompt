import React, { useState, useContext, useEffect } from 'react';
import { ApiKeyContext } from '../context/ApiKeyContext';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const { apiKey, setApiKey } = useContext(ApiKeyContext);
  const [localKey, setLocalKey] = useState(apiKey || '');

  useEffect(() => {
    setLocalKey(apiKey || '');
  }, [apiKey, isOpen]);

  const handleSave = () => {
    setApiKey(localKey);
    onClose();
  };
  
  const handleClear = () => {
    setLocalKey('');
    setApiKey(null);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="relative bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-md p-6 sm:p-8"
        // Prevent clicks inside the modal from closing it
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors">&times;</button>
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">Set Your Google AI API Key</h2>
        <p className="text-zinc-400 mb-6 text-sm">
          To use this application, you need to provide your own Google AI API key. Your key is stored securely in your browser's local storage and is never sent to our servers.
        </p>
        <div className="space-y-4">
           <input
            type="password"
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
            placeholder="Enter your API key here"
            className="w-full bg-zinc-800 border-zinc-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-zinc-100 px-4 py-2"
          />
          <div className="flex flex-col sm:flex-row gap-3">
             <button
              onClick={handleSave}
              className="flex-1 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-zinc-900 bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-green-500"
            >
              Save and Close
            </button>
             <button
              onClick={handleClear}
              className="flex-1 py-2.5 px-4 rounded-md text-sm font-medium text-zinc-300 bg-zinc-700 hover:bg-zinc-600 focus:outline-none"
            >
              Clear Key
            </button>
          </div>
        </div>
         <p className="text-center text-xs text-zinc-500 mt-6">
          Don't have a key? Get one from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-green-400 underline">Google AI Studio</a>.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyModal;