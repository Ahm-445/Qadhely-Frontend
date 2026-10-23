// Backend base URL, set per developer in .env (see .env.example). No trailing slash.
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
