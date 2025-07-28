import React, { useState } from 'react';
import { ChatInput } from '../components/ChatInput';
import { ParsedMealList } from '../components/ParsedMealList';
import { GLResult } from '../components/GLResult';
import { FoodDisambiguation } from '../components/FoodDisambiguation';
import { parseMealChat, calculateGL, GLCalculationResult } from '../api';

interface ParsedItem {
  original_name: string;
  quantity: number;
  status: 'single_match' | 'needs_disambiguation' | 'needs_ai';
  selected_food?: string;
  matches?: Array<{ name: string; category: string; unit: string; unit_desc: string }>;
}

export const Home: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'input' | 'disambiguation' | 'portions' | 'results'>('input');
  const [parsedMeal, setParsedMeal] = useState<ParsedItem[]>([]);
  const [finalMeal, setFinalMeal] = useState<Array<{ food: string; quantity: number }>>([]);
  const [glResult, setGLResult] = useState<GLCalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMealSubmit = async (mealText: string) => {
    setIsLoading(true);
    try {
      const parsed = await parseMealChat(mealText);
      // Convert parsed meal to final format
      const finalItems = parsed.map(item => ({
        food: item.food,
        quantity: item.quantity
      }));
      setFinalMeal(finalItems);
      setCurrentStep('portions');
    } catch (error) {
      console.error('Error parsing meal:', error);
      alert('Failed to parse meal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisambiguationComplete = (resolvedMeal: Array<{ food: string; quantity: number }>) => {
    setFinalMeal(resolvedMeal);
    setCurrentStep('portions');
  };

  const handlePortionsComplete = async (finalMealData: Array<{ food: string; quantity: number }>) => {
    setIsLoading(true);
    try {
      const result = await calculateGL(finalMealData);
      setGLResult(result);
      setCurrentStep('results');
    } catch (error) {
      console.error('Error calculating GL:', error);
      alert('Failed to calculate glycemic load. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setCurrentStep('input');
    setParsedMeal([]);
    setFinalMeal([]);
    setGLResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800" style={{background: 'linear-gradient(to bottom right, rgb(147 51 234), rgb(37 99 235), rgb(107 33 168))'}}>
      {/* Hero Section */}
      <div className="relative py-16 px-4">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-orange-300/20 rounded-full blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-32 left-1/3 w-20 h-20 bg-green-300/20 rounded-full blur-lg animate-pulse animation-delay-4000"></div>
        </div>

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h1 className="text-6xl font-black mb-4 animate-fade-in" style={{color: '#ffffff'}}>
            FoodIQ
          </h1>
          <p className="text-2xl font-bold mb-6 animate-fade-in-delayed" style={{color: 'rgba(255, 255, 255, 0.9)'}}>
            Smart Meal Analysis
          </p>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4 inline-block border border-white/30">
            <p className="text-xl font-semibold" style={{color: '#ffffff'}}>
              Discover your meal's health score instantly!
            </p>
          </div>
          
          {/* Stats badges */}
          <div className="flex justify-center space-x-4 mt-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30">
              <div className="font-bold text-lg" style={{color: '#ffffff'}}>56+ Foods</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30">
              <div className="font-bold text-lg" style={{color: '#ffffff'}}>AI Powered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        {currentStep === 'input' && (
          <ChatInput onSubmit={handleMealSubmit} isLoading={isLoading} />
        )}

        {/* Disambiguation step removed for simplified flow */}

        {currentStep === 'portions' && (
          <ParsedMealList
            meal={finalMeal}
            onComplete={handlePortionsComplete}
            onBack={handleStartOver}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'results' && glResult && (
          <GLResult result={glResult} onStartOver={handleStartOver} />
        )}
      </div>
    </div>
  );
};