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
        setError('Failed to parse meal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse meal');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-6">
      <div className="max-w-md mx-auto sm:max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-md">
            <span className="text-2xl">🍽️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Glycemic Load Tracker
          </h1>
          <p className="text-gray-600">
            Check your meal's sugar impact
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg text-red-700">
            <div className="flex items-center space-x-2">
              <span>❌</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        {appState === 'input' && (
          <ChatInput onSubmit={handleMealSubmit} isLoading={isLoading} />
        )}

        {appState === 'disambiguation' && (
          <FoodDisambiguation
            items={disambiguationItems}
            onSelectionComplete={handleDisambiguationComplete}
          />
        )}

        {appState === 'portions' && (
          <ParsedMealList
            parsedMeal={parsedMeal}
            onQuantityChange={handleQuantityChange}
            onConfirm={handleCalculateGL}
            isLoading={isLoading}
          />
        )}

        {appState === 'results' && glResult && (
          <GLResult result={glResult} onStartOver={handleStartOver} />
        )}

        {/* Back Button for portions and disambiguation views */}
        {(appState === 'portions' || appState === 'disambiguation') && (
          <div className="mt-6 text-center">
            <button
              onClick={handleStartOver}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
};