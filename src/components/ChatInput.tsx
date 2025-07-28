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
  const MAX_CHARACTERS = 200;

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
      {/* Revolutionary Input Experience */}
      <div className="bg-gradient-to-br from-white/95 via-white/90 to-white/85 backdrop-blur-sm rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-white/20">
        {/* Simplified decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-200/40 to-secondary-200/40 rounded-full -translate-y-12 translate-x-12 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-success-200/40 to-warning-200/40 rounded-full translate-y-10 -translate-x-10 opacity-60"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8 relative z-10">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-700 rounded-full mx-auto flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 animate-bounce-gentle">
                <span className="text-3xl text-white animate-pulse">🍽️</span>
              </div>

            </div>
            
            <h2 className="text-3xl font-black bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-800 bg-clip-text text-transparent mb-3">
              What's on your plate?
            </h2>
            <p className="text-gray-700 text-lg font-medium">
              Let AI analyze your meal's health impact
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <textarea
                value={input}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue.length <= MAX_CHARACTERS) {
                    setInput(newValue);
                  }
                }}
                placeholder="What did you eat today?&#10;e.g., 2 rotis with dal and rice"
                className={`w-full px-6 py-5 text-lg bg-white/80 backdrop-blur-sm border-2 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all resize-none group-hover:border-gray-300 shadow-lg ${
                  input.length >= MAX_CHARACTERS * 0.9 
                    ? 'border-yellow-400 focus:border-yellow-500 focus:ring-yellow-100' 
                    : 'border-gray-200 focus:border-blue-400'
                }`}
                rows={4}
                disabled={isLoading}
                maxLength={MAX_CHARACTERS}
              />
              <div className="absolute top-4 right-4 text-gray-400 text-2xl pointer-events-none">
                🍽️
              </div>
              
              {/* Character counter */}
              <div className={`absolute bottom-2 right-4 text-sm font-medium ${
                input.length >= MAX_CHARACTERS * 0.9 
                  ? input.length >= MAX_CHARACTERS 
                    ? 'text-red-600' 
                    : 'text-yellow-600'
                  : 'text-gray-400'
              }`}>
                {input.length}/{MAX_CHARACTERS}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`w-full py-6 rounded-3xl font-black text-xl shadow-2xl transition-all duration-300 relative overflow-hidden ${
                !input.trim() || isLoading
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-700 text-white hover:from-primary-700 hover:via-secondary-700 hover:to-primary-800 hover:scale-105 hover:shadow-3xl transform-gpu'
              }`}
            >
              {!input.trim() || isLoading ? null : (
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 animate-shimmer"></div>
              )}
              
              {isLoading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="animate-pulse">🧠 Analyzing your delicious meal...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center space-x-3 relative z-10">
                  <span className="text-2xl animate-bounce">🚀</span>
                  <span>Analyze My Meal</span>
                  <span className="text-lg animate-pulse">✨</span>
                </span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Playful Examples Section */}
      <div className="bg-gradient-to-br from-white/95 via-white/90 to-white/85 backdrop-blur-sm rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-white/20">
        {/* Decorative food elements */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-warning-200/60 to-success-200/60 rounded-full -translate-y-12 -translate-x-12 opacity-70 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-br from-secondary-200/60 to-primary-200/60 rounded-full translate-y-10 translate-x-10 opacity-70 animate-pulse animation-delay-2000"></div>
        
        {/* Floating food icons */}
        <div className="absolute top-4 right-6 text-xl opacity-30 animate-bounce animation-delay-1000">🍜</div>
        <div className="absolute bottom-6 left-8 text-lg opacity-30 animate-bounce animation-delay-3000">🫓</div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-success-500 via-success-600 to-success-700 rounded-full mx-auto flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 animate-bounce-gentle">
                <span className="text-3xl text-white animate-pulse">💡</span>
              </div>

            </div>
            
            <h3 className="text-2xl font-black bg-gradient-to-r from-success-600 via-success-700 to-success-800 bg-clip-text text-transparent mb-3">
              Try These Examples!
            </h3>
            <p className="text-gray-700 text-lg font-medium">
              Tap any meal to analyze instantly
            </p>
          </div>
          
          <div className="grid gap-4">
            {exampleMeals.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                disabled={isLoading}
                className="w-full p-6 text-left bg-gradient-to-r from-white/90 to-white/80 backdrop-blur-sm hover:from-primary-50/80 hover:to-secondary-50/80 border-2 border-white/30 hover:border-primary-300/50 rounded-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-2xl group relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                
                <div className="flex items-center space-x-5 relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-400 via-secondary-400 to-success-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-2xl">
                      {index === 0 ? '🥙' : index === 1 ? '🍛' : '🍽️'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className="text-gray-800 font-bold text-lg group-hover:text-gray-900 transition-colors block">
                      {example}
                    </span>
                    <span className="text-gray-500 text-sm font-medium">
                      Tap to try this meal →
                    </span>
                  </div>
                  <div className="text-primary-400 group-hover:text-primary-600 transition-colors">
                    <span className="text-xl animate-bounce">⚡</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};