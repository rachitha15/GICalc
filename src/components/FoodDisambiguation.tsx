import React from 'react';

interface FoodMatch {
  name: string;
  category: string;
  unit_desc: string;
}

interface DisambiguationItem {
  original_name: string;
  quantity: number;
  status: 'needs_disambiguation' | 'single_match' | 'needs_ai';
  matches: FoodMatch[];
  selected_food?: string;
}

interface FoodDisambiguationProps {
  items: DisambiguationItem[];
  onSelectionComplete: (selectedMeal: { food: string; quantity: number }[]) => void;
}

export const FoodDisambiguation: React.FC<FoodDisambiguationProps> = ({
  items,
  onSelectionComplete,
}) => {
  const [selections, setSelections] = React.useState<{ [key: string]: string }>({});

  const handleSelection = (originalName: string, selectedFood: string) => {
    setSelections(prev => ({
      ...prev,
      [originalName]: selectedFood
    }));
  };

  const handleConfirm = () => {
    const finalMeal = items.map(item => {
      if (item.status === 'single_match') {
        return { food: item.selected_food!, quantity: item.quantity };
      } else if (item.status === 'needs_disambiguation') {
        const selectedFood = selections[item.original_name];
        return { food: selectedFood || item.matches[0].name, quantity: item.quantity };
      } else {
        // needs_ai - pass through for AI estimation
        return { food: item.original_name, quantity: item.quantity };
      }
    });

    onSelectionComplete(finalMeal);
  };

  const needsUserInput = items.some(item => 
    item.status === 'needs_disambiguation' && !selections[item.original_name]
  );

  return (
    <div className="w-full space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Confirm Your Food Choices
        </h2>
        <p className="text-gray-600 mb-6">
          I found multiple options for some foods. Please select the ones you had:
        </p>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">
                  {item.quantity} × {item.original_name}
                </h3>
                {item.status === 'single_match' && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    ✓ Found
                  </span>
                )}
                {item.status === 'needs_ai' && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    AI Estimate
                  </span>
                )}
              </div>

              {item.status === 'single_match' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="font-medium text-green-900">{item.selected_food}</div>
                  <div className="text-sm text-green-700">
                    {item.matches[0].category} • {item.matches[0].unit_desc}
                  </div>
                </div>
              )}

              {item.status === 'needs_disambiguation' && (
                <div className="space-y-4">
                  {item.matches.map((match, matchIndex) => (
                    <label key={matchIndex} className={`flex items-start space-x-4 p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 hover:scale-[1.02] ${
                      selections[item.original_name] === match.name
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-lg'
                        : 'bg-gray-50 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-md'
                    }`}>
                      <input
                        type="radio"
                        name={`food_${index}`}
                        value={match.name}
                        checked={selections[item.original_name] === match.name}
                        onChange={() => handleSelection(item.original_name, match.name)}
                        className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-lg mb-2">{match.name}</div>
                        <div className="text-sm text-gray-600 flex items-center space-x-2">
                          <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">{match.category}</span>
                          <span>•</span>
                          <span>{match.unit_desc}</span>
                        </div>
                      </div>
                      {selections[item.original_name] === match.name && (
                        <div className="text-blue-600 animate-bounce text-xl">
                          ✓
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              )}

              {item.status === 'needs_ai' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-blue-900">
                    This food will be estimated using AI
                  </div>
                  <div className="text-sm text-blue-700">
                    Not found in our database - nutrition values will be estimated
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          disabled={needsUserInput}
          className={`w-full mt-6 py-3 px-4 rounded-xl font-medium text-white ${
            needsUserInput
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          } transition-colors`}
        >
          {needsUserInput ? 'Please select all options above' : 'Continue to Portions'}
        </button>
      </div>
    </div>
  );
};