function resolveApiBaseUrl() {
  const configuredBaseUrl = process.env.REACT_APP_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, "");
  }

  if (typeof window === "undefined") {
    return "http://localhost:8000";
  }

  const { protocol, hostname } = window.location;
  const apiProtocol = protocol === "https:" ? "https:" : "http:";
  const apiHost = hostname || "localhost";

  return `${apiProtocol}//${apiHost}:8000`;
}

const API_BASE_URL = resolveApiBaseUrl();

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

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : { detail: await response.text() };

  if (!response.ok) {
    throw new Error(data.detail || "Login failed");
  }

  return data;
}
