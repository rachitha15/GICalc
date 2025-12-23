import os
import json
import logging
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.middleware.proxy_fix import ProxyFix
from openai import OpenAI
import jwt
from email_validator import validate_email, EmailNotValidError

# Configure logging for debugging
logging.basicConfig(level=logging.DEBUG)


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)

# Create Flask app
app = Flask(__name__)

# Require SESSION_SECRET for security - fail fast if missing
SESSION_SECRET = os.environ.get("SESSION_SECRET")
if not SESSION_SECRET:
    raise RuntimeError("SESSION_SECRET environment variable is required for secure JWT signing")

app.secret_key = SESSION_SECRET
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Database configuration
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Initialize SQLAlchemy
db.init_app(app)

# Enable CORS for all routes
CORS(app)

# Initialize OpenAI client
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# JWT configuration (uses same SESSION_SECRET for consistency)
JWT_SECRET = SESSION_SECRET
JWT_EXPIRY_HOURS = 24

# Daily meal limit per user
DAILY_MEAL_LIMIT = 4

# Global variable to store food database
food_database = []
food_lookup = {}


# ============================================
# DATABASE MODELS
# ============================================

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    meal_usages = db.relationship('MealUsage', backref='user', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }


class MealUsage(db.Model):
    __tablename__ = 'meal_usages'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    endpoint = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)


# ============================================
# AUTHENTICATION HELPERS
# ============================================

