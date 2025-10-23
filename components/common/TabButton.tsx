
import React, { ReactNode } from 'react';
import Icon from './Icon';
import { AppTab } from '../../types';

interface TabButtonProps {
  label: string;
  iconName: any;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, iconName, isActive, onClick }) => {
  const baseClasses = "flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500";
  const activeClasses = "bg-gray-700 text-white shadow-sm";
  const inactiveClasses = "text-gray-400 hover:bg-gray-800 hover:text-white";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      <Icon name={iconName} className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
};

export default TabButton;
