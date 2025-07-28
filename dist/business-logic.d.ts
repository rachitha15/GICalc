import { GLCalculationResult } from './api';
export type AppStep = 'input' | 'disambiguation' | 'portions' | 'results';
export interface ParsedItem {
    original_name: string;
    quantity: number;
    status: 'single_match' | 'needs_disambiguation' | 'needs_ai';
    selected_food?: string;
    matches?: Array<{
        name: string;
        category: string;
        unit: string;
        unit_desc: string;
    }>;
}
export interface AppState {
    currentStep: AppStep;
    parsedMeal: ParsedItem[];
    finalMeal: Array<{
        food: string;
        quantity: number;
    }>;
    glResult: GLCalculationResult | null;
    isLoading: boolean;
}
export declare class MealAnalysisController {
    private state;
    private listeners;
    subscribe(listener: (state: AppState) => void): () => void;
    private emit;
    getState(): AppState;
    handleMealSubmit(mealText: string): Promise<void>;
    handleDisambiguationComplete(resolvedMeal: Array<{
        food: string;
        quantity: number;
    }>): void;
    handlePortionsComplete(finalMealData: Array<{
        food: string;
        quantity: number;
    }>): Promise<void>;
    handleStartOver(): void;
}
export declare const mealController: MealAnalysisController;
//# sourceMappingURL=business-logic.d.ts.map