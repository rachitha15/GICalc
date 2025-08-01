# AI-Powered Glycemic Load Calculator

## Overview
This project is an intelligent Flask-based web API that calculates glycemic load (GL) for meals. It leverages a curated database of 56 Indian foods and integrates with OpenAI GPT-4o for natural language meal parsing and nutrition estimation of unlisted food items. The core purpose is to provide users with insights into the glycemic impact of their meals, supporting informed dietary choices.

The application aims to offer:
- **Intelligent Food Recognition**: Utilizing AI for unlimited food variety beyond the database.
- **Hybrid Data Approach**: Combining accurate curated data with flexible AI estimations.
- **Natural Language Support**: Allowing conversational meal inputs.
- **Performance**: Prioritizing fast in-memory lookups with AI fallback only when necessary.
- **Portability**: Self-contained design with minimal external dependencies.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application follows an intelligent Flask web service architecture with AI integration.

### Core Architecture
- **Framework**: Flask (Python web framework).
- **AI Integration**: OpenAI GPT-4o for natural language processing and nutrition data estimation.
- **Data Storage**: Hybrid approach using a JSON file-based database for known foods and AI for unknown foods.
- **API Style**: RESTful JSON API with intelligent fallback mechanisms.
- **Cross-Origin Support**: CORS enabled for frontend integration.
- **Deployment**: Configured for containerized deployment (0.0.0.0 binding).

### Key Components & Features
- **Flask Application (`app.py`)**: Handles API endpoints, food database loading, AI integration, intelligent food lookup with AI fallback, and error handling.
- **Food Database (`attached_assets/food_items_db_1753605645874.json`)**: Curated JSON database of 56 Indian food items including GI, unit info, carbohydrates, and fiber.
- **AI Integration (`get_nutrition_from_ai()` function)**: Powers nutrition estimation for foods not in the database, validating AI responses for data integrity.
- **Intelligent Food Lookup System**: Prioritizes fast database lookup, then AI nutrition estimation, with a graceful "not_found" fallback.
- **Natural Language Processing**: The `/parse-meal-chat` endpoint converts conversational meal descriptions into structured data using OpenAI GPT-4o.
- **Smart Food Disambiguation System**: Enhances food parsing with a database-first approach, offering user choices for multiple matches and using AI for truly unknown items. Users can select "None of these - Use AI to estimate" option when database matches are poor.
- **AI-Powered Meal Suggestions**: Context-aware recommendations based on meal composition and GL scores, focusing on specific food swaps and portion guidance, with an emphasis on Indian foods. Suggestions are shown for GL ≥ 11.
- **Hybrid Portion Description System**: For AI-estimated foods, the system first looks for similar foods in the database to use their portion descriptions, then falls back to AI-generated portion guidance when no similar foods are found.
- **Comprehensive API Endpoints**:
    - `POST /calculate-gl`: Core GL calculation with AI fallback.
    - `POST /parse-meal-chat`: Natural language meal parsing.
    - `POST /portion-info`: Get portion information for specific food items.
    - `GET /health`: Health check.
    - `GET /foods`: List all available foods.
    - `POST /parse-meal-smart`: Intelligent food parsing with database lookup and disambiguation.

### UI/UX Decisions (Frontend)
- **Technology Stack**: React 18 with TypeScript and Vite, styled with Tailwind CSS.
- **Design System**: Modern design with rounded corners, gradient backgrounds, shadow effects, and a purple/blue gradient color scheme.
- **Visuals**: Animated gradient backgrounds, floating elements, interactive icons, dynamic result animations (celebration for low GL, warning for high GL), and an enhanced GL meter with traffic light colors.
- **Interaction**: Chat-style input with example meal templates, smart portion selection integrated with backend unit info, and clear AI status indicators.
- **Responsiveness**: Mobile-responsive design using Tailwind CSS.

## External Dependencies
- **Python Packages**:
    - `Flask`: Web framework.
    - `flask-cors`: Cross-Origin Resource Sharing support.
    - `openai`: OpenAI API client.
- **External Services**:
    - **OpenAI API**: For GPT-4o model integration (requires `OPENAI_API_KEY` environment variable).
- **Data Dependencies**:
    - Food database JSON file (`attached_assets/food_items_db_1753605645874.json`).
    - Internet connection required for AI features.
    - OpenAI API credits for AI-powered functionality.