import React, { useState, useEffect } from 'react';
import { api, PortionInfo } from '../api';

interface PortionSelectorProps {
  food: string;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

export const PortionSelector: React.FC<PortionSelectorProps> = ({
  food,
  quantity,
  onQuantityChange
}) => {
  const [portionInfo, setPortionInfo] = useState<PortionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortionInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const info = await api.getPortionInfo(food);
        setPortionInfo(info);
      } catch (err) {
        setError('Could not load portion info');
        // Fallback portion info
        setPortionInfo({
          food,
          unit: 'serving',
          unit_desc: '1 portion'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortionInfo();
  }, [food]);

  const portionOptions = [0.5, 1, 1.5, 2, 2.5, 3];

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-gray-600">Loading portion info for {food}...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900 text-lg mb-1">{food}</h3>
        {portionInfo && (
          <p className="text-sm text-gray-600">
            1 {portionInfo.unit} = {portionInfo.unit_desc}
          </p>
        )}
        {error && (
          <p className="text-xs text-amber-600 mt-1">Using default portions</p>
        )}
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Select amount:</p>
        <div className="grid grid-cols-3 gap-2">
          {portionOptions.map((option) => (
            <button
              key={option}
              onClick={() => onQuantityChange(option)}
              className={`px-4 py-3 rounded-xl transition-all text-sm font-semibold ${
                quantity === option
                  ? 'bg-blue-500 text-white shadow-md transform scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {portionInfo?.unit || 'serving'}{quantity !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};