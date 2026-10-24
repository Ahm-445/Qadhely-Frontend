import { API_BASE_URL } from "../config/api";


const REQUEST_TIMEOUT_MS = 15000;

/** Response of POST /api/auth/verify-otp (201). useAuth stores it as returned by the backend. */
export interface RegistrationSession {
	message: string;
	token: string;
	id: string;
	handleName: string;
	phoneNumber: string;
}

export class ApiError extends Error {
	status?: number;
	code?: string;
	attemptsRemaining?: number;
	retryAfterSeconds?: number;

	constructor(message: string, extra: Partial<Omit<ApiError, "name" | "message">> = {}) {
		super(message);
		this.name = "ApiError";
		Object.assign(this, extra);
	}
}


const waitText = (seconds: number) => {
	const minutes = Math.ceil(seconds / 60);
	return minutes > 1 ? `${minutes} minutes` : "a minute";
};


// Posts JSON and returns the parsed body of a successful (2xx) response.
// Every failure becomes an ApiError with a message that is safe to show to the user.
async function post(path: string, body: object): Promise<any> {

	if (!API_BASE_URL) {
		throw new ApiError("The server address is not configured. Set EXPO_PUBLIC_API_URL.");
	}

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	let response: Response;

	try {
		response = await fetch(`${API_BASE_URL}${path}`, {
			method: "POST",
			headers: { "Content-Type": "application/json", Accept: "application/json" },
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


/**
 * POST /api/auth/register: sends (or re-sends) the WhatsApp OTP.
 * Resolves only when the backend confirms the code was sent.
 */
export async function requestRegistrationOtp(handleName: string, phoneNumber: string): Promise<void> {

	const data = await post("/api/auth/register", { handleName, phoneNumber });

	if (data?.sent !== true) {
		throw new ApiError("Unexpected response from the server. Please try again.");
	}
}


/**
 * POST /api/auth/verify-otp: verifies the code and creates the account.
 * Resolves with the backend session; rejects with an ApiError otherwise.
 */
export async function verifyRegistrationOtp(phoneNumber: string, otp: string): Promise<RegistrationSession> {

	const data = await post("/api/auth/verify-otp", { phoneNumber, otp });

	if (!data || typeof data.token !== "string" || typeof data.id !== "string") {
		throw new ApiError("Unexpected response from the server. Please try again.");
	}

	return data as RegistrationSession;
}

