import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { getPortionInfo } from '../api';

interface FoodItem {
  food: string;
  quantity: number;
}

interface PortionPageProps {
  finalMeal: FoodItem[];
  onPortionComplete: (updatedMeal: FoodItem[]) => void;
  onBack: () => void;
}

interface PortionInfo {
  food: string;
  unit: string;
  unit_desc: string;
}

const getGLColor = (gl: number) => {
  if (gl <= 10) return 'text-gl-low';
  if (gl <= 19) return 'text-gl-moderate';
  return 'text-gl-high';
};

const getGLBackground = (gl: number) => {
  if (gl <= 10) return 'bg-gl-low-bg';
  if (gl <= 19) return 'bg-gl-moderate-bg';
  return 'bg-gl-high-bg';
};

export const PortionPage: React.FC<PortionPageProps> = ({
  finalMeal,
  onPortionComplete,
  onBack
}) => {
  const [portions, setPortions] = useState<FoodItem[]>(finalMeal);
  const [portionInfo, setPortionInfo] = useState<{ [key: string]: PortionInfo }>({});
  const [totalGL, setTotalGL] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPortionInfo = async () => {
      setIsLoading(true);
      const info: { [key: string]: PortionInfo } = {};
      
      for (const item of finalMeal) {
        try {
          const portionData = await getPortionInfo(item.food);
          info[item.food] = portionData;
        } catch (error) {
          console.error(`Error fetching portion info for ${item.food}:`, error);
          info[item.food] = {
            food: item.food,
            unit: 'portion',
            unit_desc: '1 serving'
          };
        }
      }
      
      setPortionInfo(info);
      setIsLoading(false);
      
      // Calculate initial GL estimate (rough calculation for preview)
      const estimatedGL = portions.reduce((sum, item) => sum + (item.quantity * 5), 0);
      setTotalGL(Math.round(estimatedGL));
    };

    fetchPortionInfo();
  }, [finalMeal]);

  const updateQuantity = (foodName: string, change: number) => {
    setPortions(prev => {
      const updated = prev.map(item => 
        item.food === foodName 
          ? { ...item, quantity: Math.max(0.5, item.quantity + change) }
          : item
      );
      
      // Recalculate GL estimate
      const estimatedGL = updated.reduce((sum, item) => sum + (item.quantity * 5), 0);
      setTotalGL(Math.round(estimatedGL));
      
      return updated;
    });
  };

  const handleContinue = () => {
    onPortionComplete(portions);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          <BackButton onClick={onBack} />
        </div>
        <div className="space-y-4">
          {Array.from({ length: finalMeal.length }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-6 pb-32">
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
            Let me confirm your portions...
          </h1>
          <p className="text-text-secondary">
            Adjust the quantities to match what you actually ate
          </p>
        </div>

        <div className="space-y-4">
          {portions.map((item, index) => (
            <motion.div
              key={item.food}
              className="bg-white rounded-2xl p-6 border border-gray-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <div className="mb-4">
                <h3 className="font-bold text-text-primary mb-1">{item.food}</h3>
                {portionInfo[item.food] && (
                  <p className="text-text-secondary text-sm">
                    {portionInfo[item.food].unit_desc}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center space-x-6">
                <button
                  onClick={() => updateQuantity(item.food, -0.5)}
                  className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center text-secondary hover:bg-gray-200 active:scale-95 transition-all duration-200"
                  disabled={item.quantity <= 0.5}
                >
                  <Minus size={20} />
                </button>

                <div className="text-center">
                  <div className="text-2xl font-bold text-text-primary tabular-nums w-12">
                    {item.quantity}
                  </div>
                  <div className="text-sm text-text-secondary mt-1">
                    {portionInfo[item.food]?.unit || 'portions'}
                  </div>
                </div>

                <button
                  onClick={() => updateQuantity(item.food, 0.5)}
                  className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center text-secondary hover:bg-gray-200 active:scale-95 transition-all duration-200"
                >
                  <Plus size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Fixed Bottom GL Preview */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-5 shadow-lg"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-text-secondary">Total GL:</span>
            <div className="flex items-center space-x-2">
              <span className={`text-xl font-bold ${getGLColor(totalGL)}`}>
                {totalGL}
              </span>
              <div className={`w-3 h-3 rounded-full ${getGLBackground(totalGL)}`} />
            </div>
          </div>
          
          <button
            onClick={handleContinue}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 active:scale-95 transition-all duration-200"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
};