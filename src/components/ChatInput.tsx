import React, { useState } from 'react';

interface ChatInputProps {
  onSubmit: (text: string) => void;
  isLoading?: boolean;
}

const exampleMeals = [
  "2 pooris, 1 bowl chole, 1 katori kheer",
  "1 plate biryani with raita",
  "2 rotis, dal, sabzi, and rice"
];

export const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, isLoading = false }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  const handleExampleClick = (example: string) => {
    if (!isLoading) {
      setInput(example);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Input Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What did you eat today?&#10;e.g., 2 rotis with dal and rice"
              className="w-full px-4 py-4 text-base bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Analyzing...</span>
              </div>
            ) : (
              'Analyze My Meal'
            )}
          </button>
        </form>
      </div>

      {/* Examples Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Examples</h3>
        <div className="space-y-3">
          {exampleMeals.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              disabled={isLoading}
              className="w-full p-4 text-left bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-transparent rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-gray-700">{example}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};