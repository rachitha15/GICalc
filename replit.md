# Food Database API

## Overview

This is a Flask-based web API that provides access to a comprehensive food database containing nutritional information. The application serves as a backend service for food-related applications, offering endpoints to query food items with their glycemic index, carbohydrate content, and fiber information.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a simple Flask web service architecture with the following characteristics:

- **Framework**: Flask (Python web framework)
- **Data Storage**: JSON file-based database (no traditional database required)
- **API Style**: RESTful JSON API
- **Cross-Origin Support**: CORS enabled for frontend integration
- **Deployment**: Configured for containerized deployment (0.0.0.0 binding)

## Key Components

### 1. Flask Application (`app.py`)
- Main application file containing the Flask app configuration
- Handles food database loading and initialization
- Implements case-insensitive food lookup functionality
- Provides comprehensive error handling and logging

### 2. Application Entry Point (`main.py`)
- Simple entry point that starts the Flask development server
- Configured for external access (host='0.0.0.0')
- Debug mode enabled for development

### 3. Food Database (`attached_assets/food_items_db_1753605645874.json`)
- JSON-based food database containing nutritional information
- Each food item includes:
  - Category (e.g., "Roti")
  - Name (e.g., "Missi Roti")
  - Glycemic Index (GI)
  - Unit information and description
  - Carbohydrates per unit
  - Fiber per unit

## Data Flow

1. **Application Startup**: Food database is loaded from JSON file into memory
2. **Data Processing**: Case-insensitive lookup dictionary is created for efficient searching
3. **Request Handling**: API endpoints process requests and return JSON responses
4. **Error Management**: Comprehensive logging and error handling throughout the pipeline

## External Dependencies

### Python Packages
- **Flask**: Web framework for API development
- **flask-cors**: Cross-Origin Resource Sharing support
- **Standard Library**: json, os, logging modules

### Data Dependencies
- Food database JSON file must be present in `attached_assets/` directory
- No external database or API dependencies

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
- **Simplicity**: No database setup required, just file-based storage
- **Performance**: In-memory lookup after initial load
- **Portability**: Self-contained application with data included
- **Scalability**: Can be easily containerized and deployed

### Potential Limitations
- **Data Persistence**: No mechanism for updating the food database at runtime
- **Scalability**: In-memory storage may not scale for very large datasets
- **Concurrency**: File-based approach limits concurrent write operations

## Notes for Development

- The application expects the food database file to be located at `attached_assets/food_items_db_1753605645874.json`
- Case-insensitive food lookup is implemented for better user experience
- Comprehensive error handling ensures the application continues running even if the database file is missing
- CORS is enabled for all routes to support frontend integration