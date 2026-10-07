const API_BASE_URL = "https://powerschool-backend.onrender.com/api";

async function apiRequest(endpoint, options = {}) {
    const token = sessionStorage.getItem("ps_token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const error = new Error(
            data?.message || `Request failed (${response.status})`
        );

        error.status = response.status;

        throw error;
    }

    return data;
}