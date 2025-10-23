import React, { useState, useEffect } from 'react';
import { ImageIcon, VideoIcon } from './components/icons';
import TabButton from './components/TabButton';
import { GeneratorTab } from './types';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import ApiKeyModal from './components/ApiKeyModal';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GeneratorTab>(GeneratorTab.Image);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleApiKeySave = (key: string) => {
    if (key) {
      localStorage.setItem('gemini-api-key', key);
      setApiKey(key);
    }
  };

  if (!apiKey) {
    return <ApiKeyModal onKeySubmit={handleApiKeySave} />;
  }

  return (
    <div className="min-h-screen text-white p-4 sm:p-6 md:p-8 flex flex-col font-sans">
      <header className="text-center w-full max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-black uppercase text-lime-400 tracking-wider">
          MAXPROMPT
        </h1>
      </header>

      <main className="flex-grow flex flex-col items-center justify-start mt-8 w-full">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center p-6 mb-8 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
            <p className="font-bold">Selamat Datang di</p>
            <h2 className="text-3xl md:text-4xl font-bold text-lime-400">#TeknologiAkhirZaman</h2>
            <p className="mt-2 text-gray-300">Gunakan AI dengan bijak dan sebaik mungkin</p>
          </div>

          <div className="bg-black/20 backdrop-blur-md p-2 rounded-lg flex mb-6 max-w-md mx-auto">
            <TabButton
              label="Image"
              icon={<ImageIcon />}
              isActive={activeTab === GeneratorTab.Image}
              onClick={() => setActiveTab(GeneratorTab.Image)}
            />
            <TabButton
              label="Video"
              icon={<VideoIcon />}
              isActive={activeTab === GeneratorTab.Video}
              onClick={() => setActiveTab(GeneratorTab.Video)}
            />
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 sm:p-6 rounded-lg shadow-2xl transition-all duration-300">
            <div className={activeTab === GeneratorTab.Image ? 'block' : 'hidden'}>
              <ImageGenerator apiKey={apiKey} />
            </div>
            <div className={activeTab === GeneratorTab.Video ? 'block' : 'hidden'}>
              <VideoGenerator apiKey={apiKey} />
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center mt-8 text-gray-400 text-sm w-full max-w-4xl mx-auto">
        &copy; 2025 MAXPROMPT. Powered by Google Gemini.
      </footer>
    </div>
  );
};

export default App;