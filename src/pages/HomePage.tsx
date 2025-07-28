import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

interface HomePageProps {
  onMealSubmit: (meal: string) => void;
  isLoading: boolean;
}

const MEAL_EXAMPLES = [
  "2 rotis with dal",
  "Rice and chicken curry", 
  "Fruit salad with yogurt"
];

export const HomePage: React.FC<HomePageProps> = ({ onMealSubmit, isLoading }) => {
  const [mealInput, setMealInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mealInput.trim() && !isLoading) {
      onMealSubmit(mealInput.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    setMealInput(example);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with gradient */}
      <motion.div 
        className="h-60 bg-gradient-to-br from-primary to-accent relative overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-6">
          <motion.h1 
            className="text-4xl font-bold mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            FoodIQ
          </motion.h1>
          <motion.p 
            className="text-lg text-center"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Hi! Tell me what you ate today
          </motion.p>
        </div>
      </motion.div>

      <div className="px-6 -mt-6 relative z-20">
        {/* Chat Input */}
        <motion.div 
          className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={mealInput}
              onChange={(e) => setMealInput(e.target.value)}
              placeholder="Describe your meal... (e.g., 2 rotis with dal)"
              className="w-full h-14 px-5 pr-14 text-lg bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-primary focus:bg-white transition-colors duration-200"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!mealInput.trim() || isLoading}
              className="absolute right-1.5 top-1.5 w-11 h-11 bg-primary rounded-xl flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-transform duration-200"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </form>
        </motion.div>

        {/* Meal Examples */}
        <motion.div 
          className="mt-8 space-y-3"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p className="text-text-secondary text-sm font-medium px-2">Quick examples:</p>
          <div className="space-y-3">
            {MEAL_EXAMPLES.map((example, index) => (
              <motion.button
                key={example}
                onClick={() => handleExampleClick(example)}
                className="w-full text-left p-4 bg-gray-50 rounded-2xl border border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-colors duration-200"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-text-primary font-medium">{example}</div>
                <div className="text-text-secondary text-sm mt-1">Try this</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Submit Button */}
        {mealInput.trim() && (
          <motion.button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full mt-6 h-14 bg-primary text-white rounded-2xl font-medium text-base disabled:opacity-70 hover:bg-primary/90 transition-colors duration-200"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Analyzing...' : 'Analyze My Meal'}
          </motion.button>
        )}
      </div>
    </div>
  );
};