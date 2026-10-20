import { createTitleStyles } from "@/assets/styles/title.styles";
import { Text, View } from "react-native";
import { useTheme } from "../hooks/useTheme";

import { Ionicons } from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";

function Header() {

	const {colors} = useTheme();

	const loginStyles = createTitleStyles(colors);


	return (
		<View style={loginStyles.header}>

			<LinearGradient colors={colors.gradients.surface} style={loginStyles.titleContainer}>

				<LinearGradient colors={colors.gradients.primary} style={loginStyles.iconContainer}>
					<Ionicons name="cart-outline" size={28} color="#ffffff" />
				</LinearGradient>

				<View style={loginStyles.titleTextContainer}>
					<Text style={loginStyles.title}>Qadhely</Text>
				</View>
				

			</LinearGradient>

		</View>
		
	);

}

export default Header;