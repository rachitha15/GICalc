# AI-Powered Glycemic Load Calculator API

## Overview

This is an intelligent Flask-based web API that calculates glycemic load for meals using both a comprehensive food database and AI-powered nutrition estimation. The application combines a curated database of 56 Indian foods with OpenAI GPT-4o integration to provide glycemic load calculations for any food item, whether listed in the database or not. It features natural language meal parsing, automatic nutrition estimation for unknown foods, and comprehensive portion information.

## User Preferences

Preferred communication style: Simple, everyday language.

## Frontend Implementation (July 27, 2025)

### Technology Stack
- **Framework**: React 18 with TypeScript and Vite
- **Styling**: Tailwind CSS with custom GL color scheme
- **Architecture**: Component-based with pages and API layer separation

### Frontend Structure
```
/src
  /components
    ChatInput.tsx          // Chat-style input with example meal templates
    ParsedMealList.tsx     // Renders parsed meals with quantity inputs
    PortionSelector.tsx    // Portion selection with backend portion info
    GLResult.tsx           // GL results display with color coding
    GLMeter.tsx            // Visual GL meter with traffic light colors
  /pages
    Home.tsx               // Main application flow and state management
  api.ts                   // Backend API integration layer
```

### Key Features Implemented
- **Natural Language Input**: Chat-style interface with example meal templates
- **Smart Portion Selection**: Backend-integrated portion sizing with unit descriptions
- **Traffic Light GL Display**: Green/yellow/red color coding for GL results
- **Mobile Responsive**: Tailwind CSS responsive design
- **Smooth Animations**: Fade-in and slide-up transitions
- **AI Status Indicators**: Shows when foods are AI-estimated vs database lookup
- **Error Handling**: Graceful fallbacks and user-friendly error messages

### User Flow
1. **Greeting**: "Let's check your meal's sugar impact"
2. **Input**: Free-text meal description with clickable examples
3. **Parsing**: AI converts text to structured meal data
4. **Portions**: Interactive portion selection with backend unit info
5. **Results**: GL calculation with visual meter and educational info

### Integration
- **Backend API**: Connects to Flask API at localhost:5000
- **CORS Enabled**: Frontend-backend communication configured
- **No Authentication**: Direct API access as designed
- **Real-time**: Live portion info fetching and GL calculation

## System Architecture

The application follows an intelligent Flask web service architecture with AI integration:

- **Framework**: Flask (Python web framework) with OpenAI GPT-4o integration
- **Data Storage**: Hybrid approach - JSON file-based database + AI-powered nutrition estimation
- **AI Integration**: OpenAI GPT-4o for natural language processing and nutrition data estimation
- **API Style**: RESTful JSON API with intelligent fallback mechanisms
- **Cross-Origin Support**: CORS enabled for frontend integration
- **Deployment**: Configured for containerized deployment (0.0.0.0 binding)
- **Environment Requirements**: OpenAI API key for AI-powered features

## Key Components

### 1. Flask Application (`app.py`)
- Main application file with comprehensive API endpoints
- Handles food database loading and AI integration
- Implements intelligent food lookup with AI fallback
- OpenAI GPT-4o client for nutrition estimation and natural language processing
- Comprehensive error handling and logging

### 2. Application Entry Point (`main.py`)
- Simple entry point that starts the Flask development server
- Configured for external access (host='0.0.0.0')
- Debug mode enabled for development

### 3. Food Database (`attached_assets/food_items_db_1753605645874.json`)
- Curated JSON database containing 56 Indian food items
- Each food item includes:
  - Category (e.g., "Roti", "Fruits", "Rice", "Vegetables")
  - Name (e.g., "Missi Roti", "Apple", "Basmati Rice")
  - Glycemic Index (GI)
  - Unit information and description
  - Carbohydrates per unit (grams)
  - Fiber per unit (grams)

### 4. AI Integration (`get_nutrition_from_ai()` function)
- OpenAI GPT-4o powered nutrition estimation
- Automatic fallback for foods not in the database
- Validates AI responses for data integrity
- Provides estimated GI, carbohydrates, and fiber values

## Data Flow

