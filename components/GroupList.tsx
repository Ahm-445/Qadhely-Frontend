import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import EditItemModal from "./EditItemModal";
import { ROLE_LABELS } from "./GroupCard";
import GroupHeader from "./GroupHeader";
import ItemCard, { type ItemStatus } from "./ItemCard";
import { isGroupManager, useGroup } from "../hooks/useGroup";
import useGroups, { type ListItem } from "../hooks/useGroups";
import { useTheme } from "../hooks/useTheme";
import { listItemName } from "../services/catalog";


// US 07 — the group the user selected on the Home page, as the "Group list" tab.
// The group's details come from hooks/useGroup (Home passed them as route params).
// US 15 — the group's items, reloaded each time the tab is shown and on pull-to-refresh.

function GroupList() {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	const { id, name, myRole, memberCount } = useGroup();
	const { getItems } = useGroups();

	const [items, setItems] = useState<ListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState("");
	const [editing, setEditing] = useState<ListItem | null>(null);

	// shortcut: found / not found lives on this phone only, send it to the backend when US 16 adds a status
	const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({});

	const count = Number(memberCount) || 0;
	const members = `${count} ${count === 1 ? "member" : "members"}`;

	// US 30 AC-03: only the Group Creator and admins see the members icon
	// US 14: the same roles edit and remove items
	const canManage = isGroupManager(myRole);


	const load = useCallback(async () => {
		const result = await getItems(id);

		if (result.success) {
			setItems(result.data.items);
			setError("");
		}
		else {
			setError(result.error);
		}

		setLoading(false);
		setRefreshing(false);
	}, [id, getItems]);

	useFocusEffect(
		useCallback(() => {
			load();
		}, [load])
	);


	// shortcut: only removes the item from this screen, add the DELETE request when the backend has one
	const confirmRemove = (item: ListItem) => {
		Alert.alert("Remove item", `Remove ${listItemName(item)} from the list?`, [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Remove",
				style: "destructive",
				onPress: () => setItems((current) => current.filter((i) => i.id !== item.id)),
			},
		]);
	};


	return (
		<LinearGradient colors={colors.gradients.background} style={groupsStyles.container}>

			<StatusBar barStyle={colors.statusBarStyle} />

			<SafeAreaView edges={["top", "left", "right"]} style={groupsStyles.safeArea}>

				<GroupHeader
					name={name}
					subtitle={`${members}${ROLE_LABELS[myRole] ? ` · ${ROLE_LABELS[myRole]}` : ""}`}
					onMembersPress={canManage ? () => router.push({ pathname: "/GroupMembers", params: { id, name } }) : undefined}
				/>

				{loading ? (
					<View style={groupsStyles.centerState}>
						<ActivityIndicator color={colors.primary} />
					</View>
				) : error ? (
					<View style={groupsStyles.centerState}>
						<Ionicons name="alert-circle-outline" size={36} color={colors.danger} />
						<Text style={[groupsStyles.sectionEmpty, { textAlign: "center" }]}>{error}</Text>
						<TouchableOpacity style={groupsStyles.retryButton} activeOpacity={0.8} onPress={() => { setLoading(true); load(); }}>
							<Text style={groupsStyles.retryButtonText}>Try again</Text>
						</TouchableOpacity>
					</View>
				) : (
					<FlatList
						data={items}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => (
							<ItemCard
								item={item}
								status={statuses[item.id]}
								canManage={canManage}
								onStatusChange={(status) => setStatuses((current) => ({ ...current, [item.id]: status }))}
								onEdit={() => setEditing(item)}
								onRemove={() => confirmRemove(item)}
							/>
						)}
						contentContainerStyle={groupsStyles.listContent}
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={() => { setRefreshing(true); load(); }}
								tintColor={colors.primary}
							/>
						}
						ListEmptyComponent={<Text style={groupsStyles.sectionEmpty}>No items in this list yet.</Text>}
					/>
				)}

				{editing && (
					<EditItemModal
						item={editing}
						onClose={() => setEditing(null)}
						onSaved={(saved) => {
							setItems((current) => current.map((i) => (i.id === saved.id ? saved : i)));
							setEditing(null);
						}}
					/>
				)}

			</SafeAreaView>

		</LinearGradient>
	);

}


export default GroupList;
