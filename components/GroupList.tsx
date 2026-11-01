import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackButton from "./BackButton";
import { ROLE_LABELS } from "./GroupCard";
import { isGroupManager, useGroup } from "../hooks/useGroup";
import { useTheme } from "../hooks/useTheme";


// US 07 — the group the user selected on the Home page, as the "Group list" tab.
// The group's details come from hooks/useGroup (Home passed them as route params).

function GroupList() {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	const { id, name, myRole, memberCount } = useGroup();

	const count = Number(memberCount) || 0;
	const members = `${count} ${count === 1 ? "member" : "members"}`;

	// US 30 AC-03: only the Group Creator and admins see the members page
	const canViewMembers = isGroupManager(myRole);


	return (
		<LinearGradient colors={colors.gradients.background} style={groupsStyles.container}>

			<StatusBar barStyle={colors.statusBarStyle} />

			<SafeAreaView edges={["top", "left", "right"]} style={groupsStyles.safeArea}>

				

				<BackButton />

				<View style={groupsStyles.groupDetails}>

					<LinearGradient colors={colors.gradients.surface} style={groupsStyles.groupCard}>

						<LinearGradient colors={colors.gradients.primary} style={groupsStyles.groupIcon}>
							<Ionicons name="cart-outline" size={22} color="#ffffff" />
						</LinearGradient>

						<View style={groupsStyles.groupTextContainer}>
							<Text style={groupsStyles.groupName} numberOfLines={2}>{name}</Text>
							<Text style={groupsStyles.groupMeta}>
								{members}{ROLE_LABELS[myRole] ? ` · ${ROLE_LABELS[myRole]}` : ""}
							</Text>
						</View>

					</LinearGradient>

					{canViewMembers && (
						<TouchableOpacity
							style={groupsStyles.membersButton}
							activeOpacity={0.8}
							onPress={() => router.push({ pathname: "/GroupMembers", params: { id, name } })}
						>
							<Ionicons name="people-outline" size={18} color={colors.primary} />
							<Text style={groupsStyles.membersButtonText}>View members</Text>
						</TouchableOpacity>
					)}

					<Text style={groupsStyles.sectionTitle}>Shopping list</Text>
					<Text style={groupsStyles.sectionEmpty}>No items in this list yet.</Text>

				</View>

			</SafeAreaView>

		</LinearGradient>
	);

}


export default GroupList;
