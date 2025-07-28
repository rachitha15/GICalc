import React, { useState } from 'react';
import { ChatInput } from '../components/ChatInput';
import { ParsedMealList } from '../components/ParsedMealList';
import { GLResult } from '../components/GLResult';
import { FoodDisambiguation } from '../components/FoodDisambiguation';
import { parseMealSmart, calculateGL, GLCalculationResult } from '../api';

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
      const parsed = await parseMealSmart(mealText);
      setParsedMeal(parsed.items);
      
      // Check if any items need disambiguation
      const needsDisambiguation = parsed.items.some(item => item.status === 'needs_disambiguation');
      
      if (needsDisambiguation) {
        setCurrentStep('disambiguation');
      } else {
        // Auto-convert items that don't need disambiguation
        const finalItems = parsed.items.map(item => ({
          food: item.selected_food || item.original_name,
          quantity: item.quantity
        }));
        setFinalMeal(finalItems);
        setCurrentStep('portions');
      }
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800">
      {/* Hero Section */}
      <div className="relative py-16 px-4">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-orange-300/20 rounded-full blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-32 left-1/3 w-20 h-20 bg-green-300/20 rounded-full blur-lg animate-pulse animation-delay-4000"></div>
        </div>

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h1 className="text-6xl font-black text-white mb-4 animate-fade-in">
            FoodIQ
          </h1>
          <p className="text-2xl font-bold text-white/90 mb-6 animate-fade-in-delayed">
            Smart Meal Analysis
          </p>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4 inline-block border border-white/30">
            <p className="text-white text-xl font-semibold">
              Discover your meal's health score instantly!
            </p>
          </div>
          
          {/* Stats badges */}
          <div className="flex justify-center space-x-4 mt-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30">
              <div className="text-white font-bold text-lg">56+ Foods</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30">
              <div className="text-white font-bold text-lg">AI Powered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        {currentStep === 'input' && (
          <ChatInput onSubmit={handleMealSubmit} isLoading={isLoading} />
        )}

        {currentStep === 'disambiguation' && (
          <FoodDisambiguation
            parsedMeal={parsedMeal}
            onComplete={handleDisambiguationComplete}
            onBack={handleStartOver}
          />
        )}

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