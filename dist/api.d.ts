export interface ParsedMealItem {
    food: string;
    quantity: number;
}
export interface PortionInfo {
    food: string;
    unit: string;
    unit_desc: string;
}
export interface GLCalculationItem {
    food: string;
    gl: number;
    status?: 'ai_estimated';
}
export interface MealSuggestion {
    text: string;
    reason: string;
}
export interface GLCalculationResult {
    total_gl: number;
    items: GLCalculationItem[];
    suggestions?: MealSuggestion[];
}
export declare function parseMealChat(text: string): Promise<ParsedMealItem[]>;
export declare function parseMealSmart(text: string): Promise<any>;
export declare function getPortionInfo(food: string): Promise<PortionInfo>;
export declare function calculateGL(meal: ParsedMealItem[]): Promise<GLCalculationResult>;
export declare function healthCheck(): Promise<{
    status: string;
    message: string;
}>;
//# sourceMappingURL=api.d.ts.map