import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";

import useGroups, { type ListItem } from "../hooks/useGroups";
import { useTheme } from "../hooks/useTheme";
import { listItemName } from "../services/catalog";
import { UNITS, UNIT_LABELS, allowsDecimal, sanitizeQuantityInput, validateQuantity, type Unit } from "../utils/quantity";


// US 14 — Modify Item Quantity and Unit
// AC-01: asks for the new quantity and unit. AC-02: Save stores them on the server (PATCH).
// AC-03: Cancel changes nothing.
// AC-04: an invalid quantity, here or from the server, shows a message and lets the admin fix it or cancel.

// an Arabic keyboard can type ٣ or ٫, which sanitizeQuantityInput would drop
function toLatinDigits(text: string): string {
	return text.replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660)).replace(/[,٫]/g, ".");
}


type EditItemModalProps = {
	item: ListItem
	onClose: () => void
	onSaved: (item: ListItem) => void
}


function EditItemModal({ item, onClose, onSaved }: EditItemModalProps) {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	const [quantity, setQuantity] = useState(String(item.quantity));
	const [unit, setUnit] = useState<Unit>(item.unit);
	const [error, setError] = useState("");
	const [saving, setSaving] = useState(false);

	const { updateListItem } = useGroups();


	const save = async () => {
		const message = validateQuantity(quantity, unit);

		if (message) {
			setError(message);
			return;
		}

		setSaving(true);
		const result = await updateListItem(item.groupId, item.id, { quantity: Number(quantity), unit });
		setSaving(false);

		if (!result.success) {
			setError(result.error);
			return;
		}

		onSaved(result.data.item);
	};


	return (
		<Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>

			<KeyboardAvoidingView
				style={groupsStyles.modalBackdrop}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
			>

				<View style={groupsStyles.modalCard}>

					<Text style={groupsStyles.label} numberOfLines={2}>Edit {listItemName(item)}</Text>

					<TextInput
						style={groupsStyles.input}
						value={quantity}
						onChangeText={(text) => { setQuantity(sanitizeQuantityInput(toLatinDigits(text), unit)); setError(""); }}
						keyboardType={allowsDecimal(unit) ? "decimal-pad" : "number-pad"}
						accessibilityLabel="Quantity"
						placeholder="Quantity"
						placeholderTextColor={colors.textMuted}
						autoFocus
					/>

					<View style={groupsStyles.unitOptions}>
						{UNITS.map((option) => (
							<TouchableOpacity
								key={option}
								style={[groupsStyles.unitOption, unit === option && groupsStyles.unitOptionSelected]}
								activeOpacity={0.8}
								onPress={() => { setUnit(option); setError(""); }}
								accessibilityRole="button"
								accessibilityState={{ selected: unit === option }}
							>
								<Text style={[groupsStyles.unitOptionText, unit === option && groupsStyles.unitOptionTextSelected]}>{UNIT_LABELS[option]}</Text>
							</TouchableOpacity>
						))}
					</View>

					{!!error && <Text style={groupsStyles.modalError}>{error}</Text>}

					<View style={groupsStyles.modalActions}>

						<TouchableOpacity style={groupsStyles.modalButton} activeOpacity={0.8} onPress={onClose} accessibilityRole="button">
							<Text style={groupsStyles.modalButtonText}>Cancel</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[groupsStyles.modalButton, groupsStyles.modalButtonPrimary, saving && groupsStyles.createButtonDisabled]}
							activeOpacity={0.8}
							onPress={save}
							disabled={saving}
							accessibilityRole="button"
							accessibilityState={{ disabled: saving }}
						>
							<Text style={[groupsStyles.modalButtonText, groupsStyles.modalButtonPrimaryText]}>Save</Text>
						</TouchableOpacity>

					</View>

				</View>

			</KeyboardAvoidingView>

		</Modal>
	);

}


export default EditItemModal;
