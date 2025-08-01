import React from 'react';

interface GLMeterProps {
  totalGL: number;
}

export const GLMeter: React.FC<GLMeterProps> = ({ totalGL }) => {
  // Calculate position for the indicator (max scale of 30 for display)
  const maxScale = 30;
  const position = Math.min((totalGL / maxScale) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Enhanced GL Scale Bar */}
      <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400"></div>
        
        {/* Glow effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-300/50 via-yellow-300/50 to-red-300/50 animate-pulse"></div>
        
        {/* Scale markers with labels */}
        <div className="absolute inset-0 flex items-center">
          <div className="absolute left-1/3 w-0.5 h-full bg-white/80 shadow-sm"></div>
          <div className="absolute left-2/3 w-0.5 h-full bg-white/80 shadow-sm"></div>
        </div>
        
        {/* Dynamic current value indicator */}
        <div 
          className={`absolute top-0 h-full w-2 shadow-2xl transition-all duration-1000 ease-out rounded-full ${
            totalGL <= 10 ? 'bg-green-800 animate-success-bounce' : 
            totalGL > 20 ? 'bg-red-800 animate-warning-shake' : 'bg-yellow-800 animate-bounce-gentle'
          }`}
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          {/* Floating value tooltip */}
          <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 animate-bounce-in">
            <div className={`px-3 py-2 rounded-xl text-white text-sm font-bold shadow-xl ${
              totalGL <= 10 ? 'bg-green-600' : 
              totalGL > 20 ? 'bg-red-600' : 'bg-yellow-600'
            }`}>
              {totalGL.toFixed(1)}
            </div>
            <div className={`w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent mx-auto ${
              totalGL <= 10 ? 'border-t-green-600' : 
              totalGL > 20 ? 'border-t-red-600' : 'border-t-yellow-600'
            }`}></div>
          </div>
          
          {/* Indicator glow */}
          <div className={`absolute inset-0 rounded-full opacity-60 animate-ping ${
            totalGL <= 10 ? 'bg-green-400' : 
            totalGL > 20 ? 'bg-red-400' : 'bg-yellow-400'
          }`}></div>
        </div>
      </div>

      {/* Enhanced scale labels with descriptions */}
      <div className="flex justify-between items-center text-sm">
        <div className="text-center">
          <div className="font-bold text-green-600">0</div>
          <div className="text-xs text-gray-500 mt-1">Excellent</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-yellow-600">10</div>
          <div className="text-xs text-gray-500 mt-1">Low</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-orange-600">20</div>
          <div className="text-xs text-gray-500 mt-1">Moderate</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-red-600">30+</div>
          <div className="text-xs text-gray-500 mt-1">High</div>
        </div>
      </div>
      
      {/* Dynamic status message */}
      <div className="text-center animate-fade-in-delayed">
        {totalGL <= 10 && (
          <div className="flex items-center justify-center space-x-2 text-green-700 bg-green-50 rounded-full px-4 py-2">
            <span className="animate-bounce">🎯</span>
            <span className="font-medium">Great choice for blood sugar control!</span>
          </div>
        )}
        {totalGL > 10 && totalGL <= 20 && (
          <div className="flex items-center justify-center space-x-2 text-yellow-700 bg-yellow-50 rounded-full px-4 py-2">
            <span className="animate-bounce">⚖️</span>
            <span className="font-medium">Moderate impact - consider the suggestions below</span>
          </div>
        )}
        {totalGL > 20 && (
          <div className="flex items-center justify-center space-x-2 text-red-700 bg-red-50 rounded-full px-4 py-2">
            <span className="animate-bounce">⚠️</span>
            <span className="font-medium">High impact - check improvement tips below</span>
          </div>
        )}
      </div>
    </div>
  );
};