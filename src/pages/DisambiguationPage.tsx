import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { BackButton } from '../components/BackButton';

interface FoodMatch {
  name: string;
  category: string;
  unit: string;
  unit_desc: string;
}

interface DisambiguationPageProps {
  foodName: string;
  matches: FoodMatch[];
  onSelection: (selectedFood: string) => void;
  onBack: () => void;
}

const getCategoryIcon = (category: string) => {
  const icons: { [key: string]: string } = {
    'Roti': '🫓',
    'Rice': '🍚',
    'Vegetables': '🥗',
    'Fruits': '🍎',
    'Proteins': '🍗',
    'Dairy': '🥛',
    'Grains': '🌾',
  };
  return icons[category] || '🍽️';
};

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    'Roti': 'bg-orange-100 text-orange-800',
    'Rice': 'bg-yellow-100 text-yellow-800',
    'Vegetables': 'bg-green-100 text-green-800',
    'Fruits': 'bg-red-100 text-red-800',
    'Proteins': 'bg-blue-100 text-blue-800',
    'Dairy': 'bg-purple-100 text-purple-800',
    'Grains': 'bg-amber-100 text-amber-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

export const DisambiguationPage: React.FC<DisambiguationPageProps> = ({
  foodName,
  matches,
  onSelection,
  onBack
}) => {
  const [selectedFood, setSelectedFood] = useState<string | null>(null);

  const handleSelection = (foodName: string) => {
    setSelectedFood(foodName);
    // Add slight delay for visual feedback
    setTimeout(() => {
      onSelection(foodName);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-6">
      <div className="flex items-center justify-between mb-8">
        <BackButton onClick={onBack} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-xl font-bold text-text-primary mb-2">
            I found multiple matches for "{foodName}"
          </h1>
          <p className="text-text-secondary">
            Which one matches what you had?
          </p>
        </div>

        <div className="space-y-4">
          {matches.map((match, index) => (
            <motion.button
              key={match.name}
              onClick={() => handleSelection(match.name)}
              className={`w-full text-left p-5 bg-white rounded-2xl border transition-all duration-200 ${
                selectedFood === match.name
                  ? 'border-primary shadow-lg transform scale-[1.02]'
                  : 'border-gray-200 hover:border-primary/30 hover:shadow-md'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: selectedFood === match.name ? 1.02 : 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-lg">
                    {getCategoryIcon(match.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-bold text-text-primary">{match.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(match.category)}`}>
                        {match.category}
                      </span>
                    </div>
                    <p className="text-text-secondary text-sm">
                      {match.unit_desc}
                    </p>
                  </div>
                </div>
                {selectedFood === match.name && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                  >
                    <Check size={14} className="text-white" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};