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

export async function uploadAnalysisImage({ file, handedness = "right" }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("handedness", handedness);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/analysis/upload`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error("Unable to reach analysis service. Check that backend is running.");
  }

  return parseApiResponse(response, "Upload failed");
}

export async function getImages() {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/images`, {
      method: "GET",
    });
  } catch {
    throw new Error("Unable to reach analysis service. Check that backend is running.");
  }

  return parseApiResponse(response, "Failed to fetch images");
}

export async function deleteImage(imageId) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/images/${imageId}`, {
      method: "DELETE",
    });
  } catch {
    throw new Error("Unable to reach analysis service. Check that backend is running.");
  }

  return parseApiResponse(response, "Failed to delete image");
}
