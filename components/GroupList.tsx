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
import ReplaceItemModal from "./ReplaceItemModal";
import ReplacementSuggestions from "./ReplacementSuggestions";
import ReplacementTextModal from "./ReplacementTextModal";
import { isGroupManager, useGroup } from "../hooks/useGroup";
import useGroups, { type ListItem } from "../hooks/useGroups";
import { useTheme } from "../hooks/useTheme";
import { listItemName } from "../services/catalog";


// US 07 — the group the user selected on the Home page, as the "Group list" tab.
// The group's details come from hooks/useGroup (Home passed them as route params).
// US 15 — the group's items, reloaded each time the tab is shown and on pull-to-refresh.
// US 13 — the trash button removes the item on the server (DELETE /api/groups/:groupId/items/:itemId).
// US 16 — ✓ / X save the item's status on the server for the whole group; X asks for an optional
//         replacement suggestion. While the tab is open the list re-reads the server every 10 seconds,
//         so everyone sees each other's marks.
// US 22 — under each not-found item, admins get a horizontal row of catalog suggestions (and
//         "Edit manually"); applying one replaces the item. Replaced items sit at the end, crossed out.

const AUTO_REFRESH_MS = 10000;

function GroupList() {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	const { id, name, myRole, memberCount } = useGroup();
	const { getItems, removeListItem, setItemStatus } = useGroups();

	const [items, setItems] = useState<ListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState("");
	const [editing, setEditing] = useState<ListItem | null>(null);

	// US 16: the item whose "suggest a replacement" dialog is open
	const [markingNotFound, setMarkingNotFound] = useState<ListItem | null>(null);

	// US 22: the not-found item being replaced, and the suggestion picked (null = search first)
	const [replacing, setReplacing] = useState<{ item: ListItem; pickedItemId: string | null; query: string } | null>(null);

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

	// load when the tab is shown, then every 10 seconds until it is left (US 16 sync)
	useFocusEffect(
		useCallback(() => {
			load();
			const timer = setInterval(load, AUTO_REFRESH_MS);
			return () => clearInterval(timer);
		}, [load])
	);


	// US 16: save a status on the server; the card updates as soon as the server answers
	const saveStatus = async (item: ListItem, status: ListItem["status"], replacementText?: string) => {
		const result = await setItemStatus(id, item.id, status, replacementText);

		if (!result.success) {
			throw new Error(result.error);
		}

		setItems((current) => current.map((i) => (i.id === result.data.item.id ? result.data.item : i)));
	};

	// tapping the active button again undoes the mark; X opens the replacement suggestion first
	const handleStatusChange = (item: ListItem, chosen: ItemStatus) => {
		if (item.status === chosen) {
			saveStatus(item, "pending").catch((e) => Alert.alert("Could not update the item", e.message));
			return;
		}

		if (chosen === "notFound") {
			setMarkingNotFound(item);
			return;
		}

		saveStatus(item, chosen).catch((e) => Alert.alert("Could not update the item", e.message));
	};


	// US 13 AC-01: the admin removes the item from the list on the server, then from this screen
	const removeItem = async (item: ListItem) => {
		const result = await removeListItem(id, item.id);

		if (result.success) {
			setItems((current) => current.filter((i) => i.id !== item.id));
		}
		else {
			Alert.alert("Could not remove the item", result.error);
			load();
		}
	};

	const confirmRemove = (item: ListItem) => {
		Alert.alert("Remove item", `Remove ${listItemName(item)} from the list?`, [
			{ text: "Cancel", style: "cancel" },
			{ text: "Remove", style: "destructive", onPress: () => removeItem(item) },
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
							<View>
								<ItemCard
									item={item}
									canManage={canManage}
									onStatusChange={(status) => handleStatusChange(item, status)}
									onEdit={() => setEditing(item)}
									onRemove={() => confirmRemove(item)}
								/>
								{canManage && item.status === "notFound" && (
									<ReplacementSuggestions
										item={item}
										onPick={(catalogItemId) => setReplacing({ item, pickedItemId: catalogItemId, query: "" })}
										onEditManually={(query) => setReplacing({ item, pickedItemId: null, query })}
									/>
								)}
							</View>
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

				{replacing && (
					<ReplaceItemModal
						item={replacing.item}
						pickedItemId={replacing.pickedItemId}
						searchQuery={replacing.query}
						onClose={() => setReplacing(null)}
						onReplaced={() => { setReplacing(null); load(); }}
					/>
				)}

				{markingNotFound && (
					<ReplacementTextModal
						item={markingNotFound}
						onClose={() => setMarkingNotFound(null)}
						onSubmit={async (text) => {
							await saveStatus(markingNotFound, "notFound", text || undefined);
							setMarkingNotFound(null);
						}}
					/>
				)}

			</SafeAreaView>

		</LinearGradient>
	);

}


export default GroupList;
