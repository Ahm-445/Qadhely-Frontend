import { createAuthStyles } from "@/assets/styles/auth.styles";
import { Text, View } from "react-native";
import { useTheme } from "../hooks/useTheme";

import { Ionicons } from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";

function RegisterHeader() {

	const {colors} = useTheme();

	const authStyles = createAuthStyles(colors);


	return (
		<View style={authStyles.header}>

			<View style={authStyles.titleContainer}>

				<LinearGradient colors={colors.gradients.primary} style={authStyles.iconContainer}>
					<Ionicons name="person-add-outline" size={28} color="#ffffff" />
				</LinearGradient>

				<View style={authStyles.titleTextContainer}>
					<Text style={authStyles.title}>Register</Text>
				</View>

			</View>

		</View>
	);

}

export default RegisterHeader;