1. **Application Startup**: Food database loaded from JSON file into memory + OpenAI client initialization
2. **Data Processing**: Case-insensitive lookup dictionary created for efficient searching
3. **Request Handling**: Multi-tier food lookup process:
   - **Primary**: Database lookup for known foods
   - **Secondary**: AI estimation for unknown foods using OpenAI GPT-4o
   - **Fallback**: "not_found" status if AI fails
4. **AI Processing**: Natural language meal descriptions parsed into structured data
5. **Response Generation**: JSON responses with glycemic load calculations and status indicators
6. **Error Management**: Comprehensive logging and error handling with graceful degradation

## External Dependencies

### Python Packages
- **Flask**: Web framework for API development
- **flask-cors**: Cross-Origin Resource Sharing support
- **openai**: OpenAI API client for GPT-4o integration
- **Standard Library**: json, os, logging modules

### External Services
- **OpenAI API**: GPT-4o model for natural language processing and nutrition estimation
- **API Key Required**: OPENAI_API_KEY environment variable

### Data Dependencies
- Food database JSON file must be present in `attached_assets/` directory
- Internet connection required for AI features
- OpenAI API credits for AI-powered functionality

## Deployment Strategy

### Development Environment
- Flask development server with debug mode enabled
- Hot reloading for code changes
- Detailed logging for debugging

### Production Considerations
- Application is configured to bind to all interfaces (0.0.0.0)
- Environment variable support for session secrets
- Error handling designed for production stability
- JSON file-based storage eliminates database setup complexity

### Architecture Benefits
- **Intelligence**: AI-powered nutrition estimation for unlimited food variety
- **Hybrid Data**: Combines curated database accuracy with AI flexibility  
- **Natural Language**: Supports conversational meal input like "I had 2 rotis and dal"
- **Performance**: Fast in-memory lookup with AI fallback only when needed
- **Portability**: Self-contained with minimal external dependencies
- **Scalability**: Easily containerized and deployed with cloud AI integration

### Potential Limitations
- **API Dependencies**: Requires OpenAI API access and credits for unknown foods
- **Data Persistence**: No mechanism for updating the food database at runtime
- **Network Dependency**: AI features require internet connectivity
- **Response Time**: AI nutrition estimation adds 500-1500ms latency for unknown foods

## API Endpoints

### Core Endpoints
- **POST** `/calculate-gl` - Calculate glycemic load for meals with AI fallback for unknown foods
- **POST** `/parse-meal-chat` - Parse natural language meal descriptions using OpenAI GPT-4o
- **POST** `/portion-info` - Get portion information for specific food items
- **GET** `/health` - Health check and database status
- **GET** `/foods` - List all available foods in the database

### AI Integration Features
- **Smart Food Recognition**: Unknown foods are automatically looked up using OpenAI GPT-4o
- **Nutrition Estimation**: AI provides glycemic index, carbohydrates, and fiber data for unlisted foods
- **Status Indicators**: AI-estimated foods are marked with `"status": "ai_estimated"`
- **Fallback Logic**: Database lookup first, then AI estimation, finally "not_found" status

## Latest Updates (July 28, 2025)

### Smart Food Disambiguation System
- **New /parse-meal-smart endpoint**: Intelligent food parsing with database lookup
- **FoodDisambiguation component**: UI for user to choose between multiple database matches
- **Enhanced user flow**: Input → Disambiguation → Portions → Results
- **Database-first approach**: Prioritizes curated data over AI estimation

### User Experience Improvements
- **Better food matching**: "chicken" finds both "Chicken Dish (homemade)" and "Chicken Dish (restaurant)"
- **User choice**: System asks user to pick specific database entries instead of assuming
- **AI fallback**: Unknown foods (like "pasta") automatically use AI estimation
- **Status indicators**: Clear labeling of database vs AI-estimated foods

### Technical Implementation
- **Smart parsing logic**: Partial string matching to find database candidates
- **Three-state system**: single_match, needs_disambiguation, needs_ai
- **Improved accuracy**: Users get precise nutrition data from curated database
- **Reduced AI dependency**: Less reliance on potentially inaccurate AI estimates

