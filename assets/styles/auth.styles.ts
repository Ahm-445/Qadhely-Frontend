import { StyleSheet } from "react-native";
import { ColorScheme } from "../../hooks/useTheme";

export const createAuthStyles = (colors: ColorScheme) => {
  const styles = StyleSheet.create({
		container: {
			flex: 1,
		},
		safeArea: {
			flex: 1,
		},
		header: {
			paddingHorizontal: 24,
			paddingVertical: 32,
			paddingBottom: 8,
		},
		titleContainer: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			marginBottom: 20,
			
		},
		iconContainer: {
			width: 50,
			height: 50,
			borderRadius: 14,
			justifyContent: "center",
			alignItems: "center",
			marginRight: 16,
		},
		titleTextContainer: {
			flex: 1,
		},
		title: {
			fontSize: 26,
			fontWeight: "400",
			marginBottom: 4,
			color: colors.text,
		},
		subtitle: {
			fontSize: 17,
			fontWeight: "500",
			color: colors.textMuted,
		},
		inputSection: {
			paddingHorizontal: 12,
			paddingBottom: 12,
			marginBottom: 150
		},
		inputWrapper: {
			flexDirection: "row",
			alignItems: "flex-end",
			gap: 8,
			paddingBottom: 15,
		},
		invalidInputWrapper: {
			flexDirection: "row",
			alignItems: "center",
		},
		invalidInputText: {
			fontSize: 17,
			fontWeight: "500",
			color: colors.danger,
		},
		input: {
			flex: 1,
			borderWidth: 2,
			borderRadius: 20,
			paddingHorizontal: 20,
			paddingVertical: 16,
			fontSize: 17,
			maxHeight: 120,
			fontWeight: "500",
			backgroundColor: colors.backgrounds.input,
			borderColor: colors.border,
			color: colors.text,
		},
		inputFocused: {
			borderColor: colors.primary,
		},
		loginButton: {
			width: 80,
			height: 56,
			borderRadius: 28,
			justifyContent: "center",
			alignItems: "center",
		},
		loginButtonDisabled: {
			opacity: 0.5,
		},
		loginToRegSection: {
			paddingHorizontal: 12,
			paddingBottom: 12,
			justifyContent: "center",
			alignItems: "center",
		},
		loginToRegButton: {
			margin: 15,
			flexDirection: "row",
			width: 200,
			height: 56,
			borderRadius: 28,
			justifyContent: "center",
			alignItems: "center",
		},
		loginToRegText: {
			paddingLeft: 10,
			fontSize: 17,
			fontWeight: "500",
			color: "#ffffff",
		},
		registerButton: {
			width: 56,
			height: 56,
			borderRadius: 28,
			justifyContent: "center",
			alignItems: "center",
		},
		registerButtonDisabled: {
			opacity: 0.5,
		},

		
	});

	return styles;
};