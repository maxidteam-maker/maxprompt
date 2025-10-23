import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import MainApp from './components/MainApp';
import Header from './components/Header';
import { AppTab } from './types';
import { ApiKeyProvider } from './context/ApiKeyContext';
import ApiKeyModal from './components/ApiKeyModal';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [initialTab, setInitialTab] = useState<AppTab>('studio');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectTool = (tool: AppTab) => {
    setInitialTab(tool);
    setShowLanding(false);
  };

  const mainContent = showLanding ? (
    <LandingPage onSelectTool={handleSelectTool} onLoginClick={() => setIsModalOpen(true)} />
  ) : (
    <div className="bg-zinc-900 text-zinc-200 min-h-screen font-sans">
      <Header onLogoClick={() => setShowLanding(true)} onApiKeyClick={() => setIsModalOpen(true)} />
      <main>
        <MainApp initialTab={initialTab} />
      </main>
    </div>
  );

  return (
    <ApiKeyProvider>
        {mainContent}
        <ApiKeyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </ApiKeyProvider>
  );
};

export default App;