function getDefaultApiBaseUrl() {
  if (typeof window === "undefined") {
    return "http://localhost:4000";
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:4000`;
}

export function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configured) {
    return configured;
  }

  return getDefaultApiBaseUrl();
}
