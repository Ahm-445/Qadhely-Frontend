import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import { Platform } from "react-native";
import { addDeviceToken, removeDeviceToken } from "./devicesApi";


// must match "defaultChannel" in the expo-notifications plugin in app.json
const ANDROID_CHANNEL_ID = "default";

// the push token this app linked for the current session, so logging out can unlink it
// without asking the push service again. Stored as well as cached, because the app can be
// restarted between logging in and logging out.
const STORAGE_KEY = "pushToken";


let cachedToken: string | null = null;


// notifications that arrive while the app is open are shown by the app itself
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldPlaySound: true,
		shouldSetBadge: false,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
});


// push problems are never shown to the user: they only mean "no notifications"
function devLog(message: string) {
	if (__DEV__) console.warn(`Push notifications: ${message}`);
}


/**
 * Returns this phone's Expo push token, or null when push is unavailable.
 * Never throws: a missing permission, an emulator, Expo Go or a missing EAS projectId
 * must not be able to break logging in.
 *
 * Remote push needs a development build on Android (Expo Go stopped supporting it in
 * SDK 53) and an EAS projectId in app.json.
 */
export async function getPushToken(): Promise<string | null> {

	// the web build has no push token
	if (Platform.OS === "web") return null;

	try {

		// simulators and emulators without Google Play services cannot receive push
		if (!Device.isDevice) {
			devLog("this is not a physical device, skipping device registration.");
			return null;
		}

		if (Platform.OS === "android") {
			// the channel has to exist before the permission prompt is shown
			await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
				name: "General",
				importance: AndroidImportance.DEFAULT,
			});
		}

		const { status: existingStatus } = await Notifications.getPermissionsAsync();

		const status = existingStatus === "granted"
			? existingStatus
			: (await Notifications.requestPermissionsAsync()).status;

		if (status !== "granted") {
			devLog("notification permission was not granted, skipping device registration.");
			return null;
		}

		const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

		if (!projectId) {
			devLog("no EAS projectId in app.json, skipping device registration (run `eas init`).");
			return null;
		}

		return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
	}
	catch (error) {
		devLog(`could not get a push token: ${String(error)}`);
		return null;
	}
}


/**
 * Best effort: links this phone's push token to the logged-in user.
 * Never throws — the user is already signed in, and a phone without a token
 * simply does not receive notifications.
 */
export async function registerPushToken(jwt: string): Promise<void> {

	const pushToken = await getPushToken();

	if (!pushToken) return;

	try {
		await addDeviceToken(jwt, pushToken);
		await cacheToken(pushToken);
	}
	catch (error) {
		devLog(`could not link this device: ${String(error)}`);
	}
}


/**
 * Best effort: unlinks this phone's push token from the user who is logging out,
 * so no notification is sent to the phone afterwards. Needs the JWT, so it runs
 * before the session is cleared. Never throws: logging out offline still works.
 */
export async function unregisterPushToken(jwt: string): Promise<void> {

	const pushToken = await registeredToken();

	if (!pushToken) return;

	try {
		await removeDeviceToken(jwt, pushToken);
		// only forget the token once the backend has really unlinked it, so that a
		// failed attempt (offline, expired session) can be retried on the next logout
		await clearCachedToken();
	}
	catch (error) {
		devLog(`could not unlink this device: ${String(error)}`);
	}
}


async function registeredToken(): Promise<string | null> {

	if (cachedToken) return cachedToken;

	try {
		cachedToken = await AsyncStorage.getItem(STORAGE_KEY);
	}
	catch {
		cachedToken = null;
	}

	return cachedToken;
}


async function cacheToken(pushToken: string) {

	cachedToken = pushToken;

	try {
		await AsyncStorage.setItem(STORAGE_KEY, pushToken);
	}
	catch {
		// the in-memory copy is enough for this session
	}
}


async function clearCachedToken() {

	cachedToken = null;

	try {
		await AsyncStorage.removeItem(STORAGE_KEY);
	}
	catch {
		// nothing else to do: the token is unlinked on the backend either way
	}
}
