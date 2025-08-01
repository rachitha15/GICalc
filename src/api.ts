const API_BASE = ''; // Use relative URLs since frontend and backend are served from same domain

export interface ParsedMealItem {
  food: string;
  quantity: number;
}

export interface PortionInfo {
  food: string;
  unit: string;
  unit_desc: string;
}

export interface GLCalculationItem {
  food: string;
  gl: number;
  status?: 'ai_estimated';
}

export interface MealSuggestion {
  text: string;
  reason: string;
}

export interface GLCalculationResult {
  total_gl: number;
  items: GLCalculationItem[];
  suggestions?: MealSuggestion[];
}

export const api = {
  // Parse natural language meal description
  async parseMealChat(text: string): Promise<ParsedMealItem[]> {
    const response = await fetch(`${API_BASE}/parse-meal-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Failed to parse meal: ${response.statusText}`);
    }

    return response.json();
  },

  // Smart meal parsing with database disambiguation
  async parseMealSmart(text: string) {
    try {
      console.log('API: Sending parseMealSmart request:', text);
      const response = await fetch(`${API_BASE}/parse-meal-smart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      console.log('API: parseMealSmart response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API: parseMealSmart error response:', errorText);
        throw new Error(`Failed to parse meal: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('API: parseMealSmart result:', result);
      return result;
    } catch (error) {
      console.error('API: parseMealSmart caught error:', error);
      throw error;
    }
  },

  // Get portion information for a specific food
  async getPortionInfo(food: string): Promise<PortionInfo> {
    const response = await fetch(`${API_BASE}/portion-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ food }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get portion info: ${response.statusText}`);
    }

    return response.json();
  },

  // Calculate glycemic load for meal items
  async calculateGL(meal: ParsedMealItem[]): Promise<GLCalculationResult> {
    try {
      console.log('API: Sending calculateGL request:', meal);
      const response = await fetch(`${API_BASE}/calculate-gl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meal }),
      });

      console.log('API: calculateGL response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API: calculateGL error response:', errorText);
        throw new Error(`Failed to calculate GL: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('API: calculateGL result:', result);
      return result;
    } catch (error) {
      console.error('API: calculateGL caught error:', error);
      throw error;
    }
  },

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE}/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  },
};