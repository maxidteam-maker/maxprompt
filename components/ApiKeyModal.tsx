import React from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectKey: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSelectKey }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" aria-modal="true" role="dialog">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full m-4 p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">API Key Required</h2>
        <p className="text-gray-300 mb-4">
          To generate videos with Veo, you need to select a Google AI Studio API key associated with a project that has billing enabled.
        </p>
        <p className="text-gray-400 mb-6 text-sm">
          For more information about billing, please visit the{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lime-400 hover:text-lime-500 underline"
          >
            official documentation
          </a>.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={onSelectKey}
            className="px-4 py-2 rounded-md bg-lime-500 text-gray-900 font-semibold hover:bg-lime-600 transition"
          >
            Select API Key
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
