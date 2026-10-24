import Constants from "expo-constants";
import { Platform } from "react-native";

// Port the Node/Express backend listens on.
const API_PORT = 3000;

// Backend base URL (no trailing slash). Picked in this order:
// 1. EXPO_PUBLIC_API_URL in .env, if set (forces one address for every device).
// 2. The computer the app was loaded from. In development, Expo tells the app
//    which IP it used to reach the dev server (e.g. "192.168.56.1:8081"). The
//    backend runs on that same computer, so the same IP works on both the
//    emulator and a real phone. Only the port changes.
// 3. Fallback: 10.0.2.2 on the Android emulator, localhost elsewhere.
function getApiBaseUrl(): string {
	const fromEnv = process.env.EXPO_PUBLIC_API_URL;
	if (fromEnv) return fromEnv.replace(/\/+$/, "");

	// hostUri looks like "192.168.56.1:8081"; keep only the host part
	const host = Constants.expoConfig?.hostUri?.split(":")[0];

	// Tunnel hosts (npx expo start --tunnel) don't point at this computer
	const isTunnel = host?.endsWith(".exp.direct") || host?.includes("ngrok");

	if (host && !isTunnel) return `http://${host}:${API_PORT}`;

	return Platform.OS === "android"
		? `http://10.0.2.2:${API_PORT}`
		: `http://localhost:${API_PORT}`;
}

export const API_BASE_URL = getApiBaseUrl();

if (__DEV__) console.log("API_BASE_URL:", API_BASE_URL);