def generate_token(user_id):
    """Generate JWT token for a user"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')


def decode_token(token):
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def require_auth(f):
    """Decorator to require authentication for endpoints"""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({
                'error': 'Authorization required',
                'message': 'Please provide an Authorization header with Bearer token'
            }), 401
        
        # Extract token from "Bearer <token>" format
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({
                'error': 'Invalid authorization format',
                'message': 'Authorization header must be: Bearer <token>'
            }), 401
        
        token = parts[1]
        user_id = decode_token(token)
        
        if not user_id:
            return jsonify({
                'error': 'Invalid or expired token',
                'message': 'Please login again to get a new token'
            }), 401
        
        # Get user from database
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({
                'error': 'User not found',
                'message': 'The user associated with this token no longer exists'
            }), 401
        
        # Add user to request context
        request.current_user = user
        return f(*args, **kwargs)
    
    return decorated


def check_daily_limit(user_id, endpoint):
    """Check if user has exceeded daily meal limit and log usage if allowed"""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Count today's usage
    today_count = MealUsage.query.filter(
        MealUsage.user_id == user_id,
        MealUsage.created_at >= today_start
    ).count()
    
    if today_count >= DAILY_MEAL_LIMIT:
        return False, today_count
    
    # Log this usage
    usage = MealUsage(user_id=user_id, endpoint=endpoint)
    db.session.add(usage)
    db.session.commit()
    
    return True, today_count + 1


def require_auth_with_limit(f):
    """Decorator that requires auth AND enforces daily meal limit"""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({
                'error': 'Authorization required',
                'message': 'Please provide an Authorization header with Bearer token'
            }), 401
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({
                'error': 'Invalid authorization format',
                'message': 'Authorization header must be: Bearer <token>'
            }), 401
        
        token = parts[1]
        user_id = decode_token(token)
        
        if not user_id:
            return jsonify({
                'error': 'Invalid or expired token',
                'message': 'Please login again to get a new token'
            }), 401
        
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({
                'error': 'User not found',
                'message': 'The user associated with this token no longer exists'
            }), 401
        
        # Check daily limit
        allowed, count = check_daily_limit(user_id, request.endpoint)
        if not allowed:
            return jsonify({
                'error': 'Daily limit reached',
                'message': f'You have used all {DAILY_MEAL_LIMIT} meal calculations for today. Please try again tomorrow.',
                'daily_limit': DAILY_MEAL_LIMIT,
                'used_today': count
            }), 429
        
        request.current_user = user
        request.usage_count = count
        return f(*args, **kwargs)
    
    return decorated


# ============================================
# AUTH ENDPOINTS
# ============================================

@app.route('/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        if not request.is_json:
            return jsonify({
                'error': 'Request must be JSON',
                'message': 'Content-Type must be application/json'
            }), 400
        
        data = request.get_json()
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Validate email
        if not email:
            return jsonify({
                'error': 'Email required',
                'message': 'Please provide an email address'
            }), 400
        
        try:
            valid = validate_email(email)
            email = valid.email
        except EmailNotValidError as e:
            return jsonify({
                'error': 'Invalid email',
                'message': str(e)
            }), 400
        
        # Validate password
        if not password or len(password) < 6:
            return jsonify({
                'error': 'Invalid password',
                'message': 'Password must be at least 6 characters'
            }), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({
                'error': 'Email already registered',
                'message': 'An account with this email already exists. Please login instead.'
            }), 409
        
        # Create new user
        user = User(email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        # Generate token
        token = generate_token(user.id)
        
        return jsonify({
            'status': 'success',
            'message': 'Account created successfully',
            'user': user.to_dict(),
            'token': token
        }), 201
        
    except Exception as e:
        app.logger.error(f"Error in register: {e}")
        db.session.rollback()
        return jsonify({
            'error': 'Registration failed',
            'message': 'An unexpected error occurred'
        }), 500


@app.route('/auth/login', methods=['POST'])
def login():
    """Login and get JWT token"""
    try:
        if not request.is_json:
            return jsonify({
                'error': 'Request must be JSON',
                'message': 'Content-Type must be application/json'
            }), 400
        
        data = request.get_json()
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({
                'error': 'Credentials required',
                'message': 'Please provide email and password'
            }), 400
        
        # Find user
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({
                'error': 'Invalid credentials',
                'message': 'Email or password is incorrect'
            }), 401
        
        # Generate token
        token = generate_token(user.id)
        
        # Get today's usage count
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_count = MealUsage.query.filter(
            MealUsage.user_id == user.id,
            MealUsage.created_at >= today_start
        ).count()
        
        return jsonify({
            'status': 'success',
            'message': 'Login successful',
            'user': user.to_dict(),
            'token': token,
            'usage': {
                'used_today': today_count,
                'daily_limit': DAILY_MEAL_LIMIT,
                'remaining': DAILY_MEAL_LIMIT - today_count
            }
        })
        
    except Exception as e:
        app.logger.error(f"Error in login: {e}")
        return jsonify({
            'error': 'Login failed',
            'message': 'An unexpected error occurred'
        }), 500


@app.route('/auth/me', methods=['GET'])
@require_auth
def get_current_user():
    """Get current user info and usage stats"""
    try:
        user = request.current_user
        
        # Get today's usage count
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_count = MealUsage.query.filter(
            MealUsage.user_id == user.id,
            MealUsage.created_at >= today_start
        ).count()
        
        return jsonify({
            'user': user.to_dict(),
            'usage': {
                'used_today': today_count,
                'daily_limit': DAILY_MEAL_LIMIT,
                'remaining': DAILY_MEAL_LIMIT - today_count
            }
        })
        
    except Exception as e:
        app.logger.error(f"Error in get_current_user: {e}")
        return jsonify({
            'error': 'Failed to get user info',
            'message': 'An unexpected error occurred'
        }), 500


# ============================================
# FOOD DATABASE HELPERS
# ============================================

def load_food_database():
    """Load food database from JSON file on startup"""
    global food_database, food_lookup
    
    json_file_path = 'attached_assets/food_items_db_1753605645874.json'
    
    try:
        with open(json_file_path, 'r', encoding='utf-8') as file:
            food_database = json.load(file)
        
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
        
        gpt_response = response.choices[0].message.content
        if not gpt_response:
            app.logger.error(f"Empty response from AI for {food_name}")
            return None
        nutrition_data = json.loads(gpt_response)
        
        required_keys = ['gi', 'carbs_per_unit', 'fiber_per_unit', 'unit', 'unit_desc']
        if not all(key in nutrition_data for key in required_keys):
            app.logger.error(f"Invalid nutrition data structure from AI: {nutrition_data}")
            return None
        
        try:
            nutrition_data['gi'] = float(nutrition_data['gi'])
            nutrition_data['carbs_per_unit'] = float(nutrition_data['carbs_per_unit'])
            nutrition_data['fiber_per_unit'] = float(nutrition_data['fiber_per_unit'])
        except (ValueError, TypeError):
            app.logger.error(f"Invalid nutrition data types from AI: {nutrition_data}")
            return None
        
        app.logger.info(f"Successfully retrieved AI nutrition data for {food_name}")
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
        
        net_carbs = carbs_per_unit - fiber_per_unit
        gl = (gi * net_carbs / 100) * quantity
        
        return round(gl, 2)
    except (KeyError, TypeError, ZeroDivisionError) as e:
        app.logger.error(f"Error calculating glycemic load: {e}")
        return 0


def get_meal_suggestions(meal_items, total_gl):
    """Get AI-powered meal improvement suggestions"""
    try:
        if total_gl < 11:
            return []
            
        if not openai_client:
            app.logger.error("OpenAI client not available for suggestions")
            return []
        
        meal_description = []
        for item in meal_items:
            food_name = item['food']
            gl = item.get('gl', 0)
            status = item.get('status', 'database')
            meal_description.append(f"- {food_name}: GL {gl:.1f} ({'AI estimated' if status == 'ai_estimated' else 'database'})")
        
        meal_text = '\n'.join(meal_description)
        
        system_prompt = """You are a nutrition expert providing specific meal improvement suggestions for glycemic load management.

