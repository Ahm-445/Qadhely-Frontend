import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Tabs, useGlobalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GroupProvider, isGroupManager, type GroupDetails } from "../../../../hooks/useGroup";
import { useTheme } from "../../../../hooks/useTheme";


// US 07 — the group screen, one tab per job.
// US 30 AC-03: "Add items" and "AI suggestions" belong to the Group Creator and admins,
// so a regular member sees the "Group list" tab alone.
// Every tab carries the group in its URL, so switching tabs cannot drop it; expo-router adds
// a tab button for every route in this folder, so a manager-only route is kept reachable but
// taken off the bar with href: null.

function GroupTabsLayout() {

	const { colors } = useTheme();
	const insets = useSafeAreaInsets();

	// Home passes these when it opens the group; see hooks/useGroup.tsx
	const details = useGlobalSearchParams<GroupDetails>();

	const canManage = isGroupManager(details.myRole);


	return (
		<GroupProvider details={details}>

			<Tabs
				screenOptions={{
					tabBarActiveTintColor: colors.primary,
					tabBarInactiveTintColor: colors.textMuted,

					tabBarStyle: {
						backgroundColor: colors.surface,
						borderTopWidth: 1,
						borderTopColor: colors.border,
						height: 65 + insets.bottom,
						paddingBottom: insets.bottom + 20,
						paddingTop: 10
					},

					tabBarLabelStyle: {
						fontSize: 12,
						fontWeight: "600"
					},

					headerShown: false
				}}
			>

				<Tabs.Screen
					name="items"
					options={canManage ? {
						title: "Add items",
						href: { pathname: "/group/items", params: details },
						tabBarIcon: ({ color, size }) => <Ionicons name="add-outline" size={size} color={color} />
					} : { href: null }}
				/>

				<Tabs.Screen
					name="list"
					options={{
						title: "Group list",
						href: { pathname: "/group/list", params: details },
						tabBarIcon: ({ color, size }) => <Ionicons name="reader-outline" size={size} color={color} />
					}}
				/>

				<Tabs.Screen
					name="suggestions"
					options={canManage ? {
						title: "AI suggestions",
						href: { pathname: "/group/suggestions", params: details },
						tabBarIcon: ({ color, size }) => <Ionicons name="bulb-outline" size={size} color={color} />
					} : { href: null }}
				/>

			</Tabs>

		</GroupProvider>
	);

}


export default GroupTabsLayout;
