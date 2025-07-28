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
      {/* Result Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <div className="mb-4">
          <div className={`${category.bgColor} rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center`}>
            <span className="text-2xl">
              {total_gl <= 10 ? '✓' : total_gl <= 20 ? '⚠️' : '⚠️'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your Meal's Impact
          </h2>
        </div>
        
        <div className="mb-6">
          <div className="text-4xl font-bold text-gray-900 mb-2">{total_gl.toFixed(1)}</div>
          <div className={`inline-block px-4 py-2 rounded-full font-semibold text-sm ${category.bgColor} ${category.textColor}`}>
            {category.label} Glycemic Load
          </div>
        </div>
        
        <GLMeter totalGL={total_gl} />
      </div>

      {/* Explanation Card */}
      <div className={`${category.cardBg} border-l-4 ${category.borderColor} rounded-r-2xl p-6`}>
        <p className={`${category.textColor} font-medium mb-2`}>
          {category.description}
        </p>
        <div className={`text-sm ${category.textColor}`}>
          <p className="font-medium mb-1">What this means:</p>
          <ul className="space-y-1 ml-4">
            {total_gl <= 10 && (
              <>
                <li>• Low blood sugar spike expected</li>
                <li>• Good for steady energy levels</li>
                <li>• Suitable for diabetic-friendly meals</li>
              </>
            )}
            {total_gl > 10 && total_gl <= 20 && (
              <>
                <li>• Moderate blood sugar rise</li>
                <li>• Add protein or healthy fats to balance</li>
                <li>• Monitor portion sizes</li>
              </>
            )}
            {total_gl > 20 && (
              <>
                <li>• Significant blood sugar impact</li>
                <li>• Consider reducing portions</li>
                <li>• Pair with protein, fiber, or healthy fats</li>
              </>
            )}
          </ul>
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