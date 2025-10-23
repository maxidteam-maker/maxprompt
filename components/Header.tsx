import React from 'react';
import Icon from './common/Icon';

interface HeaderProps {
    onLogoClick: () => void;
    onApiKeyClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick, onApiKeyClick }) => {
  return (
    <header className="bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={onLogoClick}
          >
             <div className="bg-green-500 p-1.5 rounded-lg">
                <Icon name="sparkles" className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">MAXPROMPT</h1>
          </div>
          <nav className="flex items-center space-x-4">
             <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">Help</a>
            <button 
              onClick={onApiKeyClick}
              className="px-4 py-1.5 text-sm font-semibold text-zinc-100 bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-green-500"
            >
              Set API Key
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;