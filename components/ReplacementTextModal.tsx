import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";

import type { ListItem } from "../hooks/useGroups";
import { useTheme } from "../hooks/useTheme";
import { listItemName } from "../services/catalog";


// US 16 AC-02 / AC-03 — after a member taps X (not found), they may suggest a replacement.
// The text is optional: "Skip" marks the item not found without a suggestion.

const REPLACEMENT_TEXT_MAX = 100;

type ReplacementTextModalProps = {
	item: ListItem
	onClose: () => void
	// resolves when saved; a thrown error is shown in the dialog
	onSubmit: (replacementText: string) => Promise<void>
}


function ReplacementTextModal({ item, onClose, onSubmit }: ReplacementTextModalProps) {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	const [text, setText] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");


	const submit = async (value: string) => {
		setSaving(true);
		setError("");
		try {
			await onSubmit(value.trim());
		}
		catch (e) {
			setError(e instanceof Error ? e.message : "Could not save. Try again.");
			setSaving(false);
		}
	};


	return (
		<Modal visible transparent animationType="fade" onRequestClose={saving ? undefined : onClose} statusBarTranslucent>

			<KeyboardAvoidingView
				style={groupsStyles.modalBackdrop}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
			>

				<View style={groupsStyles.modalCard}>

					<Text style={groupsStyles.label} numberOfLines={2}>{listItemName(item)} not found</Text>

					<Text style={groupsStyles.replacementHint}>Suggest a replacement for the admin (optional).</Text>

					<TextInput
						style={groupsStyles.input}
						value={text}
						onChangeText={setText}
						placeholder="e.g. Almarai low fat milk"
						placeholderTextColor={colors.textMuted}
						maxLength={REPLACEMENT_TEXT_MAX}
						autoFocus
						editable={!saving}
						returnKeyType="send"
						onSubmitEditing={() => submit(text)}
					/>

					{!!error && <Text style={groupsStyles.modalError}>{error}</Text>}

					<View style={groupsStyles.modalActions}>

						<TouchableOpacity
							style={[groupsStyles.modalButton, saving && groupsStyles.createButtonDisabled]}
							activeOpacity={0.8}
							disabled={saving}
							onPress={() => submit("")}
							accessibilityRole="button"
						>
							<Text style={groupsStyles.modalButtonText}>Skip</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[groupsStyles.modalButton, groupsStyles.modalButtonPrimary, (saving || !text.trim()) && groupsStyles.createButtonDisabled]}
							activeOpacity={0.8}
							disabled={saving || !text.trim()}
							onPress={() => submit(text)}
							accessibilityRole="button"
						>
							{saving
								? <ActivityIndicator color="#ffffff" />
								: <Text style={[groupsStyles.modalButtonText, groupsStyles.modalButtonPrimaryText]}>Send</Text>}
						</TouchableOpacity>

					</View>

				</View>

			</KeyboardAvoidingView>

		</Modal>
	);

}


export default ReplacementTextModal;
