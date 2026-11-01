import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "../hooks/useTheme";


// US 30 — inside a group, the group's name takes the place of the "Qadhely" title.
// Back sits inside the card, left of the cart icon.
// onMembersPress is only passed for the Group Creator and admins, so only they see the members icon.

interface GroupHeaderProps {
	name: string
	subtitle?: string
	onMembersPress?: () => void
}

function GroupHeader({ name, subtitle, onMembersPress }: GroupHeaderProps) {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	return (
		<View style={groupsStyles.groupHeader}>

			<LinearGradient colors={colors.gradients.surface} style={groupsStyles.groupHeaderCard}>

				<TouchableOpacity
					style={groupsStyles.groupHeaderBackButton}
					activeOpacity={0.8}
					onPress={() => (router.canGoBack() ? router.back() : router.replace("/Home"))}
					accessibilityLabel="Back"
				>
					<Ionicons name="chevron-back-outline" size={22} color={colors.text} />
				</TouchableOpacity>

				<LinearGradient colors={colors.gradients.primary} style={groupsStyles.groupHeaderIcon}>
					<Ionicons name="cart-outline" size={22} color="#ffffff" />
				</LinearGradient>

				<View style={groupsStyles.groupHeaderText}>
					<Text style={groupsStyles.groupHeaderTitle} numberOfLines={1}>{name}</Text>
					{!!subtitle && <Text style={groupsStyles.groupHeaderSubtitle} numberOfLines={1}>{subtitle}</Text>}
				</View>

				{onMembersPress && (
					<TouchableOpacity
						style={groupsStyles.groupHeaderMembersButton}
						activeOpacity={0.8}
						onPress={onMembersPress}
						accessibilityLabel="View members"
					>
						<Ionicons name="person-outline" size={20} color={colors.primary} />
					</TouchableOpacity>
				)}

			</LinearGradient>

		</View>
	);

}

export default GroupHeader;
