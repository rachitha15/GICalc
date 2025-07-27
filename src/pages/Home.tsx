import React, { useState } from 'react';
import { ChatInput } from '../components/ChatInput';
import { ParsedMealList } from '../components/ParsedMealList';
import { GLResult } from '../components/GLResult';
import { api, ParsedMealItem, GLCalculationResult } from '../api';

type AppState = 'input' | 'portions' | 'results';

export const Home: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('input');
  const [parsedMeal, setParsedMeal] = useState<ParsedMealItem[]>([]);
  const [glResult, setGLResult] = useState<GLCalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMealSubmit = async (text: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const parsed = await api.parseMealChat(text);
      setParsedMeal(parsed);
      setAppState('portions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse meal');
    } finally {
      setIsLoading(false);
    }
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
    setGLResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Glycemic Load Tracker
          </h1>
          <p className="text-gray-600 text-lg">
            Let's check your meal's sugar impact
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-fade-in">
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

        {/* Back Button for portions view */}
        {appState === 'portions' && (
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