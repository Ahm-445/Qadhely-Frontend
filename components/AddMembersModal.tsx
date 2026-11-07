import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

import ContactPickerItem from "./ContactPickerItem";
import useGroups, { RegisteredContact } from "../hooks/useGroups";
import { useTheme } from "../hooks/useTheme";


// US 30 — "Add members → By contact": pick registered contacts who are not in the group yet,
// then add each one with POST /api/groups/:groupId/members.

interface AddMembersModalProps {
	visible: boolean
	groupId: string
	memberIds: string[]
	onClose: () => void
	onAdded: () => void
}

function AddMembersModal({ visible, groupId, memberIds, onClose, onAdded }: AddMembersModalProps) {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	const { getRegisteredContacts, addGroupMember } = useGroups();

	const [contacts, setContacts] = useState<RegisteredContact[]>([]);
	const [selected, setSelected] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [note, setNote] = useState("");
	const [error, setError] = useState("");


	useEffect(() => {
		if (!visible) return;

		let active = true;

		setSelected([]);
		setError("");
		setNote("");
		setLoading(true);

		getRegisteredContacts().then((result) => {
			if (!active) return;

			if (!result.success) {
				setContacts([]);
				setError(result.error);
			}
			else if (!result.data.permission) {
				setContacts([]);
				setNote("Allow access to your contacts to add members from them.");
			}
			else {
				const available = result.data.users.filter((u) => !memberIds.includes(u.id));
				setContacts(available);
				if (available.length === 0) setNote("All of your contacts who use Qadhely are already in this group.");
			}

			setLoading(false);
		});

		return () => { active = false; };
	// load once each time the sheet opens
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [visible]);


	const toggle = (userId: string) =>
		setSelected((prev) => (prev.includes(userId) ? prev.filter((x) => x !== userId) : [...prev, userId]));


	const handleAdd = async () => {
		setSaving(true);
		setError("");

		const failed: string[] = [];

		for (const userId of selected) {
			const result = await addGroupMember(groupId, userId);
			if (!result.success) failed.push(result.error);
		}

		setSaving(false);

		if (failed.length < selected.length) onAdded();

		if (failed.length > 0) {
			setError(failed.length === 1 ? failed[0] : `${failed.length} contacts could not be added.`);
			setSelected([]);
			return;
		}

		onClose();
	};


	return (
		<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>

			<Pressable style={groupsStyles.sheetBackdrop} onPress={saving ? undefined : onClose}>

				<Pressable onPress={() => {}}>
					<LinearGradient colors={colors.gradients.surface} style={[groupsStyles.sheet, { maxHeight: 560 }]}>

						<View style={groupsStyles.sheetHandle} />

						<Text style={groupsStyles.sheetTitle}>Add from contacts</Text>

						{loading ? (
							<ActivityIndicator style={{ marginVertical: 24 }} color={colors.primary} />
						) : (
							<FlatList
								data={contacts}
								keyExtractor={(c) => c.id}
								style={{ flexGrow: 0 }}
								renderItem={({ item }) => (
									<ContactPickerItem contact={item} selected={selected.includes(item.id)} onToggle={() => toggle(item.id)} />
								)}
								ListEmptyComponent={note ? <Text style={groupsStyles.note}>{note}</Text> : undefined}
							/>
						)}

						{!!error && <Text style={[groupsStyles.fieldError, { marginBottom: 4 }]}>{error}</Text>}

						<TouchableOpacity
							activeOpacity={0.8}
							disabled={selected.length === 0 || saving}
							onPress={handleAdd}
							style={{ marginTop: 16 }}
						>
							<LinearGradient
								colors={colors.gradients.primary}
								style={[groupsStyles.createButton, (selected.length === 0 || saving) && groupsStyles.createButtonDisabled]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
							>
								{saving ? (
									<ActivityIndicator color="#ffffff" />
								) : (
									<Text style={groupsStyles.createButtonText}>
										{selected.length > 0 ? `Add ${selected.length} ${selected.length === 1 ? "member" : "members"}` : "Add members"}
									</Text>
								)}
							</LinearGradient>
						</TouchableOpacity>

					</LinearGradient>
				</Pressable>

			</Pressable>

		</Modal>
	);

}

export default AddMembersModal;
