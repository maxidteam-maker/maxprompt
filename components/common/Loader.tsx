import React from 'react';

interface LoaderProps {
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = "Generating..." }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 p-4 bg-zinc-900/50 rounded-lg">
      <div className="w-8 h-8 border-4 border-t-green-500 border-zinc-700 rounded-full animate-spin"></div>
      <p className="text-zinc-400 text-sm font-medium">{text}</p>
    </div>
  );
};

export default Loader;