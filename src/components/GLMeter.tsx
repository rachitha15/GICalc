import React from 'react';

interface GLMeterProps {
  totalGL: number;
}

export const GLMeter: React.FC<GLMeterProps> = ({ totalGL }) => {
  // Determine color classes based on GL value

  const getGLColorClasses = (gl: number) => {
    if (gl <= 10) return 'bg-gl-low';
    if (gl <= 20) return 'bg-gl-medium';
    return 'bg-gl-high';
  };

  const getGLLabel = (gl: number) => {
    if (gl <= 10) return 'Low';
    if (gl <= 20) return 'Medium';
    return 'High';
  };

  // Calculate position for the indicator (max scale of 30 for display)
  const maxScale = 30;
  const position = Math.min((totalGL / maxScale) * 100, 100);

  return (
    <div className="space-y-3">
      {/* GL Scale Bar */}
      <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
        {/* Color segments */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-gl-low"></div>
          <div className="flex-1 bg-gl-medium"></div>
          <div className="flex-1 bg-gl-high"></div>
        </div>
        
        {/* Scale markers */}
        <div className="absolute inset-0 flex items-center">
          <div className="absolute left-1/3 w-0.5 h-full bg-white opacity-60"></div>
          <div className="absolute left-2/3 w-0.5 h-full bg-white opacity-60"></div>
        </div>
        
        {/* Current value indicator */}
        <div 
          className="absolute top-0 h-full w-1 bg-gray-800 shadow-md transition-all duration-500 ease-out"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {totalGL.toFixed(1)}
            </div>
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-gray-600">
        <span>0</span>
        <span>10</span>
        <span>20</span>
        <span>30+</span>
      </div>

      {/* Status indicator */}
      <div className="flex items-center justify-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${getGLColorClasses(totalGL)}`}></div>
        <span className="text-sm font-medium text-gray-700">
          {getGLLabel(totalGL)} Glycemic Load
        </span>
      </div>
    </div>
  );
};