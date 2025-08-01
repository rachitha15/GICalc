import os
import json
import logging
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
from openai import OpenAI

# Configure logging for debugging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key")

# Enable CORS for all routes
CORS(app)

# Initialize OpenAI client
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# Global variable to store food database
food_database = {}
food_lookup = {}  # Case-insensitive lookup dictionary

def load_food_database():
    """Load food database from JSON file on startup"""
    global food_database, food_lookup
    
    # Try to load from the uploaded file path
    json_file_path = 'attached_assets/food_items_db_1753605645874.json'
    
    try:
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

def get_nutrition_from_ai(food_name):
    """Get nutrition information from OpenAI for unknown food items"""
    try:
        if not openai_client:
            app.logger.error("OpenAI client not available for nutrition lookup")
            return None
        
        # Prepare prompt for GPT-4
        system_prompt = """Give glycemic index (GI), carbs per unit (in grams), fiber per unit (in grams), unit, and unit_desc for one serving of the specified food item.
Return only in JSON with keys: gi, carbs_per_unit, fiber_per_unit, unit, unit_desc.

Example for 'Kheer':
{
  "gi": 45,
  "carbs_per_unit": 28,
  "fiber_per_unit": 1,
  "unit": "bowl",
  "unit_desc": "1 bowl = 150g, milk and rice-based sweet dish"
}"""
        
        # Call OpenAI API
        # the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
        # do not change this unless explicitly requested by the user
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Get nutrition info for: {food_name}"}
            ],
            response_format={"type": "json_object"},
            max_tokens=300,
            temperature=0.3
        )
        
        # Parse the response
        gpt_response = response.choices[0].message.content
        if not gpt_response:
            app.logger.error(f"Empty response from AI for {food_name}")
            return None
        nutrition_data = json.loads(gpt_response)
        
        # Validate the response structure
        required_keys = ['gi', 'carbs_per_unit', 'fiber_per_unit', 'unit', 'unit_desc']
        if not all(key in nutrition_data for key in required_keys):
            app.logger.error(f"Invalid nutrition data structure from AI: {nutrition_data}")
            return None
        
        # Validate data types
        try:
            nutrition_data['gi'] = float(nutrition_data['gi'])
            nutrition_data['carbs_per_unit'] = float(nutrition_data['carbs_per_unit'])
            nutrition_data['fiber_per_unit'] = float(nutrition_data['fiber_per_unit'])
        except (ValueError, TypeError):
            app.logger.error(f"Invalid nutrition data types from AI: {nutrition_data}")
            return None
        
        app.logger.info(f"Successfully retrieved AI nutrition data for {food_name}: GI={nutrition_data['gi']}, Carbs={nutrition_data['carbs_per_unit']}, Fiber={nutrition_data['fiber_per_unit']}")
        return nutrition_data
        
    except json.JSONDecodeError as e:
        app.logger.error(f"Failed to parse AI nutrition JSON response: {e}")
        return None
    except Exception as e:
        app.logger.error(f"Error getting nutrition from AI for {food_name}: {e}")
        return None

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
                # Try to get nutrition info from AI
                ai_nutrition = get_nutrition_from_ai(food_name)
                
                if ai_nutrition:
                    # Calculate GL using AI-provided nutrition data
                    gl = calculate_glycemic_load(ai_nutrition, quantity)
                    total_gl += gl
                    
                    items.append({
                        'food': food_name,
                        'gl': gl,
                        'status': 'ai_estimated'
                    })
                else:
                    items.append({
                        'food': food_name,
                        'status': 'not_found'
                    })
        
        # Get AI suggestions for meal improvement
        suggestions = get_meal_suggestions(items, total_gl)
        
        # Return response
        response = {
            'total_gl': round(total_gl, 2),
            'items': items,
            'suggestions': suggestions
        }
        
        return jsonify(response)
    
    except Exception as e:
        app.logger.error(f"Unexpected error in calculate_gl: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'An unexpected error occurred while processing your request'
        }), 500

