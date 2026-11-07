import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Text, TouchableOpacity, View } from "react-native";

import type { ListItem } from "../hooks/useGroups";
import { useTheme } from "../hooks/useTheme";
import { listItemName } from "../services/catalog";


// US 15 — one item of the shopping list: name, image, quantity, unit and store (AC-01).
// The row stores a catalog id; the backend sends that product with it (or the custom request's own fields).
// The pencil and trash buttons are for the Group Creator and admins only.

export type ItemStatus = "found" | "notFound";

type ItemCardProps = {
	item: ListItem
	status?: ItemStatus
	canManage: boolean
	onStatusChange: (status: ItemStatus) => void
	onEdit: () => void
	onRemove: () => void
}


function ItemCard({ item, status, canManage, onStatusChange, onEdit, onRemove }: ItemCardProps) {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	const name = listItemName(item);
	const image = item.catalogItem?.image ?? item.customImage;
	const store = item.catalogItem?.store ?? item.customStore;


	return (
		<LinearGradient colors={colors.gradients.surface} style={groupsStyles.listItemCard}>

			<View style={groupsStyles.listItemImage}>
				{!!image && <Image source={image} style={groupsStyles.listItemImageFill} contentFit="contain" />}
			</View>

			<View style={groupsStyles.listItemInfo}>

				<Text style={groupsStyles.listItemName} numberOfLines={2}>{name}</Text>
				<Text style={groupsStyles.listItemMeta}>Qty: {item.quantity} {item.unit}</Text>
				{!!store && <Text style={groupsStyles.listItemMeta} numberOfLines={1}>{store}</Text>}

				{canManage && (
					<View style={groupsStyles.listItemAdminActions}>

						<TouchableOpacity
							style={groupsStyles.listItemAdminButton}
							activeOpacity={0.8}
							onPress={onEdit}
							hitSlop={4}
							accessibilityRole="button"
							accessibilityLabel={`Edit ${name}`}
						>
							<Ionicons name="pencil-outline" size={18} color={colors.primary} />
						</TouchableOpacity>

						<TouchableOpacity
							style={groupsStyles.listItemAdminButton}
							activeOpacity={0.8}
							onPress={onRemove}
							hitSlop={4}
							accessibilityRole="button"
							accessibilityLabel={`Remove ${name}`}
						>
							<Ionicons name="trash-outline" size={18} color={colors.danger} />
						</TouchableOpacity>

					</View>
				)}

			</View>

			<View style={groupsStyles.listItemStatusActions}>

				<TouchableOpacity
					style={[groupsStyles.listItemStatusButton, status === "notFound" && { borderColor: colors.danger, backgroundColor: colors.danger }]}
					activeOpacity={0.8}
					onPress={() => onStatusChange("notFound")}
					accessibilityRole="button"
					accessibilityLabel={`Mark ${name} as not found`}
					accessibilityState={{ selected: status === "notFound" }}
				>
					<Ionicons name="close" size={22} color={status === "notFound" ? "#ffffff" : colors.danger} />
				</TouchableOpacity>

				<TouchableOpacity
					style={[groupsStyles.listItemStatusButton, status === "found" && { borderColor: colors.success, backgroundColor: colors.success }]}
					activeOpacity={0.8}
					onPress={() => onStatusChange("found")}
					accessibilityRole="button"
					accessibilityLabel={`Mark ${name} as found`}
					accessibilityState={{ selected: status === "found" }}
				>
					<Ionicons name="checkmark" size={22} color={status === "found" ? "#ffffff" : colors.success} />
				</TouchableOpacity>

			</View>

		</LinearGradient>
	);

}


export default ItemCard;
