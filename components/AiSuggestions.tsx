import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AddItemForm from "./AddItemForm";
import BackButton from "./BackButton";
import CatalogItemCard from "./CatalogItemCard";
import { useGroup } from "../hooks/useGroup";
import useGroups, { type Suggestion } from "../hooks/useGroups";
import { useTheme } from "../hooks/useTheme";
import { rememberCatalogItems } from "../services/catalog";
import { UNITS, type Unit } from "../utils/quantity";


// US 07 / US 23 — the "AI suggestions" tab, shown to the Group Creator and admins only.
// The model scores the products this group buys and the tab lists the ones it expects on the next shop,
// most likely first, each with the reason it was picked. Tapping one opens the Add Item form with the amount
// the group usually takes already filled in.
//
// The list on the group's shopping list is filtered out here as well as on the server, because the list may
// have changed since the model answered.

const NOT_ENOUGH_HISTORY = "NOT_ENOUGH_HISTORY";


function AiSuggestions() {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	const { id, name } = useGroup();
	const { getSuggestions, getItems } = useGroups();

	const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
	const [needsHistory, setNeedsHistory] = useState(false);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState("");

	// the suggestion whose Add Item form is open
	const [picked, setPicked] = useState<Suggestion | null>(null);


	const load = useCallback(async () => {

		// both together: the suggestions, and the list they are checked against
		const [suggestionResult, listResult] = await Promise.all([getSuggestions(id), getItems(id)]);

		if (!suggestionResult.success) {
			setError(suggestionResult.error);
			setLoading(false);
			setRefreshing(false);
			return;
		}

		// a failed list read only costs the second check — the server already left out what was on the list
		const onList = new Set(listResult.success ? listResult.data.items.map((item) => item.catalogItemId) : []);
		const shown = suggestionResult.data.suggestions.filter((suggestion) => !onList.has(suggestion.catalogItemId));

		// the Add Item form reads its product from the catalog cache, which a search fills; a suggested
		// product was never searched for, so it is put there now
		rememberCatalogItems(shown.map((suggestion) => suggestion.catalogItem));

		setNeedsHistory(suggestionResult.data.code === NOT_ENOUGH_HISTORY);
		setSuggestions(shown);
		setError("");
		setLoading(false);
		setRefreshing(false);

	}, [id, getSuggestions, getItems]);

	// reloaded each time the tab is shown: an item added elsewhere leaves the suggestions
	useFocusEffect(
		useCallback(() => {
			load();
		}, [load])
	);


	// the backend and the app share the unit names, but a value from the server is checked before use
	const startUnit = (suggestion: Suggestion): Unit =>
		(UNITS as readonly string[]).includes(suggestion.suggestedUnit) ? suggestion.suggestedUnit : "piece";


	const emptyMessage = needsHistory
		? "Add some items to gain a shopping history so we can recommend you stuff."
		: "Look at you remembering all your items.";


	return (
		<LinearGradient colors={colors.gradients.background} style={groupsStyles.container}>

			<StatusBar barStyle={colors.statusBarStyle} />

			<View style={{ flex: 1, display: picked ? "none" : "flex" }}>

				<SafeAreaView edges={["top", "left", "right"]} style={groupsStyles.safeArea}>

					<BackButton />

					<View style={groupsStyles.groupDetails}>

						<Text style={groupsStyles.sectionTitle} numberOfLines={2}>
							AI suggestions{name ? ` · ${name}` : ""}
						</Text>

						{!loading && error === "" && suggestions.length > 0 && (
							<Text style={groupsStyles.sectionEmpty}>
								From what this group usually buys, most likely first.
							</Text>
						)}

					</View>

					{loading ? (
						<View style={groupsStyles.centerState}>
							<ActivityIndicator color={colors.primary} />
						</View>
					) : error !== "" ? (
						<View style={groupsStyles.centerState}>

							<Ionicons name="alert-circle-outline" size={36} color={colors.danger} />

							<Text style={[groupsStyles.sectionEmpty, { textAlign: "center" }]}>{error}</Text>

							<TouchableOpacity style={groupsStyles.retryButton} activeOpacity={0.8} onPress={() => { setLoading(true); load(); }}>
								<Text style={groupsStyles.retryButtonText}>Try again</Text>
							</TouchableOpacity>

						</View>
					) : suggestions.length === 0 ? (
						<View style={groupsStyles.centerState}>

							<Ionicons name="sparkles-outline" size={36} color={colors.textMuted} />

							<Text style={[groupsStyles.sectionEmpty, { textAlign: "center" }]}>
								The AI has nothing to suggest right now.
							</Text>

							<Text style={[groupsStyles.fieldHint, { textAlign: "center" }]}>{emptyMessage}</Text>

						</View>
					) : (
						<FlatList
							data={suggestions}
							keyExtractor={(suggestion) => suggestion.catalogItemId}
							renderItem={({ item }) => (
								<CatalogItemCard
									item={item.catalogItem}
									note={item.reason}
									onPress={() => setPicked(item)}
								/>
							)}
							ItemSeparatorComponent={() => <View style={groupsStyles.resultSeparator} />}
							contentContainerStyle={groupsStyles.listContent}
							refreshControl={
								<RefreshControl
									refreshing={refreshing}
									onRefresh={() => { setRefreshing(true); load(); }}
									tintColor={colors.primary}
								/>
							}
						/>
					)}

				</SafeAreaView>

			</View>

			{picked !== null && (
				<AddItemForm
					itemId={picked.catalogItemId}
					initialQuantity={String(picked.suggestedQuantity)}
					initialUnit={startUnit(picked)}
					onAdded={() => { setPicked(null); load(); }}
					onCancel={() => setPicked(null)}
				/>
			)}

		</LinearGradient>
	);

}


export default AiSuggestions;
