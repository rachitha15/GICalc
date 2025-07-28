import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`w-11 h-11 flex items-center justify-center rounded-xl hover:scale-110 transition-transform duration-200 ${className}`}
    >
      <ArrowLeft size={24} className="text-secondary" />
    </button>
  );
};