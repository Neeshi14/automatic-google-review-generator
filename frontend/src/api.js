const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 15000;

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Check that the backend and database are running.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = formatErrorDetail(body.detail);
    throw new Error(detail);
  }
  return body;
}

function formatErrorDetail(detail) {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") return item;
        const location = Array.isArray(item.loc) ? item.loc.filter((part) => part !== "body").join(".") : "";
        return location ? `${location}: ${item.msg}` : item.msg;
      })
      .filter(Boolean)
      .join(" ");
  }
  return "Something went wrong. Please try again.";
}

export const api = {
  createBusiness: (payload) =>
    request("/api/businesses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getBusiness: (slug) => request(`/api/businesses/${encodeURIComponent(slug)}`),
  createSession: (businessId) =>
    request("/api/review-sessions", {
      method: "POST",
      body: JSON.stringify({ business_id: businessId }),
    }),
  generateReviews: (sessionToken, payload) =>
    request(`/api/review-sessions/${encodeURIComponent(sessionToken)}/generate-reviews`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  saveSelectedReview: (sessionToken, selectedReview) =>
    request(`/api/review-sessions/${encodeURIComponent(sessionToken)}/selected-review`, {
      method: "PATCH",
      body: JSON.stringify({ selected_review: selectedReview }),
    }),
  getDashboard: (businessId) => request(`/api/dashboard/${encodeURIComponent(businessId)}`),
};
