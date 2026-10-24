import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackButton from "../../components/BackButton";
import { ROLE_LABELS } from "../../components/GroupCard";
import Header from "../../components/Header";
import type { Group as GroupType } from "../../hooks/useGroups";
import { useTheme } from "../../hooks/useTheme";


// US 07 — the group the user selected on the Home page.
// Home passes the group's details as route params (no extra request needed).

type GroupParams = {
	id: string
	name: string
	myRole: GroupType["myRole"]
	memberCount: string
}


function Group() {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	const { name, myRole, memberCount } = useLocalSearchParams<GroupParams>();

	const count = Number(memberCount) || 0;
	const members = `${count} ${count === 1 ? "member" : "members"}`;


	return (
		<LinearGradient colors={colors.gradients.background} style={groupsStyles.container}>

			<StatusBar barStyle={colors.statusBarStyle} />

			<SafeAreaView style={groupsStyles.safeArea}>

				<Header />

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

					<Text style={groupsStyles.sectionTitle}>Shopping list</Text>
					<Text style={groupsStyles.sectionEmpty}>No items in this list yet.</Text>

				</View>

			</SafeAreaView>

		</LinearGradient>
	);

}


export default Group;
