import React, { useState } from 'react';
import { AppTab } from '../types';
import ProductStudio from './ProductStudio';
import ImageGenerator from './ImageGenerator';
import VideoGenerator from './VideoGenerator';
import ContentAnalyzer from './ContentAnalyzer';
import ProductStudioPlus from './ProductStudioPlus';

interface MainAppProps {
  initialTab: AppTab;
}

const MainApp: React.FC<MainAppProps> = ({ initialTab }) => {
  const [activeTab, setActiveTab] = useState<AppTab>(initialTab);

  const TABS: { id: AppTab; label: string; icon: any }[] = [
    { id: 'generate', label: 'ImageGen', icon: 'generate' },
    { id: 'studio', label: 'ImageEdit', icon: 'studio' },
    { id: 'studioPlus', label: 'Product + Model', icon: 'studioPlus' },
    { id: 'video', label: 'VideoGen', icon: 'video' },
    { id: 'analyze', label: 'Content Analyzer', icon: 'analyze' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'studio':
        return <ProductStudio />;
      case 'studioPlus':
        return <ProductStudioPlus />;
      case 'generate':
        return <ImageGenerator />;
      case 'video':
        return <VideoGenerator />;
      case 'analyze':
        return <ContentAnalyzer />;
      default:
        return <ImageGenerator />;
    }
  };

  return (
    <div>
      <div className="border-b border-zinc-800 bg-zinc-900">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-6 -mb-px overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 text-sm font-medium transition-colors focus:outline-none whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-zinc-100 border-b-2 border-green-500'
                  : 'text-zinc-400 hover:text-zinc-100 border-b-2 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default MainApp;