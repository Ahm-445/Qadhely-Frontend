import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	StatusBar,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useGroup } from "../hooks/useGroup";
import { useTheme } from "../hooks/useTheme";
import { CATALOG_PAGE_SIZE, catalogItemSize, catalogItemTitle, searchCatalog, type CatalogItem } from "../services/catalog";
import BackButton from "./BackButton";


// US 12 — the "Add items" tab, shown to the Group Creator and admins only.
// A search bar finds catalog products by English name or brand; tapping a result hands the
// product's catalog id to onPickItem, which opens the Add Item screen for it.
//
// Nothing is listed until the user types. Each keystroke restarts a short wait (DEBOUNCE_MS), and
// only the newest search may put results on the screen: an older response that arrives late is
// dropped.

const DEBOUNCE_MS = 300;
const QUERY_MAX_LENGTH = 100; // the backend rejects a longer search

interface AddItemSearchProps {
	/** The user picked a product from the results. */
	onPickItem: (itemId: string) => void
}


function AddItemSearch({ onPickItem }: AddItemSearchProps) {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	const { name } = useGroup();

	const [query, setQuery] = useState("");
	const [searchFocused, setSearchFocused] = useState(false);

	const [items, setItems] = useState<CatalogItem[]>([]);
	const [hasMore, setHasMore] = useState(false);
	const [searching, setSearching] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [moreError, setMoreError] = useState(false);

	const trimmedQuery = query.trim();

	// Bumped by every new search and by clearing the box. A response only counts if it still
	// carries the latest number.
	const latestSearch = useRef(0);
	const activeQuery = useRef("");
	const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const searchRequest = useRef<AbortController | null>(null);
	const moreRequest = useRef<AbortController | null>(null);


	const cancelPending = useCallback(() => {
		latestSearch.current += 1;

		if (debounceTimer.current) clearTimeout(debounceTimer.current);
		debounceTimer.current = null;

		searchRequest.current?.abort();
		moreRequest.current?.abort();
		searchRequest.current = null;
		moreRequest.current = null;
	}, []);

	// no timer or request outlives the screen
	useEffect(() => cancelPending, [cancelPending]);


	const runSearch = async (text: string) => {

		cancelPending();

		const searchId = latestSearch.current;
		const controller = new AbortController();

		searchRequest.current = controller;
		activeQuery.current = text;

		setSearching(true);
		setError(null);
		setMoreError(false);
		setLoadingMore(false);

		try {
			const page = await searchCatalog(text, { signal: controller.signal });

			if (searchId !== latestSearch.current) return;

			setItems(page.items);
			setHasMore(page.hasMore);
		}
		catch (e) {
			if (searchId !== latestSearch.current) return;

			setItems([]);
			setHasMore(false);
			setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
		}

		setSearching(false);
	};


	const loadMore = async () => {

		if (searching || loadingMore || !hasMore || trimmedQuery === "") return;

		const searchId = latestSearch.current;
		const controller = new AbortController();

		moreRequest.current = controller;

		setLoadingMore(true);
		setMoreError(false);

		try {
			const page = await searchCatalog(activeQuery.current, { offset: items.length, signal: controller.signal });

			if (searchId !== latestSearch.current) return;

			// never show the same product twice
			setItems((current) => {
				const known = new Set(current.map((item) => item.id));

				return [...current, ...page.items.filter((item) => !known.has(item.id))];
			});
			setHasMore(page.hasMore);
		}
		catch {
			if (searchId !== latestSearch.current) return;

			setMoreError(true);
		}

		setLoadingMore(false);
	};


	const handleChangeText = (text: string) => {

		setQuery(text);

		const next = text.trim();

		// a space at either end does not change the search
		if (next !== "" && next === activeQuery.current) return;

		cancelPending();
		activeQuery.current = next;

		if (next === "") {
			// cleared: no results, nothing loading
			setItems([]);
			setHasMore(false);
			setSearching(false);
			setLoadingMore(false);
			setError(null);
			setMoreError(false);
			return;
		}

		setSearching(true);
		setError(null);

		const searchId = latestSearch.current;

		debounceTimer.current = setTimeout(() => {
			if (searchId === latestSearch.current) runSearch(next);
		}, DEBOUNCE_MS);
	};


	// the keyboard's search key skips the wait
	const handleSubmit = () => {
		if (trimmedQuery !== "") runSearch(trimmedQuery);
	};


	const showHint = trimmedQuery === "";
	const showNoResults = !showHint && !searching && error === null && items.length === 0;


	const renderItem = ({ item }: { item: CatalogItem }) => {

		const size = catalogItemSize(item);

		return (
			<TouchableOpacity
				activeOpacity={0.8}
				onPress={() => onPickItem(item.id)}
				accessibilityRole="button"
				accessibilityLabel={`${catalogItemTitle(item)}${item.store ? `, ${item.store}` : ""}`}
			>

				<LinearGradient colors={colors.gradients.surface} style={groupsStyles.itemCard}>

					<View style={[groupsStyles.itemImageWrap, groupsStyles.resultImageWrap, { backgroundColor: colors.backgrounds.editInput }]}>
						{item.image ? (
							<Image
								source={{ uri: item.image }}
								style={groupsStyles.itemImage}
								contentFit="cover"
								transition={200}
							/>
						) : (
							<Ionicons name="image-outline" size={26} color={colors.textMuted} />
						)}
					</View>

					<View style={groupsStyles.itemTextContainer}>

						{item.brand_en ? <Text style={groupsStyles.itemBrand} numberOfLines={1}>{item.brand_en}</Text> : null}

						<Text style={groupsStyles.itemName} numberOfLines={2}>{item.name_en}</Text>

						{size !== "" ? <Text style={groupsStyles.itemSize}>{size}</Text> : null}

						{item.store ? (
							<View style={groupsStyles.itemStore}>
								<Ionicons name="storefront-outline" size={14} color={colors.textMuted} />
								<Text style={groupsStyles.itemStoreText} numberOfLines={1}>{item.store}</Text>
							</View>
						) : null}

					</View>

					<Ionicons name="chevron-forward" size={20} color={colors.textMuted} />

				</LinearGradient>

			</TouchableOpacity>
		);
	};


	return (
		<LinearGradient colors={colors.gradients.background} style={groupsStyles.container}>

			<StatusBar barStyle={colors.statusBarStyle} />

			<SafeAreaView edges={["top", "left", "right"]} style={groupsStyles.safeArea}>

				<BackButton />

				<View style={groupsStyles.searchSection}>

					<Text style={groupsStyles.sectionTitle} numberOfLines={2}>
						Add items{name ? ` · ${name}` : ""}
					</Text>

					<View style={[groupsStyles.searchBar, searchFocused && groupsStyles.searchBarFocused]}>

						<Ionicons name="search-outline" size={20} color={colors.textMuted} />

						<TextInput
							style={groupsStyles.searchInput}
							value={query}
							onChangeText={handleChangeText}
							onSubmitEditing={handleSubmit}
							onFocus={() => setSearchFocused(true)}
							onBlur={() => setSearchFocused(false)}
							placeholder="Search for an item..."
							placeholderTextColor={colors.textMuted}
							maxLength={QUERY_MAX_LENGTH}
							autoCapitalize="none"
							autoCorrect={false}
							returnKeyType="search"
							accessibilityLabel="Search for an item"
						/>

						{query !== "" && (
							<TouchableOpacity
								onPress={() => handleChangeText("")}
								hitSlop={10}
								accessibilityRole="button"
								accessibilityLabel="Clear search"
							>
								<Ionicons name="close-circle" size={20} color={colors.textMuted} />
							</TouchableOpacity>
						)}

					</View>

				</View>

				{showHint && (
					<Text style={[groupsStyles.sectionEmpty, groupsStyles.searchMessage]}>
						Type a name or brand to find items to add to the list.
					</Text>
				)}

				{!showHint && searching && (
					<View style={groupsStyles.centerState}>
						<ActivityIndicator color={colors.primary} />
					</View>
				)}

				{!showHint && !searching && error !== null && (
					<View style={groupsStyles.centerState}>

						<Text style={groupsStyles.fieldError}>{error}</Text>

						<TouchableOpacity style={groupsStyles.retryButton} activeOpacity={0.8} onPress={() => runSearch(trimmedQuery)}>
							<Text style={groupsStyles.retryButtonText}>Try again</Text>
						</TouchableOpacity>

					</View>
				)}

				{showNoResults && (
					<View style={groupsStyles.centerState}>
						<Text style={groupsStyles.sectionEmpty}>{`No items found for "${trimmedQuery}".`}</Text>
						<Text style={groupsStyles.fieldHint}>Try a different name or brand.</Text>
					</View>
				)}

				{!showHint && !searching && error === null && items.length > 0 && (
					<FlatList
						style={groupsStyles.resultsList}
						contentContainerStyle={groupsStyles.resultsContent}
						data={items}
						keyExtractor={(item) => item.id}
						renderItem={renderItem}
						ItemSeparatorComponent={() => <View style={groupsStyles.resultSeparator} />}
						keyboardShouldPersistTaps="handled"
						keyboardDismissMode="on-drag"
						onEndReached={loadMore}
						onEndReachedThreshold={0.4}
						initialNumToRender={CATALOG_PAGE_SIZE}
						ListFooterComponent={
							loadingMore ? (
								<ActivityIndicator style={groupsStyles.resultsFooter} color={colors.primary} />
							) : moreError ? (
								<TouchableOpacity style={groupsStyles.resultsFooter} onPress={loadMore}>
									<Text style={groupsStyles.fieldError}>Could not load more items. Tap to try again.</Text>
								</TouchableOpacity>
							) : undefined
						}
					/>
				)}

			</SafeAreaView>

		</LinearGradient>
	);

}


export default AddItemSearch;