Given a meal with its glycemic load (GL) breakdown, provide 3-4 actionable suggestions to improve the meal's impact on blood sugar.

GUIDELINES:
- Focus on SPECIFIC food swaps, not generic advice
- Consider the actual foods in the meal
- Suggest specific Indian foods from common diet when possible
- Include portion modifications, not just food substitutions
- Explain WHY each suggestion helps
- Be concise but specific

Return ONLY valid JSON with "suggestions" array containing objects with "text" and "reason" keys."""
        
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Meal:\n{meal_text}\nTotal GL: {total_gl:.1f}\n\nProvide improvement suggestions."}
            ],
            response_format={"type": "json_object"},
            max_tokens=800,
            temperature=0.4
        )
        
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
    
    similar_foods = []
    for item in food_database:
        item_name_lower = item['name'].lower()
        item_words = item_name_lower.split()
        
        common_words = set(food_words) & set(item_words)
        common_words = common_words - {'with', 'and', 'in', 'of', 'the', 'a', 'an', 'or'}
        
        if len(common_words) > 0:
            similar_foods.append({
                'name': item['name'],
                'unit_desc': item['unit_desc'],
                'common_words': len(common_words)
            })
    
    similar_foods.sort(key=lambda x: x['common_words'], reverse=True)
    
    return similar_foods[:3]


def get_ai_portion_description(food_name):
    """Get AI-generated portion description for unknown foods"""
    if not openai_client:
        return f"1 serving (typical portion for {food_name})"
    
    try:
        prompt = f"""Provide typical portion sizes for "{food_name}" in Indian cuisine context.

Return a JSON object with "unit_desc" containing a brief, practical description of what 1 serving typically weighs or looks like.

