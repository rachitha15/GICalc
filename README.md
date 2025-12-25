# AI-Powered Glycemic Load Calculator

A Flask-based web application that calculates glycemic load (GL) for meals using a curated Indian food database with AI-powered fallback via OpenAI GPT-4o.

## Features

- **Intelligent Food Recognition**: Natural language meal input with AI parsing
- **Hybrid Data Approach**: 56 curated Indian foods + unlimited AI estimations
- **User Authentication**: JWT-based auth with 24-hour token expiry
- **Rate Limiting**: 4 meal calculations per day per user
- **AI Recommendations**: Smart suggestions for high GL meals (GL >= 11)
- **Visual Results**: Color-coded GL display with detailed breakdowns

---

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL database
- OpenAI API key

### Environment Variables

```bash
SESSION_SECRET=your-secret-key-for-jwt  # Required - app fails without it
DATABASE_URL=postgresql://...           # PostgreSQL connection string
OPENAI_API_KEY=sk-...                   # OpenAI API key for GPT-4o
```

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Or with uv
uv sync

# Run the application
gunicorn --bind 0.0.0.0:5000 main:app
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Flask App                            │
├─────────────────────────────────────────────────────────────┤
│  Templates (Jinja2)  │  API Endpoints  │  Auth Middleware    │
│  - dashboard.html    │  - /calculate-gl│  - JWT tokens        │
│  - review.html       │  - /parse-meal  │  - Rate limiting     │
│  - results.html      │  - /auth/*      │  - Usage tracking    │
├─────────────────────────────────────────────────────────────┤
│              Food Database (JSON)  │  OpenAI GPT-4o          │
│              56 Indian foods       │  AI fallback            │
├─────────────────────────────────────────────────────────────┤
│                     PostgreSQL Database                      │
│                  Users + MealUsage tracking                  │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
├── app.py                      # Main application (routes, models, helpers)
├── main.py                     # Entry point (imports app)
├── attached_assets/
│   └── food_items_db_*.json    # Curated food database (56 items)
├── templates/
│   ├── base.html               # Base template with nav, auth, styles
│   ├── dashboard.html          # Meal input and history
│   ├── review.html             # Food disambiguation and portion editing
│   ├── results.html            # GL results with recommendations
│   ├── login.html              # Login page
│   └── register.html           # Registration page
└── static/                     # Static assets (if any)
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### MealUsage Table (Rate Limiting)

```sql
CREATE TABLE meal_usages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    endpoint VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Reference

### Public Endpoints

#### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "database_loaded": true,
  "total_foods": 56
}
```

#### `GET /foods`
List all foods in the database.

**Response:**
```json
{
  "total_foods": 56,
  "foods": [
    {
      "name": "White Rice",
      "category": "Rice & Grains"
    }
  ]
}
```

---

### Authentication Endpoints

#### `POST /auth/register`
Create a new account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Account created successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2024-01-15T10:30:00"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### `POST /auth/login`
Login and get JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "email": "..." },
  "usage": {
    "used_today": 2,
    "daily_limit": 4,
    "remaining": 2
  }
}
```

#### `GET /auth/me`
Get current user info (requires auth).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": { "id": 1, "email": "..." },
  "usage": {
    "used_today": 2,
    "daily_limit": 4,
    "remaining": 2
  }
}
```

---

### Protected Endpoints (Auth + Rate Limit)

All endpoints below require:
- `Authorization: Bearer <token>` header
- Count toward daily limit (4/day)

#### `POST /calculate-gl`
Calculate glycemic load for a meal.

**Request:**
```json
{
  "meal": [
    { "food": "White Rice", "quantity": 1.5, "unit": "bowl" },
    { "food": "Dal", "quantity": 1, "unit": "bowl" }
  ]
}
```

**Response:**
```json
{
  "total_gl": 18.45,
  "items": [
    {
      "food": "White Rice",
      "gl": 12.30,
      "quantity": 1.5,
      "unit": "bowl",
      "source": "database"
    },
    {
      "food": "Dal",
      "gl": 6.15,
      "quantity": 1,
      "unit": "bowl",
      "source": "database"
    }
  ],
  "suggestions": [
    {
      "text": "Replace half the white rice with brown rice",
      "reason": "Brown rice has lower GI (50 vs 73)"
    }
  ],
  "usage": {
    "used_today": 3,
    "daily_limit": 4,
    "remaining": 1
  }
}
```

#### `POST /parse-meal-smart`
Parse natural language meal description with database disambiguation.

**Request:**
```json
{
  "text": "2 rotis with dal and some rice"
}
```

**Response:**
```json
{
  "items": [
    {
      "parsed_name": "roti",
      "quantity": 2,
      "status": "found",
      "matches": [
        {
          "name": "Roti (Whole Wheat)",
          "gi": 62,
          "unit": "piece",
          "source": "database"
        }
      ],
      "selected": { ... }
    }
  ],
  "usage": { ... }
}
```

#### `POST /parse-meal-chat`
Parse meal description using natural language.

**Request:**
```json
{
  "text": "2 pooris and chole"
}
```

**Response:**
```json
{
  "meal": [
    { "food": "Poori", "quantity": 2 },
    { "food": "Chole Masala", "quantity": 1 }
  ],
  "usage": { ... }
}
```

---

### Protected Endpoints (Auth Only, No Daily Limit)

#### `POST /portion-info`
Get portion information for a specific food item.

**Request:**
```json
{
  "food": "White Rice"
}
```

**Response (database match):**
```json
{
  "food": "White Rice",
  "unit": "bowl",
  "unit_desc": "1 medium bowl = 150g cooked",
  "source": "database"
}
```

**Response (AI generated):**
```json
{
  "food": "Paneer Tikka",
  "unit": "serving",
  "unit_desc": "1 serving = 100g, 6-8 pieces",
  "source": "ai_generated"
}
```

---

## Page Routes (HTML Templates)

| Route | Template | Description |
|-------|----------|-------------|
| `/` | register.html | Landing page (redirects to register) |
| `/register` | register.html | User registration form |
| `/login` | login.html | User login form |
| `/dashboard` | dashboard.html | Meal input and history |
| `/review` | review.html | Food disambiguation and portion editing |
| `/results` | results.html | GL results with recommendations |

---

## Glycemic Load Calculation

The GL formula used:

```
Net Carbs = Carbs per Unit - Fiber per Unit
GL = (GI × Net Carbs / 100) × Quantity
```

### GL Categories

| GL Range | Category | Color |
|----------|----------|-------|
| 0-10     | Low      | Green |
| 11-19    | Medium   | Yellow |
| 20+      | High     | Red |

---

## Authentication Flow

```
1. User registers → POST /auth/register
   └── Returns JWT token (valid 24 hours)

2. User logs in → POST /auth/login
   └── Returns JWT token + usage stats

3. Protected requests include:
   └── Header: Authorization: Bearer <token>

4. Rate limiting:
   └── 4 meal calculations per day (resets at midnight UTC)
   └── Tracked in meal_usages table
```

---

## AI Integration

### When AI is Used

1. **Food Not in Database**: If a food item isn't found in the 56-item database, GPT-4o estimates its nutrition
2. **Meal Parsing**: Natural language input is parsed by GPT-4o
3. **Recommendations**: High GL meals (>= 11) get AI-powered suggestions

### AI Nutrition Estimation

When a food isn't in the database, the system calls GPT-4o with:

```python
prompt = """Give glycemic index (GI), carbs per unit, fiber per unit, 
unit, and unit_desc for one serving of the specified food item.
Return only JSON with keys: gi, carbs_per_unit, fiber_per_unit, unit, unit_desc."""
```

### AI Suggestion Categories

For meals with GL >= 11, suggestions are categorized as:
- **Portion Control**: Reducing quantities
- **Food Swaps**: Lower GI alternatives

---

## Food Database Structure

Each food item in `attached_assets/food_items_db_*.json`:

```json
{
  "name": "White Rice",
  "category": "Rice & Grains",
  "gi": 73,
  "unit": "bowl",
  "unit_desc": "1 medium bowl = 150g cooked",
  "carbs_per_unit": 45,
  "fiber_per_unit": 0.6
}
```

### Categories

- Rice & Grains
- Breads & Rotis
- Lentils & Legumes
- Vegetables
- Fruits
- Sweets & Desserts
- Beverages
- Snacks

---

## User Interface Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Dashboard  │ ──> │   Review    │ ──> │   Results   │ ──> │  Dashboard  │
│             │     │             │     │             │     │             │
│ Enter meal  │     │ Disambiguate│     │ View GL     │     │ Start over  │
│ description │     │ + portions  │     │ + tips      │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### Dashboard (`/dashboard`)
- Text input for meal description (500 char limit)
- Auto-detects meal type by time (Breakfast/Lunch/Dinner/Snack)
- Shows remaining daily calculations

### Review (`/review`)
- Two-panel layout: food list + portion editor
- Disambiguate between database matches
- Adjust portions with presets (0.5x Small, 1x Medium, 1.5x Large)
- Option to use AI estimation for unlisted foods

### Results (`/results`)
- Circular ring indicator with total GL
- Color-coded breakdown per item
- AI recommendations for high GL meals
- Congratulations for low GL meals (0-10)

---

## Security Considerations

1. **Password Hashing**: Werkzeug's `generate_password_hash` (default algorithm)
2. **JWT Tokens**: HS256 algorithm, 24-hour expiry, signed with SESSION_SECRET
3. **Rate Limiting**: Prevents API abuse (4 calculations/day)
4. **Input Validation**: 
   - Email validation via `email-validator`
   - 500 character limit on meal input
   - JSON schema validation on all endpoints
5. **CORS**: Enabled for cross-origin requests
6. **ProxyFix**: Proper HTTPS handling behind reverse proxies

---

## Error Handling

### Common Error Responses

```json
// 400 Bad Request
{
  "error": "Invalid request format",
  "message": "Request must contain 'meal' array"
}

// 401 Unauthorized
{
  "error": "Invalid or expired token",
  "message": "Please login again to get a new token"
}

// 429 Rate Limited
{
  "error": "Daily limit reached",
  "message": "You have used all 4 meal calculations for today",
  "daily_limit": 4,
  "used_today": 4
}

// 500 Internal Error
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Deployment (Render)

### Build Command
```bash
pip install -r requirements.txt
```

### Start Command
```bash
gunicorn --bind 0.0.0.0:5000 main:app
```

### Environment Variables (Required)
- `SESSION_SECRET`: Secret key for JWT signing
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key

---

## Development

### Running Locally

```bash
# Set environment variables
export SESSION_SECRET=dev-secret
export DATABASE_URL=postgresql://localhost/gl_calculator
export OPENAI_API_KEY=sk-...

# Run with hot reload
gunicorn --bind 0.0.0.0:5000 --reload main:app
```

### Logging

Debug logging is enabled by default:

```python
logging.basicConfig(level=logging.DEBUG)
```

Check logs for:
- Food database loading status
- AI API calls and responses
- Authentication failures
- Rate limit enforcement

---

## Testing API Endpoints

### With curl

```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'

# Calculate GL (with token)
curl -X POST http://localhost:5000/calculate-gl \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"meal": [{"food": "White Rice", "quantity": 1}]}'
```

---

## License

MIT License

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

For questions or issues, please open a GitHub issue.
