import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackButton from "../../components/BackButton";
import { ROLE_LABELS } from "../../components/GroupCard";
import Header from "../../components/Header";
import useGroups, { type Group as GroupType } from "../../hooks/useGroups";
import { useTheme } from "../../hooks/useTheme";


// US 07 — the group the user selected on the Home page.
// Home passes the group's details as route params (no extra request needed).
// Item notifications (AC-02) open this screen with only `id` (and `name`),
// so the rest is then loaded from GET /api/groups.

type GroupParams = {
	id: string
	name?: string
	myRole?: GroupType["myRole"]
	memberCount?: string
}


function Group() {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	const params = useLocalSearchParams<GroupParams>();
	const { id } = params;

	const { groups, loading, fetchGroups } = useGroups();
	const needsDetails = !params.myRole;

	useEffect(() => {
		if (needsDetails) fetchGroups();
	}, [needsDetails, fetchGroups]);

	const fetched = [...groups.created, ...groups.shared].find((group) => group.id === id);

	const name = fetched?.name ?? params.name ?? "";
	const myRole = fetched?.myRole ?? params.myRole;
	const count = fetched?.memberCount ?? (Number(params.memberCount) || 0);

	const members = needsDetails && !fetched ? "" : `${count} ${count === 1 ? "member" : "members"}`;
	const roleLabel = myRole && ROLE_LABELS[myRole] ? ROLE_LABELS[myRole] : "";
	const meta = [members, roleLabel].filter(Boolean).join(" · ");

	// US 30 AC-03: only the Group Creator and admins see the members page
	const canViewMembers = myRole === "creator" || myRole === "admin";


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
							{needsDetails && loading && !fetched ? (
								<ActivityIndicator style={{ alignSelf: "flex-start" }} color={colors.primary} />
							) : (
								<Text style={groupsStyles.groupMeta}>{meta}</Text>
							)}
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


export default Group;
