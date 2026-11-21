import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "../hooks/useTheme";
import { catalogItemSize, catalogItemTitle, type CatalogItem } from "../services/catalog";


// US 12 / US 23 — one catalog product, as the card the user taps to pick it.
// The search results (US 12) and the AI suggestions (US 23) show the same product the same way,
// so the card lives here instead of inside either screen.

interface CatalogItemCardProps {
	item: CatalogItem
	/** The user picked this product. */
	onPress: () => void
	/** US 23: one more line under the product, e.g. why the AI suggests it. */
	note?: string | null
}


function CatalogItemCard({ item, onPress, note }: CatalogItemCardProps) {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	const size = catalogItemSize(item);


	return (
		<TouchableOpacity
			activeOpacity={0.8}
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={`${catalogItemTitle(item)}${item.store ? `, ${item.store}` : ""}${note ? `. ${note}` : ""}`}
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

					{note ? <Text style={groupsStyles.itemNote}>{note}</Text> : null}

				</View>

				<Ionicons name="chevron-forward" size={20} color={colors.textMuted} />

			</LinearGradient>

		</TouchableOpacity>
	);

}


export default CatalogItemCard;
