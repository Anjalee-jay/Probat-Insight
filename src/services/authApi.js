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

async function parseApiResponse(response, fallbackMessage) {
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : { detail: await response.text() };

  if (!response.ok) {
    throw new Error(data.detail || fallbackMessage);
  }

  return data;
}

export async function loginRequest({ email, password }) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/auth/login`, {
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
  } catch {
    throw new Error("Unable to reach the login service. Check that the backend is running.");
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
