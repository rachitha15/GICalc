import React from 'react';
import { GLCalculationResult } from '../api';
import { GLMeter } from './GLMeter';

interface GLResultProps {
  result: GLCalculationResult;
  onStartOver: () => void;
}

export const GLResult: React.FC<GLResultProps> = ({ result, onStartOver }) => {
  const { total_gl, items } = result;
  const isHighGL = total_gl > 20;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-slide-up">
      {/* High GL Warning Banner */}
      {isHighGL && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
          <div className="flex items-start space-x-3">
            <div className="text-red-500 text-xl">⚠️</div>
            <div>
              <h3 className="text-red-800 font-medium">This meal is on the higher side</h3>
              <p className="text-red-700 text-sm mt-1">
                Consider pairing with protein or fiber-rich foods to help moderate blood sugar impact.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* GL Meter and Total */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Your Meal's Glycemic Load
        </h2>
        
        <GLMeter totalGL={total_gl} />
        
        <div className="mt-4 text-center">
          <div className="text-3xl font-bold text-gray-800">{total_gl.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Total Glycemic Load</div>
        </div>
      </div>

      {/* Individual Food Items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Breakdown by Food</h3>
        
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-2">
                <span className="text-gray-800">{item.food}</span>
                {item.status === 'ai_estimated' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    AI estimated
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">GL:</span>
                <span className="font-medium text-gray-800">{item.gl.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Educational Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-500 text-lg">💡</div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">About Glycemic Load:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• <strong>Low (0-10):</strong> Minimal blood sugar impact</li>
              <li>• <strong>Medium (11-20):</strong> Moderate blood sugar impact</li>
              <li>• <strong>High (20+):</strong> Significant blood sugar impact</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onStartOver}
        className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
      >
        Track Another Meal
      </button>
    </div>
  );
};