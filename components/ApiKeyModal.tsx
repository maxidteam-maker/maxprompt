import React, { useState } from 'react';

interface ApiKeyModalProps {
  onKeySubmit: (apiKey: string) => void;
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-2xl p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-2">Enter Your Gemini API Key</h2>
        <p className="text-gray-300 mb-4 text-sm">
          To use MAXPROMPT, you need a Google Gemini API key. It will be stored securely in your browser.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500 transition"
            placeholder="Your Google AI Studio API Key"
            required
          />
          <div className="text-xs text-gray-400 bg-gray-900/30 p-3 rounded-lg">
            <span className="font-bold text-amber-400">Penting:</span> API Key Anda tunduk pada kuota dan batas penggunaan dari Google. Beberapa fitur canggih mungkin memerlukan akun dengan <span className="font-semibold text-white">tagihan (billing) yang aktif</span>.
          </div>
          <button
            type="submit"
            className="w-full bg-lime-500 hover:bg-lime-600 disabled:bg-gray-600 text-gray-900 font-bold py-2.5 px-4 rounded-lg transition-colors"
          >
            Save and Continue
          </button>
            <div className="text-center mt-2">
                <a 
                href="https://ai.google.dev/gemini-api/docs/api-key" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-lime-400 hover:text-lime-300 underline"
                >
                Bagaimana cara mendapatkan API Key?
                </a>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;
