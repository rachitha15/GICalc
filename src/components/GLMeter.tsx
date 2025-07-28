import React from 'react';
import { motion } from 'framer-motion';

interface GLMeterProps {
  glScore: number;
  animated?: boolean;
}

const getGLCategory = (gl: number) => {
  if (gl <= 10) return { label: 'Low Impact', color: '#06B6D4', bgColor: '#CFFAFE' };
  if (gl <= 19) return { label: 'Moderate Impact', color: '#F59E0B', bgColor: '#FFFBEB' };
  return { label: 'High Impact', color: '#DC2626', bgColor: '#FEF2F2' };
};

export const GLMeter: React.FC<GLMeterProps> = ({ glScore, animated = true }) => {
  const category = getGLCategory(glScore);
  const percentage = Math.min((glScore / 30) * 100, 100); // Cap at 30 for display

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 mb-4">
        <svg
          width="128"
          height="64"
          viewBox="0 0 128 64"
          className="transform rotate-0"
        >
          {/* Background arc */}
          <path
            d="M 16 48 A 48 48 0 0 1 112 48"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Colored arc */}
          <motion.path
            d="M 16 48 A 48 48 0 0 1 112 48"
            fill="none"
            stroke={category.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="150"
            strokeDashoffset={animated ? 150 : 150 - (percentage * 1.5)}
            initial={animated ? { strokeDashoffset: 150 } : undefined}
            animate={animated ? { strokeDashoffset: 150 - (percentage * 1.5) } : undefined}
            transition={animated ? { duration: 1, ease: "easeOut", delay: 0.3 } : undefined}
          />
          
          {/* Center dot */}
          <circle
            cx="64"
            cy="48"
            r="3"
            fill={category.color}
          />
        </svg>
        
        {/* Needle */}
        <motion.div
          className="absolute top-11 left-1/2 origin-bottom w-0.5 h-6 bg-gray-700 rounded-full"
          style={{ transformOrigin: 'bottom center' }}
          initial={animated ? { rotate: -90 } : { rotate: -90 + (percentage * 1.8) }}
          animate={animated ? { rotate: -90 + (percentage * 1.8) } : undefined}
          transition={animated ? { duration: 1, ease: "easeOut", delay: 0.5 } : undefined}
        />
      </div>
      
      <div className="text-center">
        <div className="text-sm font-medium text-text-secondary">
          {category.label}
        </div>
      </div>
    </div>
  );
};