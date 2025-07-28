import React, { useState } from 'react';

interface ChatInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const maxChars = 200;

  const exampleMeals = [
    "2 rotis with dal and sabji",
    "Rice bowl with chicken curry",
    "Poori, chole and lassi"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSubmit(inputText.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    if (!isLoading) {
      setInputText(example);
      setCharCount(example.length);
      onSubmit(example);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setInputText(text);
      setCharCount(text.length);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Input Section */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <span className="text-3xl text-white">🍽️</span>
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-800 bg-clip-text text-transparent mb-3">
            What's on your plate?
          </h2>
          <p className="text-gray-700 text-lg font-medium">
            Let AI analyze your meal's health impact
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={handleInputChange}
              placeholder="e.g., 2 rotis with dal and rice"
              className="w-full h-32 p-6 text-lg border-2 border-purple-200 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 resize-none bg-white/90 backdrop-blur-sm transition-all duration-300"
              disabled={isLoading}
            />
            <div className="absolute bottom-4 right-4 text-sm text-gray-500">
              {charCount}/{maxChars}
            </div>
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading || charCount > maxChars}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl text-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </div>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <span>✨ Analyze My Meal</span>
                <span>⚡</span>
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Examples Section */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <span className="text-3xl text-white">💡</span>
          </div>
          <h3 className="text-2xl font-black bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-3">
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
              className="w-full p-6 text-left bg-gradient-to-r from-white/90 to-white/80 hover:from-purple-50/80 hover:to-blue-50/80 border-2 border-white/30 hover:border-purple-300/50 rounded-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-2xl group"
            >
              <div className="flex items-center space-x-5">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">
                    {index === 0 ? '🥙' : index === 1 ? '🍛' : '🍽️'}
                  </span>
                </div>
                <div className="flex-1">
                  <span className="text-gray-800 font-bold text-lg block">
                    {example}
                  </span>
                  <span className="text-gray-500 text-sm font-medium">
                    Tap to try this meal →
                  </span>
                </div>
                <div className="text-purple-400">
                  <span className="text-xl">⚡</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};