// Backend base URL (no trailing slash).
// Android emulator reaches the computer running the backend at 10.0.2.2.
// On a real phone, set EXPO_PUBLIC_API_URL to your computer's IP, e.g. http://192.168.1.20:3000
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3000";
