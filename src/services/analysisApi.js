function resolveApiBaseUrl() {
  const configuredBaseUrl = process.env.REACT_APP_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, "");
  }

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

// Get all analyses with pagination and filtering
export async function getAnalyses({
  page = 1,
  pageSize = 20,
  status,
  player,
  stroke,
  grade,
  sortBy = "created_at",
  sortOrder = "desc"
} = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
    sort_by: sortBy,
    sort_order: sortOrder
  });

  if (status) params.append("status", status);
  if (player) params.append("player", player);
  if (stroke) params.append("stroke", stroke);
  if (grade) params.append("grade", grade);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/analysis/?${params}`, {
      method: "GET",
    });
  } catch {
    throw new Error("Unable to reach analysis service. Check that backend is running.");
  }

  return parseApiResponse(response, "Failed to fetch analyses");
}

// Get a specific analysis by ID
export async function getAnalysis(analysisId) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/analysis/${analysisId}`, {
      method: "GET",
    });
  } catch {
    throw new Error("Unable to reach analysis service. Check that backend is running.");
  }

  return parseApiResponse(response, "Failed to fetch analysis");
}

// Create a new analysis record
export async function createAnalysis(analysisData) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/analysis/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(analysisData),
    });
  } catch {
    throw new Error("Unable to reach analysis service. Check that backend is running.");
  }

  return parseApiResponse(response, "Failed to create analysis");
}

// Update an existing analysis
export async function updateAnalysis(analysisId, updateData) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/analysis/${analysisId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });
  } catch {
    throw new Error("Unable to reach analysis service. Check that backend is running.");
  }

  return parseApiResponse(response, "Failed to update analysis");
}

// Delete an analysis
export async function deleteAnalysis(analysisId) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/analysis/${analysisId}`, {
      method: "DELETE",
    });
  } catch {
    throw new Error("Unable to reach analysis service. Check that backend is running.");
  }

  return parseApiResponse(response, "Failed to delete analysis");
}

// Get analysis statistics for admin dashboard
export async function getAnalysisStats() {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/analysis/stats/summary`, {
      method: "GET",
    });
  } catch {
    throw new Error("Unable to reach analysis service. Check that backend is running.");
  }

  return parseApiResponse(response, "Failed to fetch analysis stats");
}