import React, { useState } from 'react';
import { ImageIcon, VideoIcon } from './components/icons';
import TabButton from './components/TabButton';
import { GeneratorTab } from './types';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GeneratorTab>(GeneratorTab.Image);

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-green-500">
            AI Media Generator
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Create stunning images and videos with the power of Gemini.
          </p>
        </header>

        <main>
          <div className="bg-gray-800 p-2 rounded-lg flex mb-6 max-w-md mx-auto">
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

          <div className="bg-gray-800 p-6 rounded-lg shadow-2xl">
            {activeTab === GeneratorTab.Image && <ImageGenerator />}
            {activeTab === GeneratorTab.Video && <VideoGenerator />}
          </div>
        </main>
        
        <footer className="text-center mt-8 text-gray-500 text-sm">
            Powered by Google Gemini
        </footer>
      </div>
    </div>
  );
};

export default App;
