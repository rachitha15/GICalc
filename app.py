import os
import json
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure logging for debugging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key")

# Enable CORS for all routes
CORS(app)

# Global variable to store food database
food_database = {}
food_lookup = {}  # Case-insensitive lookup dictionary

def load_food_database():
    """Load food database from JSON file on startup"""
    global food_database, food_lookup
    
    try:
        # Try to load from the uploaded file path
        json_file_path = 'attached_assets/food_items_db_1753605645874.json'
        
        with open(json_file_path, 'r', encoding='utf-8') as file:
            food_database = json.load(file)
        
        # Create case-insensitive lookup dictionary
        food_lookup = {}
        for food_item in food_database:
            food_name_lower = food_item['name'].lower()
            food_lookup[food_name_lower] = food_item
        
        app.logger.info(f"Successfully loaded {len(food_database)} food items from database")
        
    except FileNotFoundError:
        app.logger.error(f"Food database file not found: {json_file_path}")
        food_database = []
        food_lookup = {}
    except json.JSONDecodeError as e:
        app.logger.error(f"Error parsing JSON file: {e}")
        food_database = []
        food_lookup = {}
    except Exception as e:
        app.logger.error(f"Unexpected error loading food database: {e}")
        food_database = []
        food_lookup = {}

def calculate_glycemic_load(food_item, quantity):
    """Calculate glycemic load for a food item"""
    try:
        gi = food_item['gi']
        carbs_per_unit = food_item['carbs_per_unit']
        fiber_per_unit = food_item['fiber_per_unit']
        
        # Calculate net carbs
        net_carbs = carbs_per_unit - fiber_per_unit
        
        # Calculate glycemic load: GL = (GI × net_carbs / 100) × quantity
        gl = (gi * net_carbs / 100) * quantity
        
        return round(gl, 2)
    except (KeyError, TypeError, ZeroDivisionError) as e:
        app.logger.error(f"Error calculating glycemic load: {e}")
        return 0

@app.route('/calculate-gl', methods=['POST'])
def calculate_gl():
    """Calculate glycemic load for a meal"""
    try:
        # Get JSON data from request
        if not request.is_json:
            return jsonify({
                'error': 'Request must be JSON',
                'message': 'Content-Type must be application/json'
            }), 400
        
        data = request.get_json()
        
        # Validate request structure
        if not data or 'meal' not in data:
            return jsonify({
                'error': 'Invalid request format',
                'message': 'Request must contain "meal" array'
            }), 400
        
        meal = data['meal']
        
        if not isinstance(meal, list):
            return jsonify({
                'error': 'Invalid meal format',
                'message': '"meal" must be an array of food items'
            }), 400
        
        # Process each food item in the meal
        total_gl = 0
        items = []
        
        for meal_item in meal:
            # Validate meal item structure
            if not isinstance(meal_item, dict) or 'food' not in meal_item or 'quantity' not in meal_item:
                items.append({
                    'food': meal_item.get('food', 'Unknown'),
                    'status': 'invalid_format',
                    'message': 'Each meal item must have "food" and "quantity" fields'
                })
                continue
            
            food_name = meal_item['food']
            quantity = meal_item['quantity']
            
            # Validate quantity
            try:
                quantity = float(quantity)
                if quantity <= 0:
                    items.append({
                        'food': food_name,
                        'status': 'invalid_quantity',
                        'message': 'Quantity must be a positive number'
                    })
                    continue
            except (ValueError, TypeError):
                items.append({
                    'food': food_name,
                    'status': 'invalid_quantity',
                    'message': 'Quantity must be a valid number'
                })
                continue
            
            # Look up food item (case-insensitive)
            food_name_lower = food_name.lower()
            
            if food_name_lower in food_lookup:
                food_item = food_lookup[food_name_lower]
                gl = calculate_glycemic_load(food_item, quantity)
                total_gl += gl
                
                items.append({
                    'food': food_name,
                    'gl': gl
                })
            else:
                items.append({
                    'food': food_name,
                    'status': 'not_found'
                })
        
        # Return response
        response = {
            'total_gl': round(total_gl, 2),
            'items': items
        }
        
        return jsonify(response)
    
    except Exception as e:
        app.logger.error(f"Unexpected error in calculate_gl: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'An unexpected error occurred while processing your request'
        }), 500

@app.route('/portion-info', methods=['POST'])
def portion_info():
    """Get portion information for a specific food item"""
    try:
        # Get JSON data from request
        if not request.is_json:
            return jsonify({
                'error': 'Request must be JSON',
                'message': 'Content-Type must be application/json'
            }), 400
        
        data = request.get_json()
        
        # Validate request structure
        if not data or 'food' not in data:
            return jsonify({
                'error': 'Invalid request format',
                'message': 'Request must contain "food" field'
            }), 400
        
        food_name = data['food']
        
        # Validate food name
        if not food_name or not isinstance(food_name, str):
            return jsonify({
                'error': 'Invalid food name',
                'message': 'Food name must be a non-empty string'
            }), 400
        
        # Look up food item (case-insensitive)
        food_name_lower = food_name.lower()
        
        if food_name_lower in food_lookup:
            food_item = food_lookup[food_name_lower]
            
            response = {
                'food': food_name,
                'unit': food_item['unit'],
                'unit_desc': food_item['unit_desc']
            }
            
            return jsonify(response)
        else:
            response = {
                'food': food_name,
                'status': 'not_found'
            }
            
            return jsonify(response)
    
    except Exception as e:
        app.logger.error(f"Unexpected error in portion_info: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'An unexpected error occurred while processing your request'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'database_loaded': len(food_database) > 0,
        'total_foods': len(food_database)
    })

@app.route('/foods', methods=['GET'])
def list_foods():
    """List all available foods (optional endpoint for debugging)"""
    return jsonify({
        'total_foods': len(food_database),
        'foods': [{'name': item['name'], 'category': item['category']} for item in food_database]
    })

# Load food database on startup
with app.app_context():
    load_food_database()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
