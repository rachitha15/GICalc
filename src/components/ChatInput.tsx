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
    <div className="w-full space-y-8 animate-slide-up">
      {/* Input Card with Gradient Design */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-12 translate-x-12 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full translate-y-8 -translate-x-8 opacity-60"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl animate-bounce-gentle">
              <span className="text-2xl text-white">✍️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell Me About Your Meal</h2>
            <p className="text-gray-600">Describe what you ate and I'll calculate the impact</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What did you eat today?&#10;e.g., 2 rotis with dal and rice"
                className="w-full px-6 py-5 text-lg bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all resize-none group-hover:border-gray-300 shadow-lg"
                rows={4}
                disabled={isLoading}
              />
              <div className="absolute top-4 right-4 text-gray-400 text-2xl pointer-events-none">
                🍽️
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`w-full py-5 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 ${
                !input.trim() || isLoading
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 hover:scale-105 hover:shadow-2xl animate-pulse-glow'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>🧠 Analyzing your meal...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>🚀</span>
                  <span>Analyze My Meal</span>
                </span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Enhanced Examples Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full -translate-y-10 -translate-x-10 opacity-60"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
              <span className="text-xl text-white">💡</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Quick Examples</h3>
            <p className="text-gray-600">Click any example to get started instantly</p>
          </div>
          
          <div className="space-y-4">
            {exampleMeals.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                disabled={isLoading}
                className="w-full p-5 text-left bg-white/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-2 border-gray-200 hover:border-blue-300 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-lg group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-lg">
                      {index === 0 ? '🥙' : index === 1 ? '🍛' : '🍽️'}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium text-lg group-hover:text-gray-900 transition-colors">
                    {example}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};