Keep it concise and practical. Return only JSON format: {{"unit_desc": "description"}}"""

        response = openai_client.chat.completions.create(
            model="gpt-4o",
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


# ============================================
# PROTECTED AI ENDPOINTS (require auth + limit)
# ============================================

@app.route('/calculate-gl', methods=['POST'])
@require_auth_with_limit
def calculate_gl():
    """Calculate glycemic load for a meal (PROTECTED - counts toward daily limit)"""
    try:
        if not request.is_json:
            return jsonify({
                'error': 'Request must be JSON',
                'message': 'Content-Type must be application/json'
            }), 400
        
        data = request.get_json()
        
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
        
        total_gl = 0
        items = []
        
        for meal_item in meal:
            if not isinstance(meal_item, dict) or 'food' not in meal_item or 'quantity' not in meal_item:
                items.append({
                    'food': meal_item.get('food', 'Unknown'),
                    'status': 'invalid_format',
                    'message': 'Each meal item must have "food" and "quantity" fields'
                })
                continue
            
            food_name = meal_item['food']
            quantity = meal_item['quantity']
            
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
                ai_nutrition = get_nutrition_from_ai(food_name)
                
                if ai_nutrition:
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
        
        suggestions = get_meal_suggestions(items, total_gl)
        
        response = {
            'total_gl': round(total_gl, 2),
            'items': items,
            'suggestions': suggestions,
            'usage': {
                'used_today': request.usage_count,
                'daily_limit': DAILY_MEAL_LIMIT,
                'remaining': DAILY_MEAL_LIMIT - request.usage_count
            }
        }
        
        return jsonify(response)
    
    except Exception as e:
        app.logger.error(f"Unexpected error in calculate_gl: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'An unexpected error occurred while processing your request'
        }), 500


@app.route('/parse-meal-chat', methods=['POST'])
@require_auth_with_limit
def parse_meal_chat():
    """Parse meal description using OpenAI GPT-4 (PROTECTED - counts toward daily limit)"""
    try:
        if not openai_client:
            return jsonify({
                'status': 'error',
                'message': 'OpenAI API key not configured'
            }), 500
        
        if not request.is_json:
            return jsonify({
                'error': 'Request must be JSON',
                'message': 'Content-Type must be application/json'
            }), 400
        
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'error': 'Invalid request format',
                'message': 'Request must contain "text" field'
            }), 400
        
        meal_text = data['text']
        
        if not meal_text or not isinstance(meal_text, str):
            return jsonify({
                'error': 'Invalid meal text',
                'message': 'Meal text must be a non-empty string'
            }), 400
        
        system_prompt = """Parse meal descriptions into structured JSON format.

Return JSON with "meal" key containing array of objects with "food" and "quantity" keys.
Examples:
"2 pooris and chole" → {"meal": [{"food": "Poori", "quantity": 2}, {"food": "Chole Masala", "quantity": 1}]}
"rice and dal" → {"meal": [{"food": "White Rice", "quantity": 1}, {"food": "Dal", "quantity": 1}]}

Important: Always return a JSON object with a "meal" key containing an array of food items."""
        
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
        
        gpt_response = response.choices[0].message.content
        
        try:
            if not gpt_response:
                return jsonify({
                    'status': 'error',
                    'message': 'Could not parse meal'
                }), 400
            parsed_response = json.loads(gpt_response)
            
            if isinstance(parsed_response, dict) and 'meal' in parsed_response:
                meal_array = parsed_response['meal']
            elif isinstance(parsed_response, list):
                meal_array = parsed_response
            else:
                return jsonify({
                    'status': 'error',
                    'message': 'Could not parse meal'
                }), 400
            
            if not isinstance(meal_array, list):
                return jsonify({
                    'status': 'error',
                    'message': 'Could not parse meal'
                }), 400
            
            return jsonify({
                'meal': meal_array,
                'usage': {
                    'used_today': request.usage_count,
                    'daily_limit': DAILY_MEAL_LIMIT,
                    'remaining': DAILY_MEAL_LIMIT - request.usage_count
                }
            })
        
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
@require_auth_with_limit
def parse_meal_smart():
    """Smart meal parsing with database disambiguation (PROTECTED - counts toward daily limit)"""
    try:
        if not openai_client:
            return jsonify({
                'status': 'error',
                'message': 'OpenAI API key not configured'
            }), 500
        
        if not request.is_json:
            return jsonify({
                'error': 'Request must be JSON',
                'message': 'Content-Type must be application/json'
            }), 400
        
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'error': 'Invalid request format',
                'message': 'Request must contain "text" field'
            }), 400
        
        meal_text = data['text']
        
        if not meal_text or not isinstance(meal_text, str):
            return jsonify({
                'error': 'Invalid meal text',
                'message': 'Meal text must be a non-empty string'
            }), 400
        
        system_prompt = """Parse meal descriptions into structured JSON format.
        
