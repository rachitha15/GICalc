# AI-Powered Glycemic Load Calculator API

## Overview
This project is an intelligent Flask-based REST API that calculates glycemic load (GL) for meals. It leverages a curated database of 56 Indian foods and integrates with OpenAI GPT-4o for natural language meal parsing and nutrition estimation of unlisted food items. The core purpose is to provide API endpoints for calculating the glycemic impact of meals.

The API offers:
- **Intelligent Food Recognition**: Utilizing AI for unlimited food variety beyond the database.
- **Hybrid Data Approach**: Combining accurate curated data with flexible AI estimations.
- **Natural Language Support**: Allowing conversational meal inputs.
- **Performance**: Prioritizing fast in-memory lookups with AI fallback only when necessary.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
Backend-only Flask REST API with AI integration.

### Core Architecture
- **Framework**: Flask (Python web framework).
- **AI Integration**: OpenAI GPT-4o for natural language processing and nutrition data estimation.
- **Data Storage**: JSON file-based database for known foods, AI for unknown foods.
- **API Style**: RESTful JSON API with intelligent fallback mechanisms.
- **Cross-Origin Support**: CORS enabled for external frontend integration.

### Key Components & Features
- **Flask Application (`app.py`)**: Handles API endpoints, food database loading, AI integration, intelligent food lookup with AI fallback, and error handling.
- **Food Database (`attached_assets/food_items_db_1753605645874.json`)**: Curated JSON database of 56 Indian food items including GI, unit info, carbohydrates, and fiber.
- **AI Integration (`get_nutrition_from_ai()` function)**: Powers nutrition estimation for foods not in the database.
- **Intelligent Food Lookup System**: Prioritizes fast database lookup, then AI nutrition estimation, with a graceful "not_found" fallback.
- **Natural Language Processing**: The `/parse-meal-chat` endpoint converts conversational meal descriptions into structured data.
- **Smart Food Disambiguation System**: Database-first approach with "None of these - Use AI to estimate" option.
- **AI-Powered Meal Suggestions**: Context-aware recommendations for meals with GL ≥ 11.
- **Hybrid Portion Description System**: Searches similar foods in database first, then AI-generated portion guidance.

### API Endpoints
- `POST /calculate-gl`: Core GL calculation with AI fallback.
- `POST /parse-meal-chat`: Natural language meal parsing.
- `POST /portion-info`: Get portion information for specific food items.
- `GET /health`: Health check.
- `GET /foods`: List all available foods.
- `POST /parse-meal-smart`: Intelligent food parsing with database lookup and disambiguation.

## External Dependencies
- **Python Packages**:
    - `Flask`: Web framework.
    - `flask-cors`: Cross-Origin Resource Sharing support.
    - `openai`: OpenAI API client.
- **External Services**:
    - **OpenAI API**: For GPT-4o model integration (requires `OPENAI_API_KEY` environment variable).
- **Data Dependencies**:
    - Food database JSON file (`attached_assets/food_items_db_1753605645874.json`).
