import { createHomeStyles } from "@/assets/styles/home.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Href, router } from 'expo-router';
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../hooks/useTheme";



interface BackButtonProps {
	/** Where to go when there is no previous route (e.g. screen opened directly) */
	fallbackHref?: Href
}

function BackButton({fallbackHref}: BackButtonProps) {

	const {colors} = useTheme();

	const homeStyles = createHomeStyles(colors);

	return (
		<View style={homeStyles.backButtonContainer}>
			
			<TouchableOpacity 
				style={homeStyles.backButton}
				activeOpacity={0.8} 
				onPress={() => {
					if (fallbackHref && !router.canGoBack()) {
						router.replace(fallbackHref);
					} else {
						router.back();
					}
				}}
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