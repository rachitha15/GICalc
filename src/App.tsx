import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HomePage } from './pages/HomePage';
import { DisambiguationPage } from './pages/DisambiguationPage';
import { PortionPage } from './pages/PortionPage';
import { ResultsPage } from './pages/ResultsPage';
import { ProgressIndicator } from './components/ProgressIndicator';
import { mealController, AppState, AppStep } from './business-logic';

type UIStep = 'home' | 'disambiguation' | 'portions' | 'results';

const stepMapping: { [key in AppStep]: UIStep } = {
  input: 'home',
  disambiguation: 'disambiguation',
  portions: 'portions',
  results: 'results',
};

const getStepNumber = (step: UIStep): number => {
  const stepOrder: { [key in UIStep]: number } = {
    home: 1,
    disambiguation: 2,
    portions: 3,
    results: 4,
  };
  return stepOrder[step];
};

function App() {
  const [state, setState] = useState<AppState>(mealController.getState());
  const [currentUIStep, setCurrentUIStep] = useState<UIStep>('home');

  useEffect(() => {
    const unsubscribe = mealController.subscribe((newState) => {
      setState(newState);
      setCurrentUIStep(stepMapping[newState.currentStep]);
    });

    return unsubscribe;
  }, []);

  const handleMealSubmit = async (mealText: string) => {
    try {
      await mealController.handleMealSubmit(mealText);
    } catch (error) {
      console.error('Error submitting meal:', error);
      // In a real app, you'd show an error message to the user
    }
  };

  const handleDisambiguationSelection = (selectedFood: string) => {
    // For now, we'll simulate the disambiguation completion
    // In the actual implementation, this would involve updating the parsed meal
    const resolvedMeal = state.finalMeal.map(item => ({
      food: selectedFood,
      quantity: item.quantity
    }));
    mealController.handleDisambiguationComplete(resolvedMeal);
  };

  const handlePortionComplete = async (updatedMeal: Array<{ food: string; quantity: number }>) => {
    try {
      await mealController.handlePortionsComplete(updatedMeal);
    } catch (error) {
      console.error('Error calculating GL:', error);
      // In a real app, you'd show an error message to the user
    }
  };

  const handleStartOver = () => {
    mealController.handleStartOver();
  };

  const handleBack = () => {
    switch (currentUIStep) {
      case 'disambiguation':
        mealController.handleStartOver();
        break;
      case 'portions':
        setCurrentUIStep('disambiguation');
        break;
      case 'results':
        setCurrentUIStep('portions');
        break;
      default:
        break;
    }
  };

  const pageTransition = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentUIStep !== 'home' && (
        <ProgressIndicator 
          currentStep={getStepNumber(currentUIStep)} 
          totalSteps={4} 
        />
      )}
      
      <AnimatePresence mode="wait">
        {currentUIStep === 'home' && (
          <motion.div 
            key="home" 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <HomePage 
              onMealSubmit={handleMealSubmit}
              isLoading={state.isLoading}
            />
          </motion.div>
        )}

        {currentUIStep === 'disambiguation' && (
          <motion.div 
            key="disambiguation" 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <DisambiguationPage
              foodName="Sample Food" // This would come from parsed meal
              matches={[
                {
                  name: "Chicken Dish (Homemade)",
                  category: "Proteins",
                  unit: "piece",
                  unit_desc: "1 medium piece = 100g"
                },
                {
                  name: "Chicken Dish (Restaurant)",
                  category: "Proteins", 
                  unit: "piece",
                  unit_desc: "1 large piece = 150g"
                }
              ]}
              onSelection={handleDisambiguationSelection}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {currentUIStep === 'portions' && (
          <motion.div 
            key="portions" 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <PortionPage
              finalMeal={state.finalMeal}
              onPortionComplete={handlePortionComplete}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {currentUIStep === 'results' && state.glResult && (
          <motion.div 
            key="results" 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <ResultsPage
              glResult={state.glResult}
              onStartOver={handleStartOver}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;