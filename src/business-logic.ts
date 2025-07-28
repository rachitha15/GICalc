import { parseMealChat, calculateGL, GLCalculationResult } from './api';

export type AppStep = 'input' | 'disambiguation' | 'portions' | 'results';

export interface ParsedItem {
  original_name: string;
  quantity: number;
  status: 'single_match' | 'needs_disambiguation' | 'needs_ai';
  selected_food?: string;
  matches?: Array<{ name: string; category: string; unit: string; unit_desc: string }>;
}

export interface AppState {
  currentStep: AppStep;
  parsedMeal: ParsedItem[];
  finalMeal: Array<{ food: string; quantity: number }>;
  glResult: GLCalculationResult | null;
  isLoading: boolean;
}

export class MealAnalysisController {
  private state: AppState = {
    currentStep: 'input',
    parsedMeal: [],
    finalMeal: [],
    glResult: null,
    isLoading: false
  };

  private listeners: Array<(state: AppState) => void> = [];

  // Subscribe to state changes
  subscribe(listener: (state: AppState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Emit state changes to all subscribers
  private emit() {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  // Get current state
  getState(): AppState {
    return { ...this.state };
  }

  // Handle meal submission from input
  async handleMealSubmit(mealText: string): Promise<void> {
    this.state.isLoading = true;
    this.emit();

    try {
      const parsed = await parseMealChat(mealText);
      
      // Convert parsed meal to final format
      const finalItems = parsed.map(item => ({
        food: item.food,
        quantity: item.quantity
      }));
      
      this.state.finalMeal = finalItems;
      this.state.currentStep = 'portions';
    } catch (error) {
      console.error('Error parsing meal:', error);
      throw new Error('Failed to parse meal. Please try again.');
    } finally {
      this.state.isLoading = false;
      this.emit();
    }
  }

  // Handle disambiguation completion
  handleDisambiguationComplete(resolvedMeal: Array<{ food: string; quantity: number }>): void {
    this.state.finalMeal = resolvedMeal;
    this.state.currentStep = 'portions';
    this.emit();
  }

  // Handle portions completion and calculate GL
  async handlePortionsComplete(finalMealData: Array<{ food: string; quantity: number }>): Promise<void> {
    this.state.isLoading = true;
    this.emit();

    try {
      const result = await calculateGL(finalMealData);
      this.state.glResult = result;
      this.state.currentStep = 'results';
    } catch (error) {
      console.error('Error calculating GL:', error);
      throw new Error('Failed to calculate glycemic load. Please try again.');
    } finally {
      this.state.isLoading = false;
      this.emit();
    }
  }

  // Reset to initial state
  handleStartOver(): void {
    this.state = {
      currentStep: 'input',
      parsedMeal: [],
      finalMeal: [],
      glResult: null,
      isLoading: false
    };
    this.emit();
  }
}

// Create singleton instance
export const mealController = new MealAnalysisController();