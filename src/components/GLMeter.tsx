import React from 'react';

interface GLMeterProps {
  value: number;
  maxValue?: number;
}

export const GLMeter: React.FC<GLMeterProps> = ({ value, maxValue = 30 }) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  const getColor = (gl: number) => {
    if (gl <= 10) return 'from-green-400 to-green-600';
    if (gl <= 20) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const getLabel = (gl: number) => {
    if (gl <= 10) return 'Excellent';
    if (gl <= 20) return 'Moderate';
    return 'High';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
        <span>0</span>
        <span className="font-bold text-lg text-gray-800">{getLabel(value)}</span>
        <span>{maxValue}+</span>
      </div>
      
      <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full bg-gradient-to-r ${getColor(value)} transition-all duration-1000 ease-out relative overflow-hidden`}
          style={{ width: `${percentage}%` }}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
        
        {/* Value indicator */}
        <div
          className="absolute top-0 h-full w-1 bg-white shadow-lg transition-all duration-1000"
          style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>Low (0-10)</span>
        <span>Medium (11-20)</span>
        <span>High (20+)</span>
      </div>
    </div>
  );
};