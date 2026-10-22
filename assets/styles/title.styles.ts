import { StyleSheet } from "react-native";
import { ColorScheme } from "../../hooks/useTheme";

export const createTitleStyles = (colors: ColorScheme) => {
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
			paddingBottom: 20,
		},
		titleContainer: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			marginBottom: 20,
			backgroundColor: "grey",
			borderRadius: 16,
			height: 70,
		},
		iconContainer: {
			width: 56,
			height: 56,
			borderRadius: 16,
			justifyContent: "center",
			alignItems: "center",
			marginRight: 16,
		},
		titleTextContainer: {
			flex: 0.6,
		},
		title: {
			fontSize: 32,
			fontWeight: "700",
			letterSpacing: -1,
			marginBottom: 4,
			color: colors.text,
		},
		
		
	});

	return styles;
};