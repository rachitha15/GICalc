# AI-Powered Glycemic Load Calculator API

## Overview
This project is an intelligent Flask-based REST API that calculates glycemic load (GL) for meals. It leverages a curated database of 56 Indian foods and integrates with OpenAI GPT-4o for natural language meal parsing and nutrition estimation of unlisted food items. The core purpose is to provide API endpoints for calculating the glycemic impact of meals.

The API offers:
- **Intelligent Food Recognition**: Utilizing AI for unlimited food variety beyond the database.
- **Hybrid Data Approach**: Combining accurate curated data with flexible AI estimations.
- **Natural Language Support**: Allowing conversational meal inputs.
- **Performance**: Prioritizing fast in-memory lookups with AI fallback only when necessary.
- **User Authentication**: Secure JWT-based authentication with email/password registration.
- **Rate Limiting**: Daily cap of 4 meal calculations per user to protect API credits.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
Backend-only Flask REST API with AI integration, PostgreSQL database, and JWT authentication.

### Core Architecture
- **Framework**: Flask (Python web framework).
- **Database**: PostgreSQL via SQLAlchemy for user accounts and usage tracking.
- **Authentication**: JWT tokens (24-hour expiry) with secure password hashing (Werkzeug).
- **AI Integration**: OpenAI GPT-4o for natural language processing and nutrition data estimation.
- **Data Storage**: JSON file-based database for known foods, AI for unknown foods.
- **API Style**: RESTful JSON API with intelligent fallback mechanisms.
- **Cross-Origin Support**: CORS enabled for external frontend integration.

### Key Components & Features
- **Flask Application (`app.py`)**: Handles API endpoints, authentication, rate limiting, food database loading, AI integration, and error handling.
- **Food Database (`attached_assets/food_items_db_1753605645874.json`)**: Curated JSON database of 56 Indian food items including GI, unit info, carbohydrates, and fiber.
- **User Authentication**: JWT-based auth with secure password hashing, email validation.
- **Rate Limiting**: Daily cap of 4 meal calculations per user, tracked in database.
- **AI Integration (`get_nutrition_from_ai()` function)**: Powers nutrition estimation for foods not in the database.
- **Intelligent Food Lookup System**: Prioritizes fast database lookup, then AI nutrition estimation, with a graceful "not_found" fallback.
- **Natural Language Processing**: The `/parse-meal-chat` endpoint converts conversational meal descriptions into structured data.
- **Smart Food Disambiguation System**: Database-first approach with "None of these - Use AI to estimate" option.
- **AI-Powered Meal Suggestions**: Context-aware recommendations for meals with GL ≥ 11.
- **Hybrid Portion Description System**: Searches similar foods in database first, then AI-generated portion guidance.

### API Endpoints

#### Public Endpoints (no auth required)
- `GET /health`: Health check - returns API status and food database count.
- `GET /foods`: List all available foods from the database.

#### Authentication Endpoints
- `POST /auth/register`: Create new account with email/password. Returns JWT token.
- `POST /auth/login`: Login with credentials. Returns JWT token and usage stats.
- `GET /auth/me`: Get current user info and daily usage stats (requires auth).

#### Protected Endpoints (require auth + count toward daily limit)
- `POST /calculate-gl`: Core GL calculation with AI fallback.
- `POST /parse-meal-chat`: Natural language meal parsing.
- `POST /parse-meal-smart`: Intelligent food parsing with database lookup and disambiguation.

#### Protected Endpoints (require auth, no daily limit)
- `POST /portion-info`: Get portion information for specific food items.

### Authentication Flow
1. User registers with `POST /auth/register` (email + password min 6 chars).
2. Server returns JWT token valid for 24 hours.
3. User includes token in requests: `Authorization: Bearer <token>`.
4. Protected endpoints validate token and enforce daily limit.
5. After 4 meal calculations per day, user gets 429 error until next day.

### Database Models
- **User**: id, email (unique), password_hash, created_at
- **MealUsage**: id, user_id (FK), endpoint, created_at

## External Dependencies
- **Python Packages**:
    - `Flask`: Web framework.
    - `flask-cors`: Cross-Origin Resource Sharing support.
    - `flask-sqlalchemy`: Database ORM.
    - `openai`: OpenAI API client.
    - `pyjwt`: JWT token handling.
    - `email-validator`: Email validation.
- **External Services**:
    - **OpenAI API**: For GPT-4o model integration (requires `OPENAI_API_KEY` secret).
    - **PostgreSQL**: User accounts and usage tracking (requires `DATABASE_URL` secret).
- **Required Environment Variables**:
    - `SESSION_SECRET`: Required for secure JWT signing (app fails to start if missing).
    - `DATABASE_URL`: PostgreSQL connection string.
    - `OPENAI_API_KEY`: OpenAI API key for AI features.
- **Data Dependencies**:
    - Food database JSON file (`attached_assets/food_items_db_1753605645874.json`).
