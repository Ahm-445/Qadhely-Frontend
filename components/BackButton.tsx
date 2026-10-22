import { createHomeStyles } from "@/assets/styles/home.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../hooks/useTheme";



function BackButton() {

	const {colors} = useTheme();

	const homeStyles = createHomeStyles(colors);

	return (
		<View style={homeStyles.backButtonContainer}>
			
			<TouchableOpacity 
				style={homeStyles.backButton}
				activeOpacity={0.8} 
				onPress={router.back}
			>

				<Ionicons name="chevron-back-outline" size={20} color={"#ffffff"} />

				<Text style={homeStyles.backButtonText}>
					Back
				</Text>	
				
			</TouchableOpacity>
		</View>
	)

}

export default BackButton;