import React from 'react';
import { ParsedMealItem } from '../api';
import { PortionSelector } from './PortionSelector';

interface ParsedMealListProps {
  parsedMeal: ParsedMealItem[];
  onQuantityChange: (index: number, quantity: number) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const ParsedMealList: React.FC<ParsedMealListProps> = ({
  parsedMeal,
  onQuantityChange,
  onConfirm,
  isLoading = false
}) => {
  const allQuantitiesConfirmed = parsedMeal.every(item => item.quantity > 0);

  return (
    <div className="w-full space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="bg-green-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <span className="text-green-600 text-xl">✓</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Found in your meal
          </h2>
          <p className="text-gray-600 text-sm">
            Adjust the portions below
          </p>
        </div>
        
        <div className="space-y-4">
          {parsedMeal.map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-xl">
              <PortionSelector
                food={item.food}
                quantity={item.quantity}
                onQuantityChange={(quantity) => onQuantityChange(index, quantity)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Calculate Button Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <button
          onClick={onConfirm}
          disabled={!allQuantitiesConfirmed || isLoading}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Calculating GL...</span>
            </div>
          ) : (
            'Calculate Glycemic Load'
          )}
        </button>
      </div>
    </div>
  );
};