@app.route('/parse-meal-chat', methods=['POST'])
def parse_meal_chat():
    """Parse meal description using OpenAI GPT-4"""
    try:
        # Check if OpenAI is available
        if not openai_client:
            return jsonify({
                'status': 'error',
                'message': 'OpenAI API key not configured'
            }), 500
        
        # Get JSON data from request
        if not request.is_json:
            return jsonify({
                'error': 'Request must be JSON',
                'message': 'Content-Type must be application/json'
            }), 400
        
        data = request.get_json()
        
        # Validate request structure
        if not data or 'text' not in data:
            return jsonify({
                'error': 'Invalid request format',
                'message': 'Request must contain "text" field'
            }), 400
        
        meal_text = data['text']
        
        # Validate meal text
        if not meal_text or not isinstance(meal_text, str):
            return jsonify({
                'error': 'Invalid meal text',
                'message': 'Meal text must be a non-empty string'
            }), 400
        
        # Enhanced prompt with better food name mapping
        system_prompt = """Parse meal descriptions into structured JSON format.

Use these specific food name mappings for common items:
- "rice" → "White Rice"
- "basmati rice" → "Basmati Rice" 
- "brown rice" → "Brown Rice"
- "roti" → "Roti"
- "chapati" → "Roti"
- "dal" → "Dal"
- "chole" → "Chole Masala"
- "rajma" → "Rajma"
- "poori" → "Poori"
- "chicken curry" → "Chicken Dish (homemade)"
- "chicken" → "Chicken Dish (homemade)"

Return JSON with "meal" key containing array of objects with "food" and "quantity" keys.
Examples:
"2 pooris and chole" → {"meal": [{"food": "Poori", "quantity": 2}, {"food": "Chole Masala", "quantity": 1}]}
"rice and dal" → {"meal": [{"food": "White Rice", "quantity": 1}, {"food": "Dal", "quantity": 1}]}
"chicken curry and rice" → {"meal": [{"food": "Chicken Curry", "quantity": 1}, {"food": "White Rice", "quantity": 1}]}

Important: Always return a JSON object with a "meal" key containing an array of food items."""
        
        # Call OpenAI API
        # the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
        # do not change this unless explicitly requested by the user
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Parse this meal: {meal_text}"}
            ],
            response_format={"type": "json_object"},
            max_tokens=500,
            temperature=0.3
        )
        
        # Parse the response
        gpt_response = response.choices[0].message.content
        
        try:
            # Parse JSON response from GPT
            if not gpt_response:
                return jsonify({
                    'status': 'error',
                    'message': 'Could not parse meal'
                }), 400
            parsed_response = json.loads(gpt_response)
            
            # Check if the response is a valid array format
            if isinstance(parsed_response, dict) and 'meal' in parsed_response:
                meal_array = parsed_response['meal']
            elif isinstance(parsed_response, list):
                meal_array = parsed_response
            else:
                # If GPT didn't return the expected format, try to extract array
                app.logger.warning(f"Unexpected GPT response format: {parsed_response}")
                return jsonify({
                    'status': 'error',
                    'message': 'Could not parse meal'
                }), 400
            
            # Validate the array structure
            if not isinstance(meal_array, list):
                return jsonify({
                    'status': 'error',
                    'message': 'Could not parse meal'
                }), 400
            
            # Validate each item in the array
            for item in meal_array:
                if not isinstance(item, dict) or 'food' not in item or 'quantity' not in item:
                    return jsonify({
                        'status': 'error',
                        'message': 'Could not parse meal'
                    }), 400
            
            return jsonify(meal_array)
        
        except json.JSONDecodeError:
            app.logger.error(f"Failed to parse GPT JSON response: {gpt_response}")
            return jsonify({
                'status': 'error',
                'message': 'Could not parse meal'
            }), 400
    
    except Exception as e:
        app.logger.error(f"Unexpected error in parse_meal_chat: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Could not parse meal'
        }), 500

