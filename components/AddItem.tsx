import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackButton from "./BackButton";
import { useGroup } from "../hooks/useGroup";
import { useTheme } from "../hooks/useTheme";


// US 07 — the "Add items" tab, shown to the Group Creator and admins only.
// Template: the search bar that finds items to add to the list goes here.

function AddItem() {

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
						Add items{name ? ` · ${name}` : ""}
					</Text>

					<Text style={groupsStyles.sectionEmpty}>
						The search bar for finding items to add will live here.
					</Text>

				</View>

			</SafeAreaView>

		</LinearGradient>
	);

}


export default AddItem;
