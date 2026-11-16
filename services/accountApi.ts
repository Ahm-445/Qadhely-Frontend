import { API_BASE_URL } from "../config/api";
import { ApiError } from "./registrationApi";


// US 04 — Delete Account
// POST /api/account/delete/send-otp  sends a WhatsApp code to the logged-in user (AC-01)
// POST /api/account/delete/verify    { otp, confirmed: true } deletes the account (AC-02, AC-03)

const REQUEST_TIMEOUT_MS = 15000;


const waitText = (seconds: number) => {
	const minutes = Math.ceil(seconds / 60);
	return minutes > 1 ? `${minutes} minutes` : "a minute";
};


// Posts JSON with the session token and returns the parsed body of a 2xx response.
// Every failure becomes an ApiError with a message that is safe to show to the user.
async function authPost(path: string, token: string, body: object = {}): Promise<any> {

	if (!API_BASE_URL) {
		throw new ApiError("The server address is not configured. Set EXPO_PUBLIC_API_URL.");
	}

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	let response: Response;

	try {
		response = await fetch(`${API_BASE_URL}${path}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(body),
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

		let message = serverMessage ?? "Something went wrong. Please try again.";

		if (response.status === 429 && typeof data?.retryAfterSeconds === "number") {
			message = `${message} Try again in ${waitText(data.retryAfterSeconds)}.`;
		}
		else if (response.status >= 500 && !serverMessage) {
			message = "The server had a problem. Please try again.";
		}

		throw new ApiError(message, {
			status: response.status,
			code: typeof data?.code === "string" ? data.code : undefined,
			attemptsRemaining: typeof data?.attemptsRemaining === "number" ? data.attemptsRemaining : undefined,
			retryAfterSeconds: typeof data?.retryAfterSeconds === "number" ? data.retryAfterSeconds : undefined,
		});
	}

	return data;
}


/** AC-01: sends (or re-sends) the WhatsApp code. Resolves only when the backend confirms it was sent. */
export async function requestDeleteAccountOtp(token: string): Promise<void> {

	const data = await authPost("/api/account/delete/send-otp", token);

	if (data?.sent !== true) {
		throw new ApiError("Unexpected response from the server. Please try again.");
	}
}


/** AC-02 / AC-03: checks the code and deletes the account. Rejects with an ApiError on a wrong code. */
export async function confirmDeleteAccount(token: string, otp: string): Promise<void> {

	const data = await authPost("/api/account/delete/verify", token, { otp, confirmed: true });

	if (data?.deleted !== true) {
		throw new ApiError("Unexpected response from the server. Please try again.");
	}
}