@app.route('/parse-meal-smart', methods=['POST'])
def parse_meal_smart():
    """Smart meal parsing with database disambiguation"""
    try:
        # Check if OpenAI is available
        if not openai_client:
            return jsonify({
                'status': 'error',
                'message': 'OpenAI API key not configured'
            }), 500
        
        # Get JSON data from request
        if not request.is_json:
            return jsonify({
                'error': 'Request must be JSON',
                'message': 'Content-Type must be application/json'
            }), 400
        
        data = request.get_json()
        
        # Validate request structure
        if not data or 'text' not in data:
            return jsonify({
                'error': 'Invalid request format',
                'message': 'Request must contain "text" field'
            }), 400
        
        meal_text = data['text']
        
        # Validate meal text
        if not meal_text or not isinstance(meal_text, str):
            return jsonify({
                'error': 'Invalid meal text',
                'message': 'Meal text must be a non-empty string'
            }), 400
        
        # Simple parsing prompt - just extract food names and quantities
        system_prompt = """Parse meal descriptions into structured JSON format.
        
Extract food items and their quantities from the input text.
Use common food names without specific mapping - just extract what the user mentioned.

Return JSON with "meal" key containing array of objects with "food" and "quantity" keys.
Examples:
"2 pooris and chole" → {"meal": [{"food": "Poori", "quantity": 2}, {"food": "Chole", "quantity": 1}]}
"rice and dal" → {"meal": [{"food": "Rice", "quantity": 1}, {"food": "Dal", "quantity": 1}]}
"chicken curry and rice" → {"meal": [{"food": "Chicken", "quantity": 1}, {"food": "Rice", "quantity": 1}]}

Important: Always return a JSON object with a "meal" key containing an array of food items."""
        
        # Call OpenAI API for basic parsing
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Parse this meal: {meal_text}"}
            ],
            response_format={"type": "json_object"},
            max_tokens=500,
            temperature=0.3
        )
        
        # Parse the response
        gpt_response = response.choices[0].message.content
        if not gpt_response:
            return jsonify({
                'status': 'error',
                'message': 'Could not parse meal'
            }), 400
        parsed_response = json.loads(gpt_response)
        
        if 'meal' not in parsed_response:
            return jsonify({
                'status': 'error',
                'message': 'Could not parse meal'
            }), 400
        
        meal_array = parsed_response['meal']
        
        # Check if any food items were actually found
        if not meal_array or len(meal_array) == 0:
            return jsonify({
                'status': 'error',
                'message': 'No food items found in your description'
            }), 400
        
        result_items = []
        
        # Check each food item for database matches
        for item in meal_array:
            food_name = item['food'].lower()
            quantity = item['quantity']
            
            # Find potential matches in database
            matches = []
            for db_food in food_database:
                db_name_lower = db_food['name'].lower()
                # Check for partial matches (chicken matches "chicken dish")
                if food_name in db_name_lower or any(word in db_name_lower for word in food_name.split()):
                    matches.append({
                        'name': db_food['name'],
                        'category': db_food['category'],
                        'unit_desc': db_food['unit_desc']
                    })
            
            if len(matches) == 0:
                # No database matches - will need AI estimation
                result_items.append({
                    'original_name': item['food'],
                    'quantity': quantity,
                    'status': 'needs_ai',
                    'matches': []
                })
            elif len(matches) == 1:
                # Single match - use it directly
                result_items.append({
                    'original_name': item['food'],
                    'quantity': quantity,
                    'status': 'single_match',
                    'selected_food': matches[0]['name'],
                    'matches': matches
                })
            else:
                # Multiple matches - need user disambiguation
                result_items.append({
                    'original_name': item['food'],
                    'quantity': quantity,
                    'status': 'needs_disambiguation',
                    'matches': matches
                })
        
        return jsonify({
            'status': 'success',
            'items': result_items
        })
        
    except Exception as e:
        app.logger.error(f"Unexpected error in parse_meal_smart: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Could not parse meal'
        }), 500

def get_meal_suggestions(meal_items, total_gl):
    """Get AI-powered meal improvement suggestions"""
    try:
        # Only provide suggestions for moderate (11-19) and high (20+) GL meals
        if total_gl < 11:
            return []
            
        if not openai_client:
            app.logger.error("OpenAI client not available for suggestions")
            return []
        
        # Build meal description for AI
        meal_description = []
        for item in meal_items:
            food_name = item['food']
            gl = item['gl']
            status = item.get('status', 'database')
            meal_description.append(f"- {food_name}: GL {gl:.1f} ({'AI estimated' if status == 'ai_estimated' else 'database'})")
        
        meal_text = '\n'.join(meal_description)
        
        # Customizable prompt for meal suggestions
        system_prompt = """You are a nutrition expert providing specific meal improvement suggestions for glycemic load management.

Given a meal with its glycemic load (GL) breakdown, provide 3-4 actionable suggestions to improve the meal's impact on blood sugar.

GUIDELINES:
- Focus on SPECIFIC food swaps, not generic advice
- Consider the actual foods in the meal
- Suggest specific Indian foods from common diet when possible
- Include portion modifications, not just food substitutions
- Explain WHY each suggestion helps (GL reduction, fiber addition, etc.)
- Be concise but specific

GL RANGES:
- Low GL (0-10): Minimal impact, maintain or optimize
- Medium GL (11-19): Moderate impact, some improvements beneficial  
- High GL (20+): Significant impact, prioritize reductions

MEAL TO ANALYZE:
{meal_text}
Total GL: {total_gl}

Return ONLY valid JSON with "suggestions" array containing objects with "text" and "reason" keys. Do not include any other text or formatting.

Example response:
{{"suggestions": [{{"text": "Replace white rice with brown rice or reduce portion by half", "reason": "Cuts GL by ~40% due to higher fiber and smaller portion"}}, {{"text": "Add 1 cup mixed salad with cucumber and tomatoes before eating", "reason": "Fiber slows glucose absorption, reducing overall meal impact"}}]}}"""
        
        # Call OpenAI API
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt.format(meal_text=meal_text, total_gl=total_gl)},
                {"role": "user", "content": f"Provide specific improvement suggestions for this meal with total GL of {total_gl:.1f}"}
            ],
            response_format={"type": "json_object"},
            max_tokens=800,
            temperature=0.4
        )
        
        # Parse the response
        gpt_response = response.choices[0].message.content
        if not gpt_response:
            return []
        suggestions_data = json.loads(gpt_response)
        
        if 'suggestions' in suggestions_data and isinstance(suggestions_data['suggestions'], list):
            return suggestions_data['suggestions']
        else:
            app.logger.error(f"Invalid suggestions response format: {suggestions_data}")
            return []
            
    except Exception as e:
        app.logger.error(f"Error generating meal suggestions: {e}")
        return []

