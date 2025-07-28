const API_BASE = ''; // Use relative URLs since frontend and backend are served from same domain
// Export individual functions
export async function parseMealChat(text) {
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
}
export async function parseMealSmart(text) {
    const response = await fetch(`${API_BASE}/parse-meal-smart`, {
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
}
export async function getPortionInfo(food) {
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
}
export async function calculateGL(meal) {
    const response = await fetch(`${API_BASE}/calculate-gl`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meal }),
    });
    if (!response.ok) {
        throw new Error(`Failed to calculate GL: ${response.statusText}`);
    }
    return response.json();
}
export async function healthCheck() {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
}
//# sourceMappingURL=api.js.map