import React from 'react';

interface GLMeterProps {
  totalGL: number;
}

export const GLMeter: React.FC<GLMeterProps> = ({ totalGL }) => {
  // Calculate position for the indicator (max scale of 30 for display)
  const maxScale = 30;
  const position = Math.min((totalGL / maxScale) * 100, 100);

  return (
    <div className="space-y-4">
      {/* GL Scale Bar */}
      <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
        {/* Color segments */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-green-400"></div>
          <div className="flex-1 bg-yellow-400"></div>
          <div className="flex-1 bg-red-400"></div>
        </div>
        
        {/* Scale markers */}
        <div className="absolute inset-0 flex items-center">
          <div className="absolute left-1/3 w-0.5 h-full bg-white opacity-60"></div>
          <div className="absolute left-2/3 w-0.5 h-full bg-white opacity-60"></div>
        </div>
        
        {/* Current value indicator */}
        <div 
          className="absolute top-0 h-full w-1 bg-gray-900 shadow-lg transition-all duration-700 ease-out"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
            <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap font-medium">
              {totalGL.toFixed(1)}
            </div>
            <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900 mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-gray-500 font-medium">
        <span>0</span>
        <span>10</span>
        <span>20</span>
        <span>30+</span>
      </div>
    </div>
  );
};