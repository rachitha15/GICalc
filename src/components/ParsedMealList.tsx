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
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-slide-up">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-green-500 mr-2">✓</span>
          I found these foods in your meal:
        </h2>
        
        <div className="space-y-4">
          {parsedMeal.map((item, index) => (
            <div key={index} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
              <PortionSelector
                food={item.food}
                quantity={item.quantity}
                onQuantityChange={(quantity) => onQuantityChange(index, quantity)}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={onConfirm}
            disabled={!allQuantitiesConfirmed || isLoading}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Calculating GL...
              </>
            ) : (
              'Calculate Glycemic Load'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};