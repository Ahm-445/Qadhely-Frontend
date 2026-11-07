import { StyleSheet } from "react-native";
import { ColorScheme } from "../../hooks/useTheme";

// US 05 — Home (groups) and Create Group screens
// US 07 — Group screen (the group selected on Home)

export const createGroupsStyles = (colors: ColorScheme) => {
	const styles = StyleSheet.create({
		container: {
			flex: 1,
		},
		safeArea: {
			flex: 1,
		},

		/* ------------------------------ page title ------------------------------ */
		pageHeader: {
			paddingHorizontal: 24,
			paddingBottom: 16,
			flexDirection: "row",
			alignItems: "center",
		},
		pageIconContainer: {
			width: 50,
			height: 50,
			borderRadius: 14,
			justifyContent: "center",
			alignItems: "center",
			marginRight: 16,
		},
		pageTitle: {
			fontSize: 26,
			fontWeight: "700",
			letterSpacing: -0.5,
			color: colors.text,
		},
		pageSubtitle: {
			fontSize: 15,
			fontWeight: "500",
			color: colors.textMuted,
		},

		/* ------------------------------- new list ------------------------------- */
		newListSection: {
			paddingHorizontal: 24,
			paddingBottom: 8,
		},
		newListButton: {
			flexDirection: "row",
			height: 56,
			borderRadius: 28,
			justifyContent: "center",
			alignItems: "center",
			gap: 10,
		},
		newListText: {
			fontSize: 17,
			fontWeight: "600",
			color: "#ffffff",
		},

		/* ------------------------------ group list ------------------------------ */
		listContent: {
			paddingHorizontal: 24,
			paddingBottom: 100,
		},
		sectionTitle: {
			fontSize: 20,
			fontWeight: "700",
			letterSpacing: -0.5,
			marginTop: 24,
			marginBottom: 8,
			color: colors.text,
		},
		sectionEmpty: {
			fontSize: 15,
			fontWeight: "500",
			color: colors.textMuted,
			marginBottom: 8,
		},
		groupCard: {
			flexDirection: "row",
			alignItems: "center",
			padding: 18,
			borderRadius: 20,
			marginVertical: 6,
			shadowColor: colors.shadow,
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.1,
			shadowRadius: 8,
			elevation: 8,
		},
		groupIcon: {
			width: 44,
			height: 44,
			borderRadius: 12,
			justifyContent: "center",
			alignItems: "center",
			marginRight: 14,
		},
		groupTextContainer: {
			flex: 1,
		},
		groupName: {
			fontSize: 17,
			fontWeight: "600",
			color: colors.text,
		},
		groupMeta: {
			fontSize: 14,
			fontWeight: "500",
			marginTop: 2,
			color: colors.textMuted,
		},

		/* ----------------------------- group details ---------------------------- */
		groupDetails: {
			paddingHorizontal: 24,
			paddingTop: 20,
		},

		/* ----------------------------- group header (US 30) ----------------------------- */
		groupHeader: {
			paddingHorizontal: 24,
			paddingTop: 12,
			paddingBottom: 4,
		},
		groupHeaderCard: {
			flexDirection: "row",
			alignItems: "center",
			borderRadius: 16,
			paddingVertical: 10,
			paddingHorizontal: 10,
			minHeight: 68,
		},
		groupHeaderBackButton: {
			width: 36,
			height: 36,
			borderRadius: 10,
			justifyContent: "center",
			alignItems: "center",
			marginRight: 8,
			backgroundColor: colors.backgrounds.input,
		},
		groupHeaderIcon: {
			width: 44,
			height: 44,
			borderRadius: 12,
			justifyContent: "center",
			alignItems: "center",
			marginRight: 12,
		},
		groupHeaderText: {
			flex: 1,
		},
		groupHeaderTitle: {
			fontSize: 22,
			fontWeight: "700",
			letterSpacing: -0.5,
			color: colors.text,
		},
		groupHeaderSubtitle: {
			fontSize: 14,
			fontWeight: "500",
			marginTop: 2,
			color: colors.textMuted,
		},
		groupHeaderMembersButton: {
			width: 40,
			height: 40,
			borderRadius: 20,
			borderWidth: 1.5,
			borderColor: colors.primary,
			justifyContent: "center",
			alignItems: "center",
			marginLeft: 8,
		},

		/* ----------------------------- group members (US 30) ----------------------------- */
		addMembersSection: {
			paddingHorizontal: 24,
			paddingTop: 16,
		},
		addMembersLabel: {
			fontSize: 15,
			fontWeight: "600",
			marginBottom: 10,
			color: colors.textMuted,
		},
		addMembersRow: {
			flexDirection: "row",
			gap: 10,
		},
		addMembersButton: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			gap: 8,
			paddingVertical: 11,
			borderRadius: 14,
			borderWidth: 1.5,
		},
		addMembersButtonText: {
			fontSize: 14,
			fontWeight: "600",
		},
		memberRow: {
			flexDirection: "row",
			alignItems: "center",
			padding: 14,
			borderRadius: 16,
			marginVertical: 5,
		},
		memberAvatar: {
			width: 40,
			height: 40,
			borderRadius: 20,
			justifyContent: "center",
			alignItems: "center",
			marginRight: 12,
		},
		memberAvatarText: {
			fontSize: 17,
			fontWeight: "700",
			color: "#ffffff",
		},
		memberTextContainer: {
			flex: 1,
		},
		memberName: {
			fontSize: 16,
			fontWeight: "600",
			color: colors.text,
		},
		memberSub: {
			fontSize: 13,
			fontWeight: "500",
			marginTop: 2,
			color: colors.textMuted,
		},
		roleBadge: {
			paddingVertical: 4,
			paddingHorizontal: 10,
			borderRadius: 10,
			borderWidth: 1,
		},
		roleBadgeText: {
			fontSize: 12,
			fontWeight: "700",
		},
		centerState: {
			alignItems: "center",
			paddingTop: 40,
			paddingHorizontal: 24,
			gap: 12,
		},
		retryButton: {
			paddingVertical: 10,
			paddingHorizontal: 20,
			borderRadius: 14,
			backgroundColor: colors.primary,
		},
		retryButtonText: {
			fontSize: 15,
			fontWeight: "600",
			color: "#ffffff",
		},

		/* ----------------------------- shopping list (US 14, US 15) ----------------------------- */
		listItemCard: {
			flexDirection: "row",
			alignItems: "center",
			padding: 12,
			borderRadius: 20,
			marginVertical: 6,
			shadowColor: colors.shadow,
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.1,
			shadowRadius: 8,
			elevation: 4,
		},
		listItemImage: {
			width: 72,
			height: 72,
			borderRadius: 14,
			marginRight: 12,
			borderWidth: 1,
			borderColor: colors.border,
			backgroundColor: colors.surface,
			overflow: "hidden",
		},
		listItemImageFill: {
			flex: 1,
		},
		listItemInfo: {
			flex: 1,
			marginRight: 8,
		},
		listItemName: {
			fontSize: 16,
			fontWeight: "600",
			color: colors.text,
		},
		listItemMeta: {
			fontSize: 14,
			fontWeight: "500",
			marginTop: 2,
			color: colors.textMuted,
		},
		listItemAdminActions: {
			flexDirection: "row",
			gap: 8,
			marginTop: 8,
		},
		listItemAdminButton: {
			width: 36,
			height: 36,
			borderRadius: 18,
			borderWidth: 1,
			borderColor: colors.border,
			justifyContent: "center",
			alignItems: "center",
		},
		listItemStatusActions: {
			flexDirection: "row",
			gap: 8,
		},
		listItemStatusButton: {
			width: 44,
			height: 44,
			borderRadius: 14,
			borderWidth: 1.5,
			borderColor: colors.border,
			justifyContent: "center",
			alignItems: "center",
		},
		modalBackdrop: {
			flex: 1,
			justifyContent: "center",
			padding: 24,
			backgroundColor: "rgba(0,0,0,0.5)",
		},
		modalCard: {
			padding: 24,
			borderRadius: 20,
			backgroundColor: colors.surface,
		},
		unitOptions: {
			flexDirection: "row",
			gap: 8,
			marginBottom: 16,
		},
		unitOption: {
			flex: 1,
			alignItems: "center",
			paddingVertical: 12,
			borderRadius: 14,
			borderWidth: 1.5,
			borderColor: colors.border,
		},
		unitOptionSelected: {
			borderColor: colors.primary,
			backgroundColor: colors.primary,
		},
		unitOptionText: {
			fontSize: 15,
			fontWeight: "600",
			color: colors.text,
		},
		unitOptionTextSelected: {
			color: "#ffffff",
		},
		modalError: {
			fontSize: 15,
			fontWeight: "500",
			color: colors.danger,
			marginBottom: 12,
		},
		modalActions: {
			flexDirection: "row",
			gap: 8,
		},
		modalButton: {
			flex: 1,
			alignItems: "center",
			paddingVertical: 14,
			borderRadius: 14,
			borderWidth: 1.5,
			borderColor: colors.border,
		},
		modalButtonPrimary: {
			borderColor: colors.primary,
			backgroundColor: colors.primary,
		},
		modalButtonText: {
			fontSize: 16,
			fontWeight: "600",
			color: colors.text,
		},
		modalButtonPrimaryText: {
			color: "#ffffff",
		},

		/* ----------------------------- create group ----------------------------- */
		formSection: {
			paddingHorizontal: 24,
			paddingTop: 20,
		},
		label: {
			fontSize: 17,
			fontWeight: "600",
			marginBottom: 10,
			color: colors.text,
		},
		input: {
			borderWidth: 2,
			borderRadius: 20,
			paddingHorizontal: 20,
			paddingVertical: 16,
			fontSize: 17,
			fontWeight: "500",
			marginBottom: 24,
			backgroundColor: colors.backgrounds.input,
			borderColor: colors.border,
			color: colors.text,
		},
		inputFocused: {
			borderColor: colors.primary,
		},
		membersHeader: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
		},
		counter: {
			fontSize: 15,
			fontWeight: "600",
			marginBottom: 10,
			color: colors.textMuted,
		},
		contactList: {
			flex: 1,
		},
		contactListContent: {
			paddingHorizontal: 24,
			paddingBottom: 24,
		},
		contactRow: {
			flexDirection: "row",
			alignItems: "center",
			paddingVertical: 14,
			borderBottomWidth: 1,
			borderBottomColor: colors.border,
		},
		checkboxInner: {
			width: 28,
			height: 28,
			borderRadius: 14,
			borderWidth: 2,
			justifyContent: "center",
			alignItems: "center",
			marginRight: 14,
			borderColor: colors.border,
		},
		contactName: {
			fontSize: 17,
			fontWeight: "500",
			color: colors.text,
		},
		contactSub: {
			fontSize: 14,
			color: colors.textMuted,
		},
		note: {
			fontSize: 15,
			fontWeight: "500",
			lineHeight: 22,
			marginTop: 8,
			color: colors.textMuted,
		},
		errorText: {
			fontSize: 15,
			fontWeight: "500",
			color: colors.danger,
			paddingHorizontal: 24,
			marginBottom: 8,
		},
		footer: {
			paddingHorizontal: 24,
			paddingVertical: 12,
		},
		createButton: {
			flexDirection: "row",
			height: 56,
			borderRadius: 28,
			justifyContent: "center",
			alignItems: "center",
			gap: 10,
		},
		createButtonDisabled: {
			opacity: 0.5,
		},
		createButtonText: {
			fontSize: 17,
			fontWeight: "600",
			color: "#ffffff",
		},

		/* ----------------------------- add item (US 12) ----------------------------- */
		itemCard: {
			flexDirection: "row",
			alignItems: "center",
			padding: 16,
			borderRadius: 20,
			marginTop: 4,
		},
		itemImageWrap: {
			width: 84,
			height: 84,
			borderRadius: 16,
			overflow: "hidden",
			alignItems: "center",
			justifyContent: "center",
			marginRight: 16,
		},
		itemImage: {
			width: "100%",
			height: "100%",
		},
		itemTextContainer: {
			flex: 1,
		},
		itemBrand: {
			fontSize: 13,
			fontWeight: "700",
			letterSpacing: 0.6,
			textTransform: "uppercase",
			color: colors.primary,
		},
		itemName: {
			fontSize: 17,
			fontWeight: "600",
			lineHeight: 23,
			marginTop: 4,
			color: colors.text,
		},
		itemSize: {
			fontSize: 14,
			fontWeight: "500",
			marginTop: 4,
			color: colors.textMuted,
		},
		itemStore: {
			flexDirection: "row",
			alignItems: "center",
			gap: 6,
			marginTop: 8,
		},
		itemStoreText: {
			fontSize: 13,
			fontWeight: "600",
			color: colors.textMuted,
		},
		quantityRow: {
			flexDirection: "row",
			alignItems: "flex-start",
			gap: 12,
		},
		quantityField: {
			flex: 1,
		},
		quantityInput: {
			marginBottom: 0,
		},
		quantityInputInvalid: {
			borderColor: colors.danger,
		},
		unitSelect: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			gap: 10,
			minWidth: 124,
			height: 56,
			paddingHorizontal: 18,
			borderWidth: 2,
			borderRadius: 20,
			backgroundColor: colors.backgrounds.input,
			borderColor: colors.border,
		},
		unitSelectText: {
			fontSize: 17,
			fontWeight: "600",
			color: colors.text,
		},
		fieldHint: {
			fontSize: 14,
			fontWeight: "500",
			marginTop: 10,
			color: colors.textMuted,
		},
		fieldError: {
			fontSize: 14,
			fontWeight: "500",
			marginTop: 10,
			color: colors.danger,
		},
		missingCard: {
			padding: 20,
			borderRadius: 20,
			marginTop: 12,
		},
		missingTitle: {
			fontSize: 17,
			fontWeight: "700",
			color: colors.text,
		},
		missingText: {
			fontSize: 15,
			fontWeight: "500",
			lineHeight: 22,
			marginTop: 6,
			color: colors.textMuted,
		},
		sheetBackdrop: {
			flex: 1,
			justifyContent: "flex-end",
			backgroundColor: "rgba(15, 23, 42, 0.55)",
		},
		sheet: {
			paddingHorizontal: 24,
			paddingTop: 12,
			paddingBottom: 32,
			borderTopLeftRadius: 28,
			borderTopRightRadius: 28,
		},
		sheetHandle: {
			alignSelf: "center",
			width: 44,
			height: 5,
			borderRadius: 3,
			marginBottom: 18,
			backgroundColor: colors.border,
		},
		sheetTitle: {
			fontSize: 18,
			fontWeight: "700",
			marginBottom: 8,
			color: colors.text,
		},
		sheetOption: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingVertical: 16,
			borderBottomWidth: 1,
			borderBottomColor: colors.border,
		},
		sheetOptionText: {
			fontSize: 17,
			fontWeight: "500",
			color: colors.text,
		},
		sheetOptionTextSelected: {
			fontWeight: "700",
			color: colors.primary,
		},
		/* ------------------------ catalog search (Add items tab) ------------------------ */
		searchSection: {
			paddingHorizontal: 24,
			paddingTop: 4,
		},
		searchBar: {
			flexDirection: "row",
			alignItems: "center",
			gap: 10,
			borderWidth: 2,
			borderRadius: 20,
			paddingHorizontal: 16,
			marginTop: 8,
			backgroundColor: colors.backgrounds.input,
			borderColor: colors.border,
		},
		searchBarFocused: {
			borderColor: colors.primary,
		},
		searchInput: {
			flex: 1,
			paddingVertical: 14,
			fontSize: 17,
			fontWeight: "500",
			color: colors.text,
		},
		searchMessage: {
			paddingHorizontal: 24,
			paddingTop: 16,
		},
		resultsList: {
			flex: 1,
			marginTop: 12,
		},
		resultsContent: {
			paddingHorizontal: 24,
			paddingBottom: 32,
		},
		resultSeparator: {
			height: 12,
		},
		resultsFooter: {
			paddingVertical: 20,
			alignItems: "center",
		},
		resultImageWrap: {
			width: 68,
			height: 68,
			marginRight: 14,
		},
	});

	return styles;
};
