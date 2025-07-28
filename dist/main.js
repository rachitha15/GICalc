import { mealController } from './business-logic';
// Example usage of the business logic layer
console.log('Meal Analysis Business Logic Layer Initialized');
// Subscribe to state changes
mealController.subscribe((state) => {
    console.log('State updated:', state);
});
// Example: Simulate meal submission
async function testBusinessLogic() {
    try {
        console.log('Testing meal submission...');
        await mealController.handleMealSubmit('2 rotis with dal');
        const state = mealController.getState();
        console.log('Current state after meal submission:', state);
        // If we had portions data, we could continue:
        // await mealController.handlePortionsComplete(state.finalMeal);
    }
    catch (error) {
        console.error('Error in business logic test:', error);
    }
}
// Export for external use
export { mealController };
// Run test if this file is executed directly
if (typeof window !== 'undefined') {
    // Browser environment - attach to window for debugging
    window.mealController = mealController;
    window.testBusinessLogic = testBusinessLogic;
}
else {
    // Node environment - run test
    testBusinessLogic();
}
//# sourceMappingURL=main.js.map