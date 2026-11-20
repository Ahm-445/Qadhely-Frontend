import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";

import type { ListItem } from "../hooks/useGroups";
import { useTheme } from "../hooks/useTheme";
import { catalogItemSize, listItemName, searchCatalog, type CatalogItem } from "../services/catalog";


// US 22 — shown to the Group Creator and admins under an item a member marked as not found.
// The catalog is searched automatically for the member's suggested replacement, or for the
// item's own name when there is none, and the matches are shown in one horizontal row.
// Tapping a match opens the add-item screen to replace the item; "Edit manually" at the end of the
// row opens the full search with the same text in the search bar.

const SUGGESTION_LIMIT = 10;

type ReplacementSuggestionsProps = {
	item: ListItem
	onPick: (catalogItemId: string) => void
	onEditManually: (query: string) => void
}


/** The words the suggestions and "Edit manually" search for. */
export function replacementQuery(item: ListItem): string {
	return (item.replacementText ?? "").trim() || listItemName(item);
}


function ReplacementSuggestions({ item, onPick, onEditManually }: ReplacementSuggestionsProps) {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	const query = replacementQuery(item);

	const [matches, setMatches] = useState<CatalogItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [failed, setFailed] = useState(false);


	// search again only when the words change (the list refreshes every few seconds)
	useEffect(() => {
		const controller = new AbortController();

		searchCatalog(query, { limit: SUGGESTION_LIMIT + 1, signal: controller.signal })
			.then((page) => {
				// the item that was not found is not a useful suggestion
				setMatches(page.items.filter((m) => m.id !== item.catalogItemId).slice(0, SUGGESTION_LIMIT));
				setFailed(false);
			})
			.catch(() => {
				if (!controller.signal.aborted) setFailed(true);
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoading(false);
			});

		return () => controller.abort();
	}, [query, item.catalogItemId]);


	const editManually = (
		<TouchableOpacity
			style={[groupsStyles.suggestionCard, groupsStyles.suggestionManualCard]}
			activeOpacity={0.8}
			onPress={() => onEditManually(query)}
			accessibilityRole="button"
			accessibilityLabel="Edit manually"
		>
			<Ionicons name="search-outline" size={24} color={colors.primary} />
			<Text style={groupsStyles.suggestionManualText}>Edit manually</Text>
		</TouchableOpacity>
	);


	return (
		<View style={groupsStyles.suggestionsSection}>

			<Text style={groupsStyles.suggestionsTitle} numberOfLines={1}>
				{item.replacementText ? `Replacements for "${query}"` : "Suggested replacements"}
			</Text>

			{loading ? (
				<ActivityIndicator style={{ alignSelf: "flex-start", marginVertical: 12 }} color={colors.primary} />
			) : (
				<FlatList
					horizontal
					data={matches}
					keyExtractor={(m) => m.id}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={groupsStyles.suggestionsRow}
					renderItem={({ item: match }) => (
						<TouchableOpacity
							style={groupsStyles.suggestionCard}
							activeOpacity={0.8}
							onPress={() => onPick(match.id)}
							accessibilityRole="button"
							accessibilityLabel={`Replace with ${match.name_en}`}
						>
							<View style={groupsStyles.suggestionImage}>
								{!!match.image && <Image source={match.image} style={groupsStyles.listItemImageFill} contentFit="contain" />}
							</View>
							<Text style={groupsStyles.suggestionName} numberOfLines={2}>{match.name_en}</Text>
							<Text style={groupsStyles.suggestionMeta} numberOfLines={1}>{[catalogItemSize(match), match.store].filter(Boolean).join(" · ")}</Text>
						</TouchableOpacity>
					)}
					ListEmptyComponent={
						<View style={[groupsStyles.suggestionCard, groupsStyles.suggestionEmptyCard]}>
							<Text style={groupsStyles.suggestionMeta}>{failed ? "Couldn't load suggestions." : "No matches in the catalog."}</Text>
						</View>
					}
					ListFooterComponent={editManually}
				/>
			)}

		</View>
	);

}


export default ReplacementSuggestions;
