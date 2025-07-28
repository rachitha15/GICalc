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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 px-4 py-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md mx-auto sm:max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="relative mb-6">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl w-20 h-20 mx-auto flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 hover:rotate-12">
              <span className="text-3xl animate-bounce-gentle">🍽️</span>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse shadow-lg"></div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 animate-slide-in">
            Glycemic Load Tracker
          </h1>
          <p className="text-gray-600 text-lg font-medium animate-fade-in-delayed">
            ✨ Discover your meal's blood sugar impact
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-2xl text-red-700 animate-shake shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-500">⚠️</span>
                </div>
              </div>
              <span className="font-medium">{error}</span>
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