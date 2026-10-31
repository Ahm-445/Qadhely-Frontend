import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";
import { getNotificationHref, registerForItemNotifications } from "../services/notifications";
import { useAuth } from "./useAuth";


// "Item removed" / "item modified" notifications. Used once, in the root layout.
// - while logged in: sends this device's push token to the backend (AC-01)
// - tapping a notification opens the group whose list changed (AC-02),
//   including when the tap is what launched the app

export default function useItemNotifications() {

	const { user, ready, isAuthenticated } = useAuth();
	const authToken = user?.token ?? user?.jwt;


	useEffect(() => {
		if (authToken) registerForItemNotifications(authToken);
	}, [authToken]);


	useEffect(() => {
		// wait for the saved session, otherwise a cold-start tap would land on Login
		if (!ready || !isAuthenticated) return;

		const open = (response: Notifications.NotificationResponse) => {
			const href = getNotificationHref(response);
			if (!href) return;

			router.push(href);
			Notifications.clearLastNotificationResponse();
		};

		// the tap that launched the app (app was closed)
		const last = Notifications.getLastNotificationResponse();
		if (last) open(last);

		// taps while the app is open or in the background
		const subscription = Notifications.addNotificationResponseReceivedListener(open);
		return () => subscription.remove();

	}, [ready, isAuthenticated]);
}
