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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-800">How much {food}?</h3>
        {error && (
          <span className="text-xs text-amber-600">Using default portions</span>
        )}
      </div>
      
      {portionInfo && (
        <p className="text-sm text-gray-600">
          (1 {portionInfo.unit} = {portionInfo.unit_desc})
        </p>
      )}
      
      <div className="flex flex-wrap gap-2">
        {portionOptions.map((option) => (
          <button
            key={option}
            onClick={() => onQuantityChange(option)}
            className={`px-3 py-2 rounded-lg border transition-colors text-sm font-medium ${
              quantity === option
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {option} {portionInfo?.unit || 'serving'}{option !== 1 ? 's' : ''}
          </button>
        ))}
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Custom amount:</span>
        <input
          type="number"
          min="0"
          step="0.1"
          value={quantity || ''}
          onChange={(e) => onQuantityChange(parseFloat(e.target.value) || 0)}
          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
          placeholder="0"
        />
        <span className="text-sm text-gray-600">{portionInfo?.unit || 'serving'}(s)</span>
      </div>
    </div>
  );
};