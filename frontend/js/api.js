/* =========================================
   POWER SCHOOL - API
========================================= */

const API_BASE_URL =
    "http://localhost:8080/api";


async function apiRequest(
    endpoint,
    options = {}
) {

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,

            headers: {
                "Content-Type":
                    "application/json",

                ...(options.headers || {})
            }
        }
    );


    let data = null;


    try {

        data = await response.json();

    } catch {

        data = null;

    }


    if (!response.ok) {

        const error =
            new Error(
                data?.message ||
                `Request failed (${response.status})`
            );

        error.status =
            response.status;

        throw error;
    }


    return data;
}