def find_similar_food_portions(food_name):
    """Find similar foods in database for portion size reference"""
    food_name_lower = food_name.lower()
    food_words = food_name_lower.split()
    
    # Look for foods with similar keywords
    similar_foods = []
    for item in food_database:
        item_name_lower = item['name'].lower()
        item_words = item_name_lower.split()
        
        # Check for common words (excluding very common words)
        common_words = set(food_words) & set(item_words)
        common_words = common_words - {'with', 'and', 'in', 'of', 'the', 'a', 'an', 'or'}
        
        if len(common_words) > 0:
            similar_foods.append({
                'name': item['name'],
                'unit_desc': item['unit_desc'],
                'common_words': len(common_words)
            })
    
    # Sort by number of common words (descending)
    similar_foods.sort(key=lambda x: x['common_words'], reverse=True)
    
    return similar_foods[:3]  # Return top 3 matches

def get_ai_portion_description(food_name):
    """Get AI-generated portion description for unknown foods"""
    if not openai_client:
        return f"1 serving (typical portion for {food_name})"
    
    try:
        prompt = f"""Provide typical portion sizes for "{food_name}" in Indian cuisine context.

Return a JSON object with "unit_desc" containing a brief, practical description of what 1 serving typically weighs or looks like.

Examples:
- For curries/masala: "150g (1 medium bowl)"  
- For rice dishes: "200g (1 cup cooked)"
- For bread items: "40g (1 medium piece)"
- For vegetable dishes: "100g (1 serving spoon)"

Keep it concise and practical. Return only JSON format: {{"unit_desc": "description"}}"""

        response = openai_client.chat.completions.create(
            model="gpt-4o",  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages=[
                {"role": "system", "content": "You are a nutrition expert providing portion size guidance."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=200,
            temperature=0.3
        )
        
        result_content = response.choices[0].message.content
        if not result_content:
            return f"1 serving (typical portion for {food_name})"
        result = json.loads(result_content)
        return result.get('unit_desc', f"1 serving (typical portion)")
        
    except Exception as e:
        app.logger.error(f"Error getting AI portion description: {e}")
        return f"1 serving (typical portion for {food_name})"

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
            # Food found in database
            food_item = food_lookup[food_name_lower]
            
            response = {
                'food': food_name,
                'unit': food_item['unit'],
                'unit_desc': food_item['unit_desc'],
                'source': 'database'
            }
            
            return jsonify(response)
        else:
            # Food not in database - use hybrid approach
            
            # Step 1: Look for similar foods
            similar_foods = find_similar_food_portions(food_name)
            
            if similar_foods:
                # Use portion description from most similar food
                unit_desc = similar_foods[0]['unit_desc']
                response = {
                    'food': food_name,
                    'unit': 'serving',
                    'unit_desc': unit_desc,
                    'source': 'similar_food',
                    'reference_food': similar_foods[0]['name']
                }
            else:
                # Step 2: Fall back to AI-generated description
                unit_desc = get_ai_portion_description(food_name)
                response = {
                    'food': food_name,
                    'unit': 'serving', 
                    'unit_desc': unit_desc,
                    'source': 'ai_generated'
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

# Frontend routes
@app.route('/assets/<path:path>')
def serve_assets(path):
    """Serve static assets from dist/assets"""
    return send_from_directory('dist/assets', path)

@app.route('/')
def serve_frontend():
    """Serve the React frontend"""
    return send_file('dist/index.html')

@app.route('/<path:path>')
def serve_spa(path):
    """Serve React SPA - redirect all non-API routes to index.html"""
    # Skip API routes
    if path.startswith('api/') or path in ['health', 'foods', 'calculate-gl', 'parse-meal-chat', 'portion-info']:
        return jsonify({'error': 'API route not found'}), 404
    
    # Serve the React app for all other routes
    return send_file('dist/index.html')

# Load food database on startup
with app.app_context():
    load_food_database()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
