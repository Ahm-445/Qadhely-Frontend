import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, Share, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AddMembersModal from "../../components/AddMembersModal";
import { ROLE_LABELS } from "../../components/GroupCard";
import GroupHeader from "../../components/GroupHeader";
import useGroups, { GroupMember } from "../../hooks/useGroups";
import { useTheme } from "../../hooks/useTheme";


// US 30 — View Group Members (SF-25)
// AC-01: every member's handle name and role. AC-02: reloaded each time the screen is shown,
// and on pull-to-refresh. AC-03: the backend refuses regular members (403); Group.tsx also
// hides the icon that opens this screen from them.
// "Add members": By contact (AddMembersModal) or By invite link (shared like on Home).

type MembersParams = {
	id: string
	name: string
}


function GroupMembers() {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	const { id, name } = useLocalSearchParams<MembersParams>();
	const { getGroupMembers, generateGroupInvite } = useGroups();

	const [members, setMembers] = useState<GroupMember[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState("");
	const [pickerOpen, setPickerOpen] = useState(false);
	const [sharing, setSharing] = useState(false);


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


	const handleShareInvite = async () => {
		if (!id || sharing) return;

		setSharing(true);
		const result = await generateGroupInvite(id);
		setSharing(false);

		if (!result.success) {
			Alert.alert("Invite failed", result.error);
			return;
		}

		await Share.share({
			message: `Join my Qadhely shopping group "${name}": ${result.data.inviteLink}`,
		});
	};


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

				<GroupHeader
					name={name || "Group"}
					subtitle={loading || error ? "Members" : `Members · ${members.length}`}
				/>

				<View style={groupsStyles.addMembersSection}>
					<Text style={groupsStyles.addMembersLabel}>Add members</Text>
					<View style={groupsStyles.addMembersRow}>
						<TouchableOpacity
							style={[groupsStyles.addMembersButton, { borderColor: colors.primary }]}
							activeOpacity={0.8}
							onPress={() => setPickerOpen(true)}
						>
							<Ionicons name="person-add-outline" size={18} color={colors.primary} />
							<Text style={[groupsStyles.addMembersButtonText, { color: colors.primary }]}>By contact</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[groupsStyles.addMembersButton, { borderColor: colors.success }]}
							activeOpacity={0.8}
							disabled={sharing}
							onPress={handleShareInvite}
						>
							{sharing ? (
								<ActivityIndicator size="small" color={colors.success} />
							) : (
								<Ionicons name="link-outline" size={18} color={colors.success} />
							)}
							<Text style={[groupsStyles.addMembersButtonText, { color: colors.success }]}>By invite link</Text>
						</TouchableOpacity>
					</View>
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
						ListHeaderComponent={<Text style={[groupsStyles.sectionTitle, { marginTop: 20 }]}>Members</Text>}
						ListEmptyComponent={<Text style={groupsStyles.sectionEmpty}>No members found.</Text>}
					/>
				)}

				<AddMembersModal
					visible={pickerOpen}
					groupId={id}
					memberIds={members.map((m) => m.id)}
					onClose={() => setPickerOpen(false)}
					onAdded={load}
				/>

			</SafeAreaView>

		</LinearGradient>
	);

}


export default GroupMembers;
