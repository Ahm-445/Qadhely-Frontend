import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { router, useRootNavigationState } from "expo-router";
import { useEffect, useRef } from "react";

import { notificationHref } from "../utils/notificationHref";


// US 18 AC-02 — opens the right group when the user taps a notification.
//
// useLastNotificationResponse covers all three cases with one code path: a tap while the app is
// open, a tap while it is in the background, and a tap that launched the app from a closed state.
// Renders nothing. It is not mounted on web, which has no push notifications.

// where useAuth keeps the signed-in session
const SESSION_KEY = "user";


// true when a signed-in session has been stored. The stored session is what AuthProvider loads on
// start; reading it here means a tap that launches the app waits for it instead of racing it.
async function hasStoredSession(): Promise<boolean> {

	try {
		const value = await AsyncStorage.getItem(SESSION_KEY);

		if (!value) return false;

		const session = JSON.parse(value);

		return typeof (session?.token ?? session?.jwt) === "string";
	}
	catch {
		return false;
	}
}


export default function NotificationObserver() {

	const response = Notifications.useLastNotificationResponse();

	// the navigator has to exist before anything can be opened
	const navigationReady = Boolean(useRootNavigationState()?.key);

	// the same response can be handed over more than once (it is both the "last" response and a
	// fresh one), so each notification is opened a single time
	const handled = useRef(new Set<string>());

	useEffect(() => {

		if (!response || !navigationReady) return;

		// only a plain tap; dismissing a notification or pressing an action does not open anything
		if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;

		const notificationId = response.notification.request.identifier;

		if (handled.current.has(notificationId)) return;
		handled.current.add(notificationId);

		void (async () => {

			try {
				const href = notificationHref(response.notification.request.content.data);

				// not an "items added" notification, or malformed: ignore it
				if (href === null) return;

				// signed out: the group could not be loaded, so stay where we are
				if (!(await hasStoredSession())) return;

				// Home first, so Back from the group goes Home, as when a group is opened from there
				router.replace("/Home");
				router.push(href);
			}
			catch {
				// a failed navigation must never crash the app
			}
			finally {
				// forget the response so it is not delivered again
				Notifications.clearLastNotificationResponse();
			}

		})();

	}, [response, navigationReady]);

	return null;
}
