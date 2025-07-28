import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Share2 } from 'lucide-react';
import { GLMeter } from '../components/GLMeter';
import { GLCalculationResult } from '../api';

interface ResultsPageProps {
  glResult: GLCalculationResult;
  onStartOver: () => void;
}

const getGLCategory = (gl: number) => {
  if (gl <= 10) return { 
    label: 'Low Impact', 
    color: 'text-gl-low', 
    bgColor: 'bg-gl-low-bg',
    description: 'Your blood sugar should rise gently over 2-3 hours. Great choice!'
  };
  if (gl <= 19) return { 
    label: 'Moderate Impact', 
    color: 'text-gl-moderate', 
    bgColor: 'bg-gl-moderate-bg',
    description: 'Your blood sugar will rise moderately. Consider adding more fiber or protein next time.'
  };
  return { 
    label: 'High Impact', 
    color: 'text-gl-high', 
    bgColor: 'bg-gl-high-bg',
    description: 'Your blood sugar may rise quickly. Try smaller portions or add vegetables to balance the meal.'
  };
};

const CountUpNumber: React.FC<{ value: number; delay?: number }> = ({ value, delay = 0 }) => {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className="inline-block"
    >
      {Math.round(value)}
    </motion.span>
  );
};

export const ResultsPage: React.FC<ResultsPageProps> = ({ glResult, onStartOver }) => {
  const category = getGLCategory(glResult.total_gl);
  const hasAIEstimated = glResult.items.some(item => item.status === 'ai_estimated');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* GL Score Section */}
      <motion.div
        className={`px-6 py-12 ${category.bgColor}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">
          <motion.div
            className={`text-6xl font-bold mb-2 ${category.color}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <CountUpNumber value={glResult.total_gl} delay={0.4} />
          </motion.div>
          
          <motion.div
            className={`text-xl font-semibold mb-4 ${category.color}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {category.label}
          </motion.div>

          <GLMeter glScore={glResult.total_gl} animated={true} />

          <motion.p
            className="text-text-secondary text-center max-w-md mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {category.description}
          </motion.p>
        </div>
      </motion.div>

      {/* Food Breakdown Section */}
      <motion.div
        className="bg-white px-6 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <h3 className="text-lg font-bold text-text-primary mb-6">Your meal breakdown:</h3>
        
        <div className="space-y-3">
          {glResult.items.map((item, index) => (
            <motion.div
              key={`${item.food}-${index}`}
              className={`flex justify-between items-center p-4 rounded-xl ${
                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-text-primary">{item.food}</span>
                  {item.status === 'ai_estimated' && (
                    <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full font-medium">
                      AI estimated
                    </span>
                  )}
                </div>
                <div className="text-sm text-text-secondary mt-1">
                  Individual GL contribution
                </div>
              </div>
              <div className={`text-lg font-bold ${getGLCategory(item.gl).color}`}>
                <CountUpNumber value={item.gl} delay={0.9 + index * 0.1} />
              </div>
            </motion.div>
          ))}
        </div>

        {hasAIEstimated && (
          <motion.div
            className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
          >
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Some foods were estimated using AI since they weren't in our database. 
              These estimates are based on similar foods and may vary slightly.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Suggestions Section */}
      {glResult.total_gl > 10 && (
        <motion.div
          className="bg-primary-light px-6 py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h3 className="text-lg font-bold text-primary mb-4">Want to improve this meal?</h3>
          
          <div className="space-y-3">
            <motion.div
              className="bg-white p-4 rounded-xl border-l-4 border-accent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0, duration: 0.4 }}
            >
              <p className="text-text-primary">
                <strong>Add vegetables:</strong> Include a side salad or steamed vegetables to add fiber and slow sugar absorption.
              </p>
            </motion.div>
            
            <motion.div
              className="bg-white p-4 rounded-xl border-l-4 border-accent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.4 }}
            >
              <p className="text-text-primary">
                <strong>Portion control:</strong> Try reducing high-GL foods by 25% and add protein to feel satisfied longer.
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        className="px-6 py-8 bg-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.6 }}
      >
        <div className="flex space-x-3">
          <button
            onClick={onStartOver}
            className="flex-1 h-11 bg-gray-100 text-text-primary rounded-xl font-medium flex items-center justify-center space-x-2 hover:bg-gray-200 active:scale-95 transition-all duration-200"
          >
            <RotateCcw size={18} />
            <span>Try Another Meal</span>
          </button>
          
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'My Meal GL Score',
                  text: `My meal has a GL score of ${Math.round(glResult.total_gl)} (${category.label})`,
                });
              }
            }}
            className="flex-1 h-11 bg-primary text-white rounded-xl font-medium flex items-center justify-center space-x-2 hover:bg-primary/90 active:scale-95 transition-all duration-200"
          >
            <Share2 size={18} />
            <span>Share Results</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};