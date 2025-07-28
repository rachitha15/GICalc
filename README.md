# Meal Analysis Business Logic Layer

This project has been refactored to contain only the core business logic and API layer, with all UI rendering removed.

## Architecture

### Core Files:
- **`src/api.ts`** - Backend communication layer
  - `parseMealChat()` - Parse natural language meal descriptions
  - `calculateGL()` - Calculate glycemic load 
  - `getPortionInfo()` - Get portion information
  - `healthCheck()` - API health check

- **`src/business-logic.ts`** - Pure business logic controller
  - `MealAnalysisController` class managing application state
  - State management with observer pattern
  - All meal processing workflow logic
  - No UI dependencies

- **`src/main.ts`** - Entry point and examples
  - Usage examples of the business logic
  - Test functions
  - Browser/Node compatibility

## Usage

```typescript
import { mealController } from './business-logic';

// Subscribe to state changes
mealController.subscribe((state) => {
  console.log('Current state:', state);
});

// Process a meal
await mealController.handleMealSubmit('2 rotis with dal');

// Get current state
const state = mealController.getState();
```

## State Management

The controller manages these states:
- `input` - Ready for meal input
- `portions` - Configuring portion sizes  
- `results` - Displaying GL results

## Building

```bash
# Compile TypeScript
./node_modules/.bin/tsc

# Run the compiled code
node dist/main.js
```

## Backend

The Flask backend (app.py) continues to provide the API endpoints that this business logic layer consumes.