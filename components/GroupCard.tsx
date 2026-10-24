import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "../hooks/useTheme";
import type { Group } from "../hooks/useGroups";


interface GroupCardProps {
	group: Group
	onPress?: () => void
}

export const ROLE_LABELS:Record<Group["myRole"], string> = {
	creator: "Group Creator",
	admin: "Admin",
	member: "Member",
};


const GroupCard: React.FC<GroupCardProps> = ({ group, onPress }) => {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	const members = `${group.memberCount} ${group.memberCount === 1 ? "member" : "members"}`;

	return (
		<TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={!onPress}>

			<LinearGradient colors={colors.gradients.surface} style={groupsStyles.groupCard}>

				<LinearGradient colors={colors.gradients.primary} style={groupsStyles.groupIcon}>
					<Ionicons name="cart-outline" size={22} color="#ffffff" />
				</LinearGradient>

				<View style={groupsStyles.groupTextContainer}>
					<Text style={groupsStyles.groupName} numberOfLines={1}>{group.name}</Text>
					<Text style={groupsStyles.groupMeta}>{members} · {ROLE_LABELS[group.myRole]}</Text>
				</View>

				<Ionicons name="chevron-forward-outline" size={20} color={colors.textMuted} />

			</LinearGradient>

		</TouchableOpacity>
	);

};


export default GroupCard;
