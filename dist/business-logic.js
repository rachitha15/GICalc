import { parseMealChat, calculateGL } from './api';
export class MealAnalysisController {
    constructor() {
        this.state = {
            currentStep: 'input',
            parsedMeal: [],
            finalMeal: [],
            glResult: null,
            isLoading: false
        };
        this.listeners = [];
    }
    // Subscribe to state changes
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    // Emit state changes to all subscribers
    emit() {
        this.listeners.forEach(listener => listener({ ...this.state }));
    }
    // Get current state
    getState() {
        return { ...this.state };
    }
    // Handle meal submission from input
    async handleMealSubmit(mealText) {
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
        }
        catch (error) {
            console.error('Error parsing meal:', error);
            throw new Error('Failed to parse meal. Please try again.');
        }
        finally {
            this.state.isLoading = false;
            this.emit();
        }
    }
    // Handle disambiguation completion
    handleDisambiguationComplete(resolvedMeal) {
        this.state.finalMeal = resolvedMeal;
        this.state.currentStep = 'portions';
        this.emit();
    }
    // Handle portions completion and calculate GL
    async handlePortionsComplete(finalMealData) {
        this.state.isLoading = true;
        this.emit();
        try {
            const result = await calculateGL(finalMealData);
            this.state.glResult = result;
            this.state.currentStep = 'results';
        }
        catch (error) {
            console.error('Error calculating GL:', error);
            throw new Error('Failed to calculate glycemic load. Please try again.');
        }
        finally {
            this.state.isLoading = false;
            this.emit();
        }
    }
    // Reset to initial state
    handleStartOver() {
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
//# sourceMappingURL=business-logic.js.map