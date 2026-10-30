import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, SectionList, Share, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GroupCard from "../../components/GroupCard";
import HomeHeader from "../../components/HomeHeader";
import useGroups from "../../hooks/useGroups";
import { useTheme } from "../../hooks/useTheme";
import type { Group } from "../../hooks/useGroups";

// US 05 — Home page: "New list" button (AC-01) and the
// "Created Groups" / "Shared Groups" categories (AC-03, SF-20).
// US 07 — AC-01: every group the user is a member of, split into
// "Created Groups" (creator) and "Shared Groups" (admin / member); tap one to open it.

function Home() {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	const { groups, loading, fetchGroups, generateGroupInvite } = useGroups();
	const [error, setError] = useState("");
	const [refreshing, setRefreshing] = useState(false);

const handleShareInvite = async (group: Group) => {
  const result = await generateGroupInvite(group.id);

  if (!result.success) {
    Alert.alert("Invite failed", result.error);
    return;
  }

  await Share.share({
    message: `Join my Qadhely shopping group "${group.name}": ${result.data.inviteLink}`,
  });
};

	const load = useCallback(async () => {
		const result = await fetchGroups();
		setError(result.success ? "" : result.error);
		setRefreshing(false);
	}, [fetchGroups]);

	// reload every time Home is shown again (e.g. right after creating a group)
	useFocusEffect(
		useCallback(() => {
			load();
		}, [load])
	);


	const sections = [
		{ title: "Created Groups", data: groups.created, empty: "You haven't created a group yet." },
		{ title: "Shared Groups", data: groups.shared, empty: "No one has added you to a group yet." },
	];

	const firstLoad = loading && !refreshing && groups.created.length === 0 && groups.shared.length === 0;


	return (
		<LinearGradient colors={colors.gradients.background} style={groupsStyles.container}>

			<StatusBar barStyle={colors.statusBarStyle} />

			<SafeAreaView style={groupsStyles.safeArea}>

				<HomeHeader />

				<View style={groupsStyles.newListSection}>
					<TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/CreateGroup")}>
						<LinearGradient
							colors={colors.gradients.primary}
							style={groupsStyles.newListButton}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
						>
							<Ionicons name="add-circle-outline" size={24} color="#ffffff" />
							<Text style={groupsStyles.newListText}>New list</Text>
						</LinearGradient>
					</TouchableOpacity>
				</View>

				{!!error && <Text style={groupsStyles.errorText}>{error}</Text>}

				{firstLoad ? (
					<ActivityIndicator style={{ marginTop: 32 }} color={colors.primary} />
				) : (
					<SectionList
						sections={sections}
						keyExtractor={(group) => group.id}
						contentContainerStyle={groupsStyles.listContent}
						stickySectionHeadersEnabled={false}
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={() => { setRefreshing(true); load(); }}
								tintColor={colors.primary}
							/>
						}
						renderSectionHeader={({ section }) => (
							<Text style={groupsStyles.sectionTitle}>{section.title}</Text>
						)}
						renderSectionFooter={({ section }) =>
							section.data.length === 0 ? <Text style={groupsStyles.sectionEmpty}>{section.empty}</Text> : null
						}
						renderItem={({ item }) => (
							<GroupCard
								group={item}
								onShareInvite={handleShareInvite}
								onPress={() => router.push({
									pathname: "/Group",
									params: { id: item.id, name: item.name, myRole: item.myRole, memberCount: String(item.memberCount) },
								})}
							/>
						)}
					/>
				)}

			</SafeAreaView>

		</LinearGradient>
	);

}


export default Home;
