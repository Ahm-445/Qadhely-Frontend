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

		/* ----------------------------- group members (US 30) ----------------------------- */
		membersButton: {
			flexDirection: "row",
			alignItems: "center",
			alignSelf: "flex-start",
			gap: 8,
			marginTop: 4,
			paddingVertical: 10,
			paddingHorizontal: 16,
			borderRadius: 14,
			borderWidth: 1.5,
			borderColor: colors.primary,
		},
		membersButtonText: {
			fontSize: 15,
			fontWeight: "600",
			color: colors.primary,
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
	});

	return styles;
};
