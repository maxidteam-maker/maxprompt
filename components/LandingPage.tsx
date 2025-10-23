import React from 'react';
import { AppTab } from '../types';

interface LandingPageProps {
  onSelectTool: (tool: AppTab) => void;
  onLoginClick: () => void;
}

interface ToolCardProps {
  title: string;
  description: string;
  onClick: () => void;
  tag?: string;
  className?: string;
}

const ToolCard: React.FC<ToolCardProps> = ({ title, description, tag, onClick, className = '' }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-zinc-800/50 border border-zinc-700/80 rounded-2xl p-4 sm:p-6 flex flex-col group cursor-pointer transition-all duration-300 hover:bg-zinc-800 hover:-translate-y-1 ${className}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-zinc-100 text-base sm:text-lg">{title}</h3>
        {tag && <span className="text-xs bg-green-500 text-zinc-900 font-bold px-2 py-1 rounded-full">{tag}</span>}
      </div>
      <div className="flex-grow flex items-start">
        <p className="text-sm text-zinc-400 text-left">{description}</p>
      </div>
    </div>
  );
};


const LandingPage: React.FC<LandingPageProps> = ({ onSelectTool, onLoginClick }) => {
  const tools: { id: AppTab; title: string; tag?: string; description: string; }[] = [
    { id: 'studio', title: 'Foto Produk', tag: 'Nano Banana', description: 'Unggah foto produk Anda dan biarkan AI mengubahnya menjadi gambar studio profesional.' },
    { id: 'studioPlus', title: 'Foto Produk + Model', tag: 'Baru', description: 'Gabungkan foto model dan produk Anda untuk membuat foto gaya hidup yang menarik.' },
    { id: 'generate', title: 'Edit Foto AI', tag: 'Imagen 4.0', description: 'Edit gambar Anda dengan mudah menggunakan perintah teks sederhana.' },
    { id: 'video', title: 'Video Pemasaran', tag: 'Veo 3.1', description: 'Ubah gambar produk Anda menjadi video pemasaran singkat yang dinamis.' },
  ];

  return (
    <div className="relative min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden">
      <div className="absolute inset-0 bg-grid-zinc-700/10 [mask-image:linear-gradient(to_bottom,white_5%,transparent_80%)]"></div>
      <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-green-500/10 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-50"></div>
      
      <div className="relative z-10 text-center w-full max-w-5xl mx-auto">
        <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tighter text-green-400 [text-shadow:0_0_10px_theme(colors.green.400/0.8),0_0_20px_theme(colors.green.500/0.6)]">
          MAXPROMPT
        </h1>
        <p className="mt-1 text-base text-zinc-400 max-w-md mx-auto">
          Buat produk <span className="text-green-400 font-semibold">UMKM</span> mu jadi kalcer & profesional
        </p>
        
        <div className="mt-8 mb-10">
            <button 
                onClick={onLoginClick}
                className="px-8 py-3 bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-full text-green-300 font-semibold transition-all duration-300 hover:bg-green-500/20 hover:shadow-lg hover:shadow-green-500/20 hover:scale-105">
                Login
            </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map(tool => (
            <ToolCard
              key={tool.id}
              title={tool.title}
              description={tool.description}
              tag={tool.tag}
              onClick={() => onSelectTool(tool.id)}
            />
          ))}
        </div>
      </div>

      <footer className="absolute bottom-1 text-center w-full text-xs text-zinc-500z-20">
        <p>&copy; {new Date().getFullYear()} MAXPROMPT | dibuat dengan hati by:Maxadam</p>
      </footer>
    </div>
  );
};

export default LandingPage;