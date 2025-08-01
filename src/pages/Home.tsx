import React, { useState } from 'react';
import { ChatInput } from '../components/ChatInput';
import { ParsedMealList } from '../components/ParsedMealList';
import { GLResult } from '../components/GLResult';
import { FoodDisambiguation } from '../components/FoodDisambiguation';
import { api, ParsedMealItem, GLCalculationResult } from '../api';

type AppState = 'input' | 'disambiguation' | 'portions' | 'results';

export const Home: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('input');
  const [parsedMeal, setParsedMeal] = useState<ParsedMealItem[]>([]);
  const [disambiguationItems, setDisambiguationItems] = useState<any[]>([]);
  const [glResult, setGLResult] = useState<GLCalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMealSubmit = async (text: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await api.parseMealSmart(text);
      if (result.status === 'success') {
        // Check if any food items were found
        if (!result.items || result.items.length === 0) {
          setError('No food items found in your description. Please describe your meal with specific foods like "2 rotis with dal" or "1 bowl rice with curry".');
          return;
        }
        
        // Check if any items need disambiguation
        const needsDisambiguation = result.items.some((item: any) => 
          item.status === 'needs_disambiguation'
        );
        
        if (needsDisambiguation) {
          setDisambiguationItems(result.items);
          setAppState('disambiguation');
        } else {
          // Convert to parsed meal format and go to portions
          const finalMeal = result.items.map((item: any) => ({
            food: item.status === 'single_match' ? item.selected_food : item.original_name,
            quantity: item.quantity
          }));
          setParsedMeal(finalMeal);
          setAppState('portions');
        }
      } else {
        setError('No food items found in your description. Please describe your meal with specific foods like "2 rotis with dal" or "1 bowl rice with curry".');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No food items found in your description. Please describe your meal with specific foods like "2 rotis with dal" or "1 bowl rice with curry".');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisambiguationComplete = (selectedMeal: ParsedMealItem[]) => {
    setParsedMeal(selectedMeal);
    setAppState('portions');
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setParsedMeal(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity } : item
    ));
  };

  const handleCalculateGL = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await api.calculateGL(parsedMeal);
      setGLResult(result);
      setAppState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate GL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setAppState('input');
    setParsedMeal([]);
    setDisambiguationItems([]);
    setGLResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-700 px-4 py-6 relative overflow-hidden">
      {/* Dynamic animated background */}
      <div className="absolute inset-0">
        {/* Primary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 via-secondary-600/90 to-primary-800/90"></div>
        
        {/* Simplified floating elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-20 h-20 bg-warning-400 rounded-full filter blur-2xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-24 h-24 bg-success-400 rounded-full filter blur-2xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-20 w-18 h-18 bg-secondary-400 rounded-full filter blur-2xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto sm:max-w-lg relative z-10">
        {/* Revolutionary Hero Section */}
        <div className="text-center mb-8 animate-fade-in-up">
          {/* Playful floating icon with food illustrations */}
          <div className="relative mb-8">
            <div className="bg-gradient-to-br from-white via-white to-white/95 rounded-full w-28 h-28 mx-auto flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:rotate-12 animate-bounce-gentle">
              {/* Custom food bowl SVG */}
              <div className="relative">
                <div className="text-4xl animate-bounce-gentle">🍛</div>
                {/* Add sparkle effects */}
                <div className="absolute -top-2 -right-2 text-lg animate-pulse">✨</div>
                <div className="absolute -bottom-1 -left-2 text-sm animate-bounce animation-delay-500">🌟</div>
              </div>
            </div>
            
            {/* Floating status indicators */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-success-400 to-success-600 rounded-full animate-pulse shadow-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-warning-400 to-warning-600 rounded-full animate-pulse shadow-lg flex items-center justify-center">
              <span className="text-white text-xs">🔥</span>
            </div>
          </div>
          
          {/* Cleaner title section */}
          <div className="mb-4">
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent mb-3 animate-slide-in leading-tight">
              FoodIQ
            </h1>
            <div className="text-2xl font-bold text-white/90 animate-fade-in-delayed">
              Smart Meal Analysis
            </div>
          </div>
          
          {/* Simple tagline */}
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-8 py-4 mx-auto max-w-lg animate-fade-in-delayed border border-white/20">
            <p className="text-white text-xl font-semibold text-center">
              Discover your meal's health score instantly!
            </p>
          </div>
          
          {/* Simplified stats badges */}
          <div className="flex justify-center space-x-3 mt-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30">
              <div className="text-white font-bold text-lg">56+ Foods</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30">
              <div className="text-white font-bold text-lg">AI Powered</div>
            </div>
          </div>
        </div>

        {/* Playful Error Display */}
        {error && (
          <div className="mb-6 p-6 bg-gradient-to-r from-red-500/10 via-red-400/10 to-orange-500/10 backdrop-blur-sm border-2 border-red-400/30 rounded-3xl text-white animate-shake shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <span className="text-white text-2xl">🤔</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg mb-1">Oops! Let me help you</div>
                <span className="font-medium text-white/90">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content with smooth transitions */}
        <div className={`transition-all duration-500 ease-in-out ${
          isLoading ? 'opacity-70 scale-95 pointer-events-none' : 'opacity-100 scale-100'
        }`}>
          {appState === 'input' && (
            <div className="animate-slide-up">
              <ChatInput onSubmit={handleMealSubmit} isLoading={isLoading} />
            </div>
          )}

          {appState === 'disambiguation' && (
            <div className="animate-slide-up">
              <FoodDisambiguation
                items={disambiguationItems}
                onSelectionComplete={handleDisambiguationComplete}
              />
            </div>
          )}

          {appState === 'portions' && (
            <div className="animate-slide-up">
              <ParsedMealList
                parsedMeal={parsedMeal}
                onQuantityChange={handleQuantityChange}
                onConfirm={handleCalculateGL}
                isLoading={isLoading}
              />
            </div>
          )}

          {appState === 'results' && glResult && (
            <div className="animate-zoom-in">
              <GLResult result={glResult} onStartOver={handleStartOver} />
            </div>
          )}
        </div>

        {/* Floating Back Button */}
        {(appState === 'portions' || appState === 'disambiguation') && (
          <div className="mt-8 text-center animate-fade-in-delayed">
            <button
              onClick={handleStartOver}
              className="group px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-600 hover:text-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <span className="flex items-center space-x-2">
                <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
                <span className="font-medium">Start over</span>
              </span>
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl animate-bounce-in max-w-sm mx-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-600 rounded-full animate-spin-reverse"></div>
                </div>
                <p className="text-gray-700 font-semibold text-lg">Analyzing your meal...</p>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-100"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce animation-delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};