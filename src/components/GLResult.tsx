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
    if (gl <= 10) return 'Low';
    if (gl <= 20) return 'Medium';
    return 'High';
  };

  const category = getGLCategory(total_gl);

  return (
    <div className="w-full space-y-6">
      {/* Result Header */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 text-center border border-white/20">
        <div className="mb-8">
          <div className={`inline-flex items-center px-8 py-4 rounded-full text-xl font-black shadow-2xl transition-all duration-300 ${
            total_gl <= 10 ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' :
            total_gl <= 20 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white' :
            'bg-gradient-to-r from-red-400 to-red-600 text-white'
          }`}>
            <span className="mr-4 text-3xl">
              {total_gl <= 10 ? '🎉' : total_gl <= 20 ? '⚡' : '🚨'}
            </span>
            <div className="text-center">
              <div className="text-2xl font-black">GL: {total_gl.toFixed(1)}</div>
              <div className="text-sm font-bold opacity-90">{category} Impact</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <p className="text-gray-800 text-lg font-semibold flex items-center justify-center">
            <span className="mr-3 text-2xl">
              {total_gl <= 10 ? '🌟' : total_gl <= 20 ? '💡' : '⚠️'}
            </span>
            {total_gl <= 10 ? 'Excellent choice! Your meal is blood sugar friendly.' :
             total_gl <= 20 ? 'Good balance! This meal has moderate impact.' :
             'High impact meal. Consider portion adjustments.'}
            <span className="ml-3 text-2xl">
              {total_gl <= 10 ? '🌟' : total_gl <= 20 ? '💡' : '⚠️'}
            </span>
          </p>
        </div>

        <GLMeter value={total_gl} />
      </div>

      {/* Food Items Breakdown */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-800 bg-clip-text text-transparent mb-6">
          Meal Breakdown
        </h3>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-white/80 to-white/60 rounded-2xl border border-white/30">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{index + 1}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-800 text-lg">{item.food}</span>
                  {item.status === 'ai_estimated' && (
                    <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                      AI Estimated
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-xl text-gray-800">
                  GL: {item.gl.toFixed(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Over Button */}
      <div className="text-center">
        <button
          onClick={onStartOver}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl text-lg"
        >
          🔄 Analyze Another Meal
        </button>
      </div>
    </div>
  );
};