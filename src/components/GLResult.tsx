import React from 'react';
import { GLCalculationResult } from '../api';
import { GLMeter } from './GLMeter';

interface GLResultProps {
  result: GLCalculationResult;
  onStartOver: () => void;
}

export const GLResult: React.FC<GLResultProps> = ({ result, onStartOver }) => {
  const { total_gl, items } = result;

  const getGLCategory = (gl: number) => {
    if (gl <= 10) return { 
      label: 'Low', 
      bgColor: 'bg-green-100', 
      textColor: 'text-green-800',
      borderColor: 'border-green-400',
      cardBg: 'bg-green-50',
      description: 'Great choice! This meal has minimal blood sugar impact.' 
    };
    if (gl <= 20) return { 
      label: 'Medium', 
      bgColor: 'bg-yellow-100', 
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-400',
      cardBg: 'bg-yellow-50',
      description: 'Moderate impact. Consider pairing with protein or fiber.' 
    };
    return { 
      label: 'High', 
      bgColor: 'bg-red-100', 
      textColor: 'text-red-800',
      borderColor: 'border-red-400',
      cardBg: 'bg-red-50',
      description: 'High impact. Consider smaller portions or adding protein/fiber.' 
    };
  };

  const category = getGLCategory(total_gl);

  return (
    <div className="w-full space-y-6">
      {/* Revolutionary Result Header */}
      <div className={`bg-gradient-to-br from-white/95 via-white/90 to-white/85 backdrop-blur-sm rounded-3xl shadow-2xl p-10 text-center relative overflow-hidden border border-white/20 ${
        total_gl <= 10 ? 'animate-celebration' : 
        total_gl > 20 ? 'animate-warning-shake' : ''
      }`}>
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          {total_gl <= 10 && (
            <div className="absolute inset-0 bg-green-400 animate-pulse"></div>
          )}
          {total_gl > 20 && (
            <div className="absolute inset-0 bg-red-400 animate-pulse"></div>
          )}
        </div>
        
        {/* Floating particles for low GL */}
        {total_gl <= 10 && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 w-2 h-2 bg-green-400 rounded-full animate-bounce opacity-60"></div>
            <div className="absolute top-8 right-8 w-1 h-1 bg-green-500 rounded-full animate-bounce animation-delay-200 opacity-60"></div>
            <div className="absolute bottom-6 left-12 w-2 h-2 bg-emerald-400 rounded-full animate-bounce animation-delay-100 opacity-60"></div>
          </div>
        )}
        
        {/* Warning indicators for high GL */}
        {total_gl > 20 && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 right-4 text-red-400 animate-pulse text-xl">⚠️</div>
            <div className="absolute bottom-4 left-4 text-orange-400 animate-pulse text-lg">🔥</div>
          </div>
        )}

        <div className="relative z-10">
          <div className="mb-6">
            {/* Dynamic Icon with Celebration */}
            <div className={`relative mx-auto mb-4 ${
              total_gl <= 10 ? 'animate-celebration' : 
              total_gl > 20 ? 'animate-warning-shake' : 'animate-bounce-gentle'
            }`}>
              <div className={`${category.bgColor} rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-xl border-4 ${
                total_gl <= 10 ? 'border-green-200' : 
                total_gl > 20 ? 'border-red-200' : 'border-yellow-200'
              }`}>
                <span className="text-3xl">
                  {total_gl <= 10 ? '🎉' : total_gl <= 20 ? '⚠️' : '🚨'}
                </span>
              </div>
              {/* Glow effect for low GL */}
              {total_gl <= 10 && (
                <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-ping"></div>
              )}
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">
              {total_gl <= 10 ? '🌟 Excellent Choice!' : 
               total_gl <= 20 ? 'Your Meal\'s Impact' : '⚠️ High Impact Alert'}
            </h2>
          </div>
          
          <div className="mb-8">
            <div className={`text-5xl font-bold mb-3 animate-zoom-in ${
              total_gl <= 10 ? 'text-green-600' : 
              total_gl > 20 ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {total_gl.toFixed(1)}
            </div>
            <div className={`inline-block px-6 py-3 rounded-full font-bold text-base shadow-lg ${category.bgColor} ${category.textColor} animate-bounce-in`}>
              {category.label} Glycemic Load
            </div>
            
            {/* Dynamic messages */}
            <div className="mt-4 animate-fade-in-delayed">
              {total_gl <= 10 && (
                <p className="text-green-700 font-semibold text-lg">
                  🎯 Perfect for steady energy levels!
                </p>
              )}
              {total_gl > 10 && total_gl <= 20 && (
                <p className="text-yellow-700 font-semibold text-lg">
                  ⚖️ Moderate impact - check the suggestions below
                </p>
              )}
              {total_gl > 20 && (
                <p className="text-red-700 font-semibold text-lg">
                  🚨 High impact - see improvement tips below
                </p>
              )}
            </div>
          </div>
          
          <GLMeter totalGL={total_gl} />
        </div>
      </div>



      {/* Food Breakdown */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Breakdown by Food</h3>
        
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{item.food}</span>
                {item.status === 'ai_estimated' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                    AI
                  </span>
                )}
              </div>
              <span className="font-bold text-gray-900">{item.gl.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI-Powered Suggestions */}
      {result.suggestions && result.suggestions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💡 Smart Suggestions
          </h3>
          <div className="space-y-4">
            {result.suggestions.map((suggestion, index) => (
              <div key={index} className="border-l-4 border-blue-400 pl-4 py-2">
                <p className="text-gray-900 font-medium mb-1">{suggestion.text}</p>
                <p className="text-sm text-gray-600">{suggestion.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback recommendations if no AI suggestions */}
      {(!result.suggestions || result.suggestions.length === 0) && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💡 Quick Tips
          </h3>
          <div className="space-y-3">
            {result.total_gl > 20 ? (
              <>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Consider smaller portions to reduce impact</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Add vegetables or salad to slow absorption</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Pair with protein, fiber, or healthy fats</p>
                </div>
              </>
            ) : result.total_gl > 10 ? (
              <>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Good balance - consider adding more vegetables</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Pair with protein, fiber, or healthy fats</p>
                </div>
              </>
            ) : (
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">Great low-impact choice! This meal will have minimal effect on blood sugar.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onStartOver}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
        >
          Check Another Meal
        </button>
      </div>
    </div>
  );
};