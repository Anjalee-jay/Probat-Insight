function resolveApiBaseUrl() {
  const configuredBaseUrl = process.env.REACT_APP_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, "");
  }

  // Always fall back to 127.0.0.1 — on Windows, 'localhost' resolves to ::1 (IPv6)
  // first but the backend only binds to 127.0.0.1 (IPv4).
  return "http://127.0.0.1:8000";
}

const API_BASE_URL = resolveApiBaseUrl();

function normalizeApiError(data, fallbackMessage) {
  const detail = data?.detail;

  if (Array.isArray(detail)) {
    const fieldErrors = {};

    for (const entry of detail) {
      const field = Array.isArray(entry?.loc) ? entry.loc[entry.loc.length - 1] : null;
      if (typeof field === "string" && !fieldErrors[field]) {
        fieldErrors[field] = entry?.msg || fallbackMessage;
      }
    }

    return {
      message: Object.keys(fieldErrors).length > 0 ? "Please fix the highlighted fields." : fallbackMessage,
      fieldErrors,
    };
  }

  if (typeof detail === "string" && detail.trim()) {
    return {
      message: detail,
      fieldErrors: {},
    };
  }

  return {
    message: fallbackMessage,
    fieldErrors: {},
  };
}

function buildAuthHeaders() {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function parseApiResponse(response, fallbackMessage) {
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : { detail: await response.text() };

  if (!response.ok) {
    const normalizedError = normalizeApiError(data, fallbackMessage);
    const error = new Error(normalizedError.message);
    error.fieldErrors = normalizedError.fieldErrors;
    throw error;
  }

  return data;
}

export async function loginRequest({ email, password }) {
  let response;
  const loginUrl = `${API_BASE_URL}/api/auth/login`;
  
  console.log("🔐 Login attempt - URL:", loginUrl);
  console.log("📧 Email:", email);

  try {
    response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });
    console.log("✅ Response received:", response.status);
  } catch (error) {
    console.error("❌ Network error:", error);
    console.error("API Base URL being used:", API_BASE_URL);
    throw new Error(`Unable to reach the login service at ${API_BASE_URL}. Check that the backend is running. Error: ${error.message}`);
  }

  return parseApiResponse(response, "Login failed");
}

export async function registerRequest(payload) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Unable to reach the signup service. Check that the backend is running.");
  }

  return parseApiResponse(response, "Signup failed");
}

export async function forgotPasswordRequest(email) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email }),
    });
  } catch {
    throw new Error("Unable to reach the service. Check that the backend is running.");
  }

  return parseApiResponse(response, "Failed to send reset email");
}

export async function updateProfileRequest(payload) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: "PUT",
      headers: buildAuthHeaders(),
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Unable to reach the profile service. Check that the backend is running.");
  }

  return parseApiResponse(response, "Failed to save profile changes");
}