## Implementation Summary (July 27, 2025)

### Core Functionality Delivered
- **Complete Glycemic Load Calculator**: Calculates GL using formula: (GI × net_carbs / 100) × quantity
- **56 Food Database**: Comprehensive Indian food database with nutritional data
- **AI-Powered Extension**: Unknown foods automatically estimated using OpenAI GPT-4o
- **Natural Language Support**: Parse conversational meal descriptions into structured data
- **Portion Information**: Detailed serving size and unit information for meal planning

### Key Features Implemented

**1. Intelligent Food Lookup System**
- Primary: Fast database lookup for 56 curated Indian foods
- Secondary: AI nutrition estimation for unlimited food variety  
- Status indicators: Standard foods vs "ai_estimated" foods
- Graceful fallback to "not_found" if all methods fail

**2. Natural Language Processing**
- `/parse-meal-chat`: Converts "I had 2 pooris and dal" → structured meal data
- Integration ready: Parsed output works directly with `/calculate-gl`
- Supports complex descriptions with multiple foods and quantities

**3. Comprehensive API Endpoints**
- `/calculate-gl`: Core glycemic load calculation with AI fallback
- `/parse-meal-chat`: Natural language meal parsing
- `/portion-info`: Serving size and unit information
- `/health`: System status and database health check
- `/foods`: Browse complete food database

**4. Production Features**
- CORS enabled for frontend integration
- Comprehensive error handling and validation
- Detailed logging for debugging and monitoring
- Environment-based configuration (OpenAI API key)
- Containerized deployment ready (0.0.0.0 binding)

## Testing Examples

### Basic Usage
```bash
# Health check
curl http://localhost:5000/health

# List available foods  
curl http://localhost:5000/foods

# Calculate GL for known foods
curl -X POST http://localhost:5000/calculate-gl \
  -H "Content-Type: application/json" \
  -d '{"meal": [{"food": "Missi Roti", "quantity": 2}]}'
# Returns: {"total_gl": 10.0, "items": [{"food": "Missi Roti", "gl": 10.0}]}
```

### AI-Powered Features
```bash
# Calculate GL with AI fallback for unknown foods
curl -X POST http://localhost:5000/calculate-gl \
  -H "Content-Type: application/json" \
  -d '{"meal": [{"food": "Pizza", "quantity": 1}]}'
# Returns: {"total_gl": 27.2, "items": [{"food": "Pizza", "gl": 27.2, "status": "ai_estimated"}]}

# Parse natural language meal descriptions
curl -X POST http://localhost:5000/parse-meal-chat \
  -H "Content-Type: application/json" \
  -d '{"text": "I had 2 pooris and some rice"}'
# Returns: [{"food": "Poori", "quantity": 2}, {"food": "Rice", "quantity": 0.5}]

# Get portion information
curl -X POST http://localhost:5000/portion-info \
  -H "Content-Type: application/json" \
  -d '{"food": "Basmati Rice"}'
# Returns: {"food": "Basmati Rice", "unit": "bowl", "unit_desc": "200g"}
```

### Complete Workflow Integration
```bash
# 1. Parse meal description → 2. Calculate glycemic load
PARSED=$(curl -s -X POST http://localhost:5000/parse-meal-chat \
  -H "Content-Type: application/json" \
  -d '{"text": "I had 2 rotis and dal"}')

curl -X POST http://localhost:5000/calculate-gl \
  -H "Content-Type: application/json" \
  -d "{\"meal\": $PARSED}"
```

## Development Notes

- **Database**: File located at `attached_assets/food_items_db_1753605645874.json` with 56 Indian foods
- **AI Integration**: OpenAI API key required in OPENAI_API_KEY environment variable
- **Food Lookup**: Case-insensitive search with intelligent AI fallback for unknown items
- **Error Handling**: Comprehensive validation ensures graceful degradation if external services fail
- **Frontend Ready**: CORS enabled for web application integration
- **Response Validation**: AI responses validated for data integrity and proper JSON structure
- **Status Indicators**: Foods marked as database lookup vs "ai_estimated" for transparency