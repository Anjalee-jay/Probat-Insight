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

function buildHeaders() {
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

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : { detail: await response.text() };

  if (!response.ok) {
    throw new Error(data.detail || "Users request failed");
  }

  return data;
}

export async function fetchUsers() {
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    headers: buildHeaders(),
  });
  const data = await parseResponse(response);
  return data.users || [];
}

export async function createUser(payload) {
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function updateUser(userId, payload) {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: "PUT",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function removeUser(userId) {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });
  return parseResponse(response);
}

export async function clearUsers() {
  const response = await fetch(`${API_BASE_URL}/api/users/reset`, {
    method: "DELETE",
    headers: buildHeaders(),
  });
  return parseResponse(response);
}
