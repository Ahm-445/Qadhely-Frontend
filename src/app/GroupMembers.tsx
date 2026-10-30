import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackButton from "../../components/BackButton";
import { ROLE_LABELS } from "../../components/GroupCard";
import Header from "../../components/Header";
import useGroups, { GroupMember } from "../../hooks/useGroups";
import { useTheme } from "../../hooks/useTheme";


// US 30 — View Group Members (SF-25)
// AC-01: every member's handle name and role. AC-02: reloaded each time the screen is shown,
// and on pull-to-refresh. AC-03: the backend refuses regular members (403); Group.tsx also
// hides the button that opens this screen from them.

type MembersParams = {
	id: string
	name: string
}


function GroupMembers() {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	const { id, name } = useLocalSearchParams<MembersParams>();
	const { getGroupMembers } = useGroups();

	const [members, setMembers] = useState<GroupMember[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState("");


	const load = useCallback(async () => {
		if (!id) {
			setError("Group not found.");
			setLoading(false);
			return;
		}

		const result = await getGroupMembers(id);

		if (result.success) {
			setMembers(result.data.members);
			setError("");
		}
		else {
			setError(result.error);
		}

		setLoading(false);
		setRefreshing(false);
	}, [id, getGroupMembers]);

	// AC-02: fetch the current list every time this screen comes into view
	useFocusEffect(
		useCallback(() => {
			load();
		}, [load])
	);


	const roleColor = (role: GroupMember["role"]) =>
		role === "creator" ? colors.success : role === "admin" ? colors.primary : colors.textMuted;

	const joined = (iso: string) => {
		const d = new Date(iso);
		return isNaN(d.getTime()) ? "" : `Joined ${d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`;
	};


	const renderMember = ({ item }: { item: GroupMember }) => (
		<LinearGradient colors={colors.gradients.surface} style={groupsStyles.memberRow}>

			<LinearGradient
				colors={item.role === "member" ? colors.gradients.muted : item.role === "admin" ? colors.gradients.blue : colors.gradients.primary}
				style={groupsStyles.memberAvatar}
			>
				<Text style={groupsStyles.memberAvatarText}>{item.handleName.charAt(0).toUpperCase()}</Text>
			</LinearGradient>

			<View style={groupsStyles.memberTextContainer}>
				<Text style={groupsStyles.memberName} numberOfLines={1}>
					{item.handleName}{item.isMe ? " (You)" : ""}
				</Text>
				{!!joined(item.joinedAt) && <Text style={groupsStyles.memberSub}>{joined(item.joinedAt)}</Text>}
			</View>

			<View style={[groupsStyles.roleBadge, { borderColor: roleColor(item.role) }]}>
				<Text style={[groupsStyles.roleBadgeText, { color: roleColor(item.role) }]}>{ROLE_LABELS[item.role]}</Text>
			</View>

		</LinearGradient>
	);


	return (
		<LinearGradient colors={colors.gradients.background} style={groupsStyles.container}>

			<StatusBar barStyle={colors.statusBarStyle} />

			<SafeAreaView style={groupsStyles.safeArea}>

				<Header />

				<BackButton />

				<View style={groupsStyles.groupDetails}>
					<Text style={groupsStyles.sectionTitle} numberOfLines={2}>{name ? `${name} · Members` : "Members"}</Text>
					{!loading && !error && (
						<Text style={groupsStyles.sectionEmpty}>
							{members.length} {members.length === 1 ? "member" : "members"}
						</Text>
					)}
				</View>

				{loading ? (
					<View style={groupsStyles.centerState}>
						<ActivityIndicator color={colors.primary} />
					</View>
				) : error ? (
					<View style={groupsStyles.centerState}>
						<Ionicons name="alert-circle-outline" size={36} color={colors.danger} />
						<Text style={[groupsStyles.sectionEmpty, { textAlign: "center" }]}>{error}</Text>
						<TouchableOpacity style={groupsStyles.retryButton} activeOpacity={0.8} onPress={() => { setLoading(true); load(); }}>
							<Text style={groupsStyles.retryButtonText}>Try again</Text>
						</TouchableOpacity>
					</View>
				) : (
					<FlatList
						data={members}
						keyExtractor={(m) => m.id}
						renderItem={renderMember}
						contentContainerStyle={groupsStyles.listContent}
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={() => { setRefreshing(true); load(); }}
								tintColor={colors.primary}
							/>
						}
						ListEmptyComponent={<Text style={groupsStyles.sectionEmpty}>No members found.</Text>}
					/>
				)}

			</SafeAreaView>

		</LinearGradient>
	);

}


export default GroupMembers;
