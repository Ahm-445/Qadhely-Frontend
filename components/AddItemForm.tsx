import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Modal,
	Pressable,
	ScrollView,
	StatusBar,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackButton from "./BackButton";
import { useGroup } from "../hooks/useGroup";
import useGroups from "../hooks/useGroups";
import { useTheme } from "../hooks/useTheme";
import { catalogItemSize, catalogItemTitle, getCatalogItem } from "../services/catalog";
import {
	UNITS,
	UNIT_LABELS,
	allowsDecimal,
	parseQuantity,
	sanitizeQuantityInput,
	validateQuantity,
	type Unit
} from "../utils/quantity";


// US 12 — Add an item to the group's shopping list.
//
// The screen is opened with a catalog item id: the search bar (the "Add items" tab) will pass the
// item the user tapped, and this screen collects the quantity and the unit and sends the POST.
// The group comes from hooks/useGroup — the (tabs) layout handed it down, so the id is already here.

interface AddItemFormProps {
	/** The catalog item the user picked. */
	itemId: string
	/** The item is on the list — go back to the search. */
	onAdded: () => void
	/** The user backed out without adding. */
	onCancel: () => void
}


function AddItemForm({ itemId, onAdded, onCancel }: AddItemFormProps) {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	const { id: groupId, name: groupName } = useGroup();
	const { addListItem } = useGroups();

	// the catalog lookup is the one place that knows an item's details
	const item = useMemo(() => getCatalogItem(itemId), [itemId]);

	const [quantity, setQuantity] = useState("");
	const [unit, setUnit] = useState<Unit>("piece");
	const [unitPickerOpen, setUnitPickerOpen] = useState(false);
	const [quantityFocused, setQuantityFocused] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const quantityError = validateQuantity(quantity, unit);
	const canAdd = item !== null && quantityError === null && !saving;


	const handleQuantityChange = (text: string) => {
		setQuantity(sanitizeQuantityInput(text, unit));
		setError(null);
	};


	// AC-03: the unit decides whether a decimal point is allowed, so a quantity already typed is
	// re-checked against the new unit instead of being sent as it stands.
	const handleUnitChange = (next: Unit) => {
		setUnitPickerOpen(false);
		setQuantity((current) => sanitizeQuantityInput(current, next));
		setUnit(next);
		setError(null);
	};


	const handleAdd = async () => {
		if (!canAdd) return;

		const value = parseQuantity(quantity, unit);
		if (value === null) return;

		setSaving(true);
		setError(null);

		const result = await addListItem(groupId, { catalogItemId: item.id, quantity: value, unit });

		setSaving(false);

		if (!result.success) {
			setError(result.error);
			return;
		}

		Alert.alert("Added to the list", catalogItemTitle(item));
		onAdded();
	};


	// The catalog has no such item (possible once the real lookup replaces the fixture).
	if (!item) {

		return (
			<LinearGradient colors={colors.gradients.background} style={groupsStyles.container}>

				<StatusBar barStyle={colors.statusBarStyle} />

				<SafeAreaView edges={["top", "left", "right"]} style={groupsStyles.safeArea}>

					<BackButton onPress={onCancel} />

					<View style={groupsStyles.formSection}>

						<LinearGradient colors={colors.gradients.surface} style={groupsStyles.missingCard}>
							<Text style={groupsStyles.missingTitle}>Item not found</Text>
							<Text style={groupsStyles.missingText}>
								The catalog has no item with the id {itemId}. Pick another item and try again.
							</Text>
						</LinearGradient>

					</View>

				</SafeAreaView>

			</LinearGradient>
		);
	}


	return (
		<LinearGradient colors={colors.gradients.background} style={groupsStyles.container}>

			<StatusBar barStyle={colors.statusBarStyle} />

			<SafeAreaView edges={["top", "left", "right"]} style={groupsStyles.safeArea}>

				<BackButton onPress={onCancel} />

				<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={groupsStyles.formSection}>

					<Text style={groupsStyles.sectionTitle} numberOfLines={2}>
						Add item{groupName ? ` · ${groupName}` : ""}
					</Text>

					<LinearGradient colors={colors.gradients.surface} style={groupsStyles.itemCard}>

						<View style={[groupsStyles.itemImageWrap, { backgroundColor: colors.backgrounds.editInput }]}>
							{item.image ? (
								<Image
									source={{ uri: item.image }}
									style={groupsStyles.itemImage}
									contentFit="cover"
									transition={200}
									accessibilityLabel={catalogItemTitle(item)}
								/>
							) : (
								<Ionicons name="image-outline" size={32} color={colors.textMuted} />
							)}
						</View>

						<View style={groupsStyles.itemTextContainer}>

							{item.brand_en ? <Text style={groupsStyles.itemBrand} numberOfLines={1}>{item.brand_en}</Text> : null}

							<Text style={groupsStyles.itemName} numberOfLines={3}>{item.name_en}</Text>

							{catalogItemSize(item) !== "" ? <Text style={groupsStyles.itemSize}>{catalogItemSize(item)}</Text> : null}

							{item.store ? (
								<View style={groupsStyles.itemStore}>
									<Ionicons name="storefront-outline" size={14} color={colors.textMuted} />
									<Text style={groupsStyles.itemStoreText} numberOfLines={1}>{item.store}</Text>
								</View>
							) : null}

						</View>

					</LinearGradient>

					<View style={[groupsStyles.quantityRow, { marginTop: 24 }]}>

						<View style={groupsStyles.quantityField}>

							<Text style={groupsStyles.label}>Quantity</Text>

							<TextInput
								style={[
									groupsStyles.input,
									groupsStyles.quantityInput,
									quantityFocused && groupsStyles.inputFocused,
									quantityError !== null && quantity !== "" && groupsStyles.quantityInputInvalid
								]}
								value={quantity}
								onChangeText={handleQuantityChange}
								onFocus={() => setQuantityFocused(true)}
								onBlur={() => setQuantityFocused(false)}
								placeholder="0"
								placeholderTextColor={colors.textMuted}
								keyboardType={allowsDecimal(unit) ? "decimal-pad" : "number-pad"}
								inputMode="decimal"
								returnKeyType="done"
								editable={!saving}
								accessibilityLabel={`Quantity in ${UNIT_LABELS[unit].toLowerCase()}`}
							/>

						</View>

						<View>

							<Text style={groupsStyles.label}>Unit</Text>

							<TouchableOpacity
								style={groupsStyles.unitSelect}
								activeOpacity={0.8}
								onPress={() => setUnitPickerOpen(true)}
								disabled={saving}
								accessibilityRole="button"
								accessibilityLabel={`Unit: ${UNIT_LABELS[unit]}. Opens the unit list.`}
							>
								<Text style={groupsStyles.unitSelectText}>{UNIT_LABELS[unit]}</Text>
								<Ionicons name="chevron-down" size={18} color={colors.textMuted} />
							</TouchableOpacity>

						</View>

					</View>

					{quantity !== "" && quantityError !== null ? (
						<Text style={groupsStyles.fieldError}>{quantityError}</Text>
					) : (
						<Text style={groupsStyles.fieldHint}>
							{allowsDecimal(unit)
								? "Weight can have a decimal point, e.g. 1.5"
								: "Whole numbers only, 0 and up"}
						</Text>
					)}

					{error !== null && <Text style={groupsStyles.fieldError}>{error}</Text>}

				</ScrollView>

				<View style={groupsStyles.footer}>

					<TouchableOpacity
						activeOpacity={0.8}
						onPress={handleAdd}
						disabled={!canAdd}
						accessibilityRole="button"
						accessibilityState={{ disabled: !canAdd }}
					>
						<LinearGradient
							colors={canAdd ? colors.gradients.primary : colors.gradients.muted}
							style={groupsStyles.createButton}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
						>

							{saving ? (
								<ActivityIndicator color="#ffffff" />
							) : (
								<>
									<Ionicons name="add-circle-outline" size={24} color="#ffffff" />
									<Text style={groupsStyles.createButtonText}>Add to list</Text>
								</>
							)}

						</LinearGradient>
					</TouchableOpacity>

				</View>

				<Modal
					visible={unitPickerOpen}
					transparent
					animationType="fade"
					onRequestClose={() => setUnitPickerOpen(false)}
				>

					<Pressable style={groupsStyles.sheetBackdrop} onPress={() => setUnitPickerOpen(false)}>

						<View style={[groupsStyles.sheet, { backgroundColor: colors.surface }]}>

							<View style={groupsStyles.sheetHandle} />

							<Text style={groupsStyles.sheetTitle}>Unit</Text>

							{UNITS.map((option) => (
								<TouchableOpacity
									key={option}
									style={groupsStyles.sheetOption}
									activeOpacity={0.8}
									onPress={() => handleUnitChange(option)}
									accessibilityRole="button"
									accessibilityState={{ selected: option === unit }}
								>
									<Text
										style={[
											groupsStyles.sheetOptionText,
											option === unit && groupsStyles.sheetOptionTextSelected
										]}
									>
										{UNIT_LABELS[option]}
									</Text>

									{option === unit && <Ionicons name="checkmark" size={20} color={colors.primary} />}
								</TouchableOpacity>
							))}

						</View>

					</Pressable>

				</Modal>

			</SafeAreaView>

		</LinearGradient>
	);

}


export default AddItemForm;
