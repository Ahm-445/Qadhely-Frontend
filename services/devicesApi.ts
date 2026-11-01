import { API_BASE_URL } from "../config/api";
import { ApiError } from "./registrationApi";


const REQUEST_TIMEOUT_MS = 15000;


// Sends an authenticated request to the devices API and returns the parsed body of a
// successful (2xx) response. Every failure becomes an ApiError whose message is safe
// to show to the user.
async function send(method: "POST" | "DELETE", path: string, jwt: string, body?: object): Promise<any> {

	if (!API_BASE_URL) {
		throw new ApiError("The server address is not configured. Set EXPO_PUBLIC_API_URL.");
	}

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	let response: Response;

	try {
		response = await fetch(`${API_BASE_URL}${path}`, {
			method,
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${jwt}`,
				...(body === undefined ? {} : { "Content-Type": "application/json" }),
			},
			body: body === undefined ? undefined : JSON.stringify(body),
			signal: controller.signal,
		});
	}
	catch {
		throw new ApiError("Cannot reach the server. Check your connection and try again.");
	}
	finally {
		clearTimeout(timer);
	}

	const data = await response.json().catch(() => null);

	if (!response.ok) {
		const serverMessage = typeof data?.error === "string" ? data.error : null;

		throw new ApiError(serverMessage ?? "Something went wrong. Please try again.", {
			status: response.status,
		});
	}

	return data;
}


/**
 * POST /api/devices: links this phone's push token to the logged-in user.
 * The token travels in the body rather than the path, because Expo tokens contain
 * characters ("ExponentPushToken[xxxxxxxx]") that are awkward in a URL.
 */
export async function addDeviceToken(jwt: string, pushToken: string): Promise<void> {
	await send("POST", "/api/devices", jwt, { pushToken });
}


/** DELETE /api/devices/:pushToken: unlinks this phone's push token from the user. */
export async function removeDeviceToken(jwt: string, pushToken: string): Promise<void> {
	await send("DELETE", `/api/devices/${encodeURIComponent(pushToken)}`, jwt);
}
