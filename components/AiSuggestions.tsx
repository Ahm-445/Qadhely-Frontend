import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackButton from "./BackButton";
import { useGroup } from "../hooks/useGroup";
import { useTheme } from "../hooks/useTheme";


// US 07 — the "AI suggestions" tab, shown to the Group Creator and admins only.
// Template: the suggested items for this list go here.

function AiSuggestions() {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	const { name } = useGroup();


	return (
		<LinearGradient colors={colors.gradients.background} style={groupsStyles.container}>

			<StatusBar barStyle={colors.statusBarStyle} />

			<SafeAreaView edges={["top", "left", "right"]} style={groupsStyles.safeArea}>

				<BackButton />

				<View style={groupsStyles.groupDetails}>

					<Text style={groupsStyles.sectionTitle} numberOfLines={2}>
						AI suggestions{name ? ` · ${name}` : ""}
					</Text>

					<Text style={groupsStyles.sectionEmpty}>
						Suggested items for this list will appear here.
					</Text>

				</View>

			</SafeAreaView>

		</LinearGradient>
	);

}


export default AiSuggestions;
