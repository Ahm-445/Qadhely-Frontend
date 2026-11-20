import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

import useGroups from "../hooks/useGroups";
import { useTheme } from "../hooks/useTheme";
import type { Group } from "../hooks/useGroups";


// US 08 — Deleting Shopping List Groups
// Opened by a long press on a group the user created (Home).
// AC-02: the creator must tick that they understand the action is irreversible before
//        "Delete group" is enabled. No OTP is needed for this action.
// AC-01: on success the group is gone for every member; Home reloads its list.

interface DeleteGroupDialogProps {
	group: Group | null       // the group to delete; null keeps the dialog closed
	onClose: () => void
	onDeleted: (group: Group) => void
}


function DeleteGroupDialog({ group, onClose, onDeleted }: DeleteGroupDialogProps) {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	const { deleteGroup } = useGroups();

	const [acknowledged, setAcknowledged] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState("");


	// closing resets the dialog, so it starts fresh for the next group
	const close = () => {
		if (deleting) return;
		setAcknowledged(false);
		setError("");
		onClose();
	};


	const handleDelete = async () => {
		if (!group) return;

		setDeleting(true);
		setError("");

		const result = await deleteGroup(group.id);

		setDeleting(false);

		if (!result.success) {
			setError(result.error);
			return;
		}

		setAcknowledged(false);
		onDeleted(group);
	};


	const memberText = group
		? `${group.memberCount} ${group.memberCount === 1 ? "member" : "members"}`
		: "";


	return (
		<Modal visible={!!group} transparent animationType="fade" onRequestClose={close}>

			<Pressable style={groupsStyles.dialogBackdrop} onPress={close}>

				<Pressable style={[groupsStyles.dialogCard, { backgroundColor: colors.surface }]} onPress={() => {}}>

					<View style={groupsStyles.dialogIcon}>
						<Ionicons name="trash-outline" size={26} color={colors.danger} />
					</View>

					<Text style={groupsStyles.dialogTitle}>Delete group?</Text>

					<Text style={groupsStyles.dialogGroupName} numberOfLines={2}>{group?.name}</Text>

					<Text style={groupsStyles.dialogText}>
						The group and its shopping list will be deleted for all {memberText}, and everyone will be removed from it. This can&apos;t be undone.
					</Text>

					<TouchableOpacity
						style={groupsStyles.dialogAckRow}
						activeOpacity={0.8}
						disabled={deleting}
						onPress={() => setAcknowledged((v) => !v)}
						accessibilityRole="checkbox"
						accessibilityState={{ checked: acknowledged }}
					>
						<Ionicons
							name={acknowledged ? "checkbox" : "square-outline"}
							size={22}
							color={acknowledged ? colors.danger : colors.textMuted}
						/>
						<Text style={groupsStyles.dialogAckText}>I understand this action is irreversible</Text>
					</TouchableOpacity>

					{!!error && <Text style={groupsStyles.dialogError}>{error}</Text>}

					<View style={groupsStyles.dialogButtons}>

						<TouchableOpacity
							style={[groupsStyles.dialogButton, groupsStyles.dialogCancelButton]}
							activeOpacity={0.8}
							disabled={deleting}
							onPress={close}
						>
							<Text style={groupsStyles.dialogCancelText}>Cancel</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[groupsStyles.dialogButton, groupsStyles.dialogDeleteButton, (!acknowledged || deleting) && groupsStyles.dialogButtonDisabled]}
							activeOpacity={0.8}
							disabled={!acknowledged || deleting}
							onPress={handleDelete}
						>
							{deleting
								? <ActivityIndicator color="#ffffff" />
								: <Text style={groupsStyles.dialogDeleteText}>Delete group</Text>}
						</TouchableOpacity>

					</View>

				</Pressable>

			</Pressable>

		</Modal>
	);

}


export default DeleteGroupDialog;
