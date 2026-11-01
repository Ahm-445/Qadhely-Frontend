import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useGroup } from "../hooks/useGroup";
import { useTheme } from "../hooks/useTheme";
import BackButton from "./BackButton";


// US 12 — the "Add items" tab, shown to the Group Creator and admins only.
// Template: the search bar that finds items to add to the list goes here, and every result row
// opens the Add Item screen by handing its catalog id to onPickItem.

interface AddItemProps {
	/** The user picked an item from the search results. */
	onPickItem: (itemId: string) => void
}


function AddItem({ onPickItem }: AddItemProps) {

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
					{/* Remove once searchbar is implemented */}
					<Text style={groupsStyles.sectionEmpty}>
						The search bar for finding items to add will live here.
					</Text>

					{/* Stands in for the search bar's first result: tapping it does exactly what tapping a
					    real result will do. Remove it when the search bar lands. (comment out once the search bar is implemented) */}
					<TouchableOpacity
						style={groupsStyles.simulateRow}
						activeOpacity={0.8}
						onPress={() => onPickItem("tamimi-137805")}
						accessibilityRole="button"
						accessibilityLabel="Pick the test item tamimi-137805"
					>
						<Ionicons name="flask-outline" size={18} color={colors.textMuted} />

						<Text style={groupsStyles.simulateText} numberOfLines={1}>
							Test item · tamimi-137805
						</Text>

						<Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
					</TouchableOpacity>

				</View>

			</SafeAreaView>

		</LinearGradient>
	);

}


export default AddItem;
