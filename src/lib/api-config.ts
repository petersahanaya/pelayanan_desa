import { Capacitor } from "@capacitor/core";

function getApiBaseUrl(): string {
  if (typeof window === "undefined") return "";

  // In Capacitor (native app), use the backend server IP
  // Change this to your server IP for production
  if (Capacitor.isNativePlatform()) {
    // Try to get from localStorage, default to localhost
    const savedUrl = localStorage.getItem("api_base_url");
    return savedUrl || "http://10.0.2.2:3000"; // Android emulator default
  }

  // In browser (web), use relative paths
  return "";
}

export function getApiUrl(path: string): string {
  const base = getApiBaseUrl();
  return `${base}${path}`;
}

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(path);
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
}

export function setApiBaseUrl(url: string) {
  localStorage.setItem("api_base_url", url);
}

export function clearApiBaseUrl() {
  localStorage.removeItem("api_base_url");
}
