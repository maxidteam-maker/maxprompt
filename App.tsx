import React, { useState, useCallback } from 'react';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import TabButton from './components/TabButton';
import { GeneratorTab } from './types';
import { ImageIcon, VideoIcon } from './components/icons';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GeneratorTab>(GeneratorTab.Image);

  const handleTabChange = useCallback((tab: GeneratorTab) => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-wider text-lime-400">
          MAXPROMPT
        </h1>
      </header>

      <main className="w-full max-w-4xl flex flex-col items-center">
        <div className="w-full max-w-sm p-1.5 bg-[#1F1F1F] rounded-xl flex items-center justify-center gap-2 mb-8">
          <TabButton
            label="Generate Image"
            icon={<ImageIcon className="w-5 h-5" />}
            isActive={activeTab === GeneratorTab.Image}
            onClick={() => handleTabChange(GeneratorTab.Image)}
          />
          <TabButton
            label="Generate Video"
            icon={<VideoIcon className="w-5 h-5" />}
            isActive={activeTab === GeneratorTab.Video}
            onClick={() => handleTabChange(GeneratorTab.Video)}
          />
        </div>

        <div className="w-full border border-dashed border-gray-700 rounded-2xl p-6 md:p-8">
            <div className="text-center text-gray-300 mb-6">
                <p className="text-lg font-bold">Selamat Datang di</p>
                <p className="text-2xl font-bold text-lime-400 my-1">#TeknologiAkhirZaman</p>
                <p className="text-gray-400 text-sm">Gunakan AI dengan bijak dan sebaik mungkin</p>
            </div>
          <div className={activeTab === GeneratorTab.Image ? 'block' : 'hidden'}>
            <ImageGenerator />
          </div>
          <div className={activeTab === GeneratorTab.Video ? 'block' : 'hidden'}>
            <VideoGenerator />
          </div>
        </div>
      </main>

      <footer className="w-full max-w-4xl text-center mt-12 text-gray-500">
        <p>&copy; {new Date().getFullYear()} MAXPROMPT. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
};

export default App;