Extract food items and their quantities from the input text.
Use common food names without specific mapping - just extract what the user mentioned.

Return JSON with "meal" key containing array of objects with "food" and "quantity" keys.

Important: Always return a JSON object with a "meal" key containing an array of food items."""
        
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
        
        if not meal_array or len(meal_array) == 0:
            return jsonify({
                'status': 'error',
                'message': 'No food items found in your description'
            }), 400
        
        result_items = []
        
        for item in meal_array:
            food_name = item['food'].lower()
            quantity = item['quantity']
            
            matches = []
            for db_food in food_database:
                db_name_lower = db_food['name'].lower()
                if food_name in db_name_lower or any(word in db_name_lower for word in food_name.split()):
                    matches.append({
                        'name': db_food['name'],
                        'category': db_food['category'],
                        'unit_desc': db_food['unit_desc']
                    })
            
            if len(matches) == 0:
                result_items.append({
                    'original_name': item['food'],
                    'quantity': quantity,
                    'status': 'needs_ai',
                    'matches': []
                })
            elif len(matches) == 1:
                result_items.append({
                    'original_name': item['food'],
                    'quantity': quantity,
                    'status': 'single_match',
                    'selected_food': matches[0]['name'],
                    'matches': matches
                })
            else:
                result_items.append({
                    'original_name': item['food'],
                    'quantity': quantity,
                    'status': 'needs_disambiguation',
                    'matches': matches
                })
        
        return jsonify({
            'status': 'success',
            'items': result_items,
            'usage': {
                'used_today': request.usage_count,
                'daily_limit': DAILY_MEAL_LIMIT,
                'remaining': DAILY_MEAL_LIMIT - request.usage_count
            }
        })
        
    except Exception as e:
        app.logger.error(f"Unexpected error in parse_meal_smart: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Could not parse meal'
        }), 500


@app.route('/portion-info', methods=['POST'])
@require_auth
def portion_info():
    """Get portion information for a specific food item (PROTECTED - no daily limit)"""
    try:
        if not request.is_json:
            return jsonify({
                'error': 'Request must be JSON',
                'message': 'Content-Type must be application/json'
            }), 400
        
        data = request.get_json()
        
        if not data or 'food' not in data:
            return jsonify({
                'error': 'Invalid request format',
                'message': 'Request must contain "food" field'
            }), 400
        
        food_name = data['food']
        
        if not food_name or not isinstance(food_name, str):
            return jsonify({
                'error': 'Invalid food name',
                'message': 'Food name must be a non-empty string'
            }), 400
        
        food_name_lower = food_name.lower()
        
        if food_name_lower in food_lookup:
            food_item = food_lookup[food_name_lower]
            
            response = {
                'food': food_name,
                'unit': food_item['unit'],
                'unit_desc': food_item['unit_desc'],
                'source': 'database'
            }
            
            return jsonify(response)
        else:
            similar_foods = find_similar_food_portions(food_name)
            
            if similar_foods:
                unit_desc = similar_foods[0]['unit_desc']
                response = {
                    'food': food_name,
                    'unit': 'serving',
                    'unit_desc': unit_desc,
                    'source': 'similar_food',
                    'reference_food': similar_foods[0]['name']
                }
            else:
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


# ============================================
# PUBLIC ENDPOINTS (no auth required)
# ============================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint (PUBLIC)"""
    return jsonify({
        'status': 'healthy',
        'database_loaded': len(food_database) > 0,
        'total_foods': len(food_database)
    })


@app.route('/foods', methods=['GET'])
def list_foods():
    """List all available foods (PUBLIC)"""
    return jsonify({
        'total_foods': len(food_database),
        'foods': [{'name': item['name'], 'category': item['category']} for item in food_database]
    })


# ============================================
# DATABASE INITIALIZATION
# ============================================

with app.app_context():
    db.create_all()
    load_food_database()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
