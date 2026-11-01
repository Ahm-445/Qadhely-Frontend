import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ROLE_LABELS } from "./GroupCard";
import GroupHeader from "./GroupHeader";
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

	// US 30 AC-03: only the Group Creator and admins see the members icon
	const canViewMembers = isGroupManager(myRole);


	return (
		<LinearGradient colors={colors.gradients.background} style={groupsStyles.container}>

			<StatusBar barStyle={colors.statusBarStyle} />

			<SafeAreaView edges={["top", "left", "right"]} style={groupsStyles.safeArea}>

				<GroupHeader
					name={name}
					subtitle={`${members}${ROLE_LABELS[myRole] ? ` · ${ROLE_LABELS[myRole]}` : ""}`}
					onMembersPress={canViewMembers ? () => router.push({ pathname: "/GroupMembers", params: { id, name } }) : undefined}
				/>

				<View style={groupsStyles.groupDetails}>

					<Text style={groupsStyles.sectionTitle}>Shopping list</Text>
					<Text style={groupsStyles.sectionEmpty}>No items in this list yet.</Text>

				</View>

			</SafeAreaView>

		</LinearGradient>
	);

}


export default GroupList;
