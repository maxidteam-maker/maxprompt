import React from 'react';

interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, icon, isActive, onClick }) => {
  const baseClasses = "flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-lime-500";
  const activeClasses = "bg-white/20 text-white";
  const inactiveClasses = "bg-transparent text-gray-300 hover:bg-white/10";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      {label}
    </button>
  );
};

export default TabButton;