import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import type { Href } from "expo-router";
import { Platform } from "react-native";
import { API_BASE_URL } from "../config/api";


// US — item removed / item modified notifications (frontend).
//
// Backend contract:
//   POST   /api/devices              { pushToken }   link this device's Expo push token (auth required)
//   DELETE /api/devices/:pushToken                   unlink it on logout (auth required)
//
// When an item is removed, or its quantity/unit changes, the backend sends an Expo push
// notification to the other group members whose body names the exact item (AC-01), with:
//   data: { type: "item_removed" | "item_modified", groupId, groupName, itemName }
// Tapping it opens that group's shopping list (AC-02), see getNotificationHref().


export type ItemNotificationData = {
	type: "item_removed" | "item_modified"
	groupId: string
	groupName?: string
	itemName?: string
}


const ANDROID_CHANNEL_ID = "list-updates";
const PUSH_TOKEN_KEY = "pushToken";


// Show item notifications as a banner even while the app is open ("immediate" in the stories)
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowBanner: true,
		shouldShowList: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
});


// Asks for permission and returns this device's Expo push token, or null when push
// isn't available (simulator, web, permission denied, no EAS projectId).
export async function getExpoPushToken(): Promise<string | null> {

	if (Platform.OS === "web" || !Device.isDevice) return null;

	// Android 13+: a channel must exist before asking, so the permission prompt can appear
	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
			name: "Shopping list updates",
			importance: Notifications.AndroidImportance.HIGH,
		});
	}

	let { status } = await Notifications.getPermissionsAsync();

	if (status !== "granted") {
		({ status } = await Notifications.requestPermissionsAsync());
	}

	if (status !== "granted") return null;

	const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

	if (!projectId) {
		console.warn("Push notifications: no EAS projectId in app.json (run `eas init`).");
		return null;
	}

	try {
		const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
		return data;
	}
	catch (error) {
		// needs Expo's servers, so it can fail offline; we try again on the next app start
		console.error("Push notifications:", error instanceof Error ? error.message : String(error));
		return null;
	}
}


async function sendPushToken(method: "POST" | "DELETE", authToken: string, pushToken: string): Promise<boolean> {
	try {
		const response = method === "POST"
			? await fetch(`${API_BASE_URL}/api/devices`, {
				method,
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
				body: JSON.stringify({ pushToken }),
			})
			// "ExponentPushToken[...]" has brackets, so it is URL-encoded as a path segment
			: await fetch(`${API_BASE_URL}/api/devices/${encodeURIComponent(pushToken)}`, {
				method,
				headers: { Authorization: `Bearer ${authToken}` },
			});

		if (!response.ok) throw new Error(`HTTP ${response.status}`);

		return true;
	}
	catch (error) {
		console.error(`Push token ${method} failed:`, error instanceof Error ? error.message : String(error));
		return false;
	}
}


// Sends this device's push token to the backend so the user receives group notifications.
// Called on every app start while logged in (the token can change).
export async function registerForItemNotifications(authToken: string) {
	const pushToken = await getExpoPushToken();
	if (!pushToken) return;

	if (await sendPushToken("POST", authToken, pushToken)) {
		await AsyncStorage.setItem(PUSH_TOKEN_KEY, pushToken);
	}
}

// On logout: stop sending this user's notifications to this device
export async function unregisterFromItemNotifications(authToken: string) {
	const pushToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
	if (!pushToken) return;

	await sendPushToken("DELETE", authToken, pushToken);
	await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
}


// AC-02: where tapping a notification should go — the group whose list changed
export function getNotificationHref(response: Notifications.NotificationResponse): Href | null {

	const data = response.notification.request.content.data as Partial<ItemNotificationData> | undefined;

	if (data?.type !== "item_removed" && data?.type !== "item_modified") return null;
	if (typeof data.groupId !== "string" || !data.groupId) return null;

	return {
		pathname: "/Group",
		params: { id: data.groupId, ...(data.groupName ? { name: data.groupName } : {}) },
	};
}
