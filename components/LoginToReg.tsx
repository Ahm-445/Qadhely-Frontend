import { createAuthStyles } from "@/assets/styles/auth.styles";
import Ionicons from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { Text, View } from "react-native";
import { useTheme } from "../hooks/useTheme";


function LoginToReg() {

	const {colors} = useTheme();

	const authStyles = createAuthStyles(colors);


	return (
		<View style={authStyles.loginToRegSection}>

			<Text style={authStyles.subtitle}>
				Don't have an account?
			</Text>

			<Link href="/Register">

			

				<LinearGradient 
					colors={colors.gradients.primary}
					style={authStyles.loginToRegButton}	
					start={{x: 0, y: 0}}
					end={{x: 1, y: 1}}
				>
											
					<Ionicons name="checkmark-circle-outline" size={24} color="#ffffff" />
							
					<Text style={authStyles.loginToRegText}>
						Register
					</Text>
					
				</LinearGradient>

					

				
			</Link>

		</View>
		
	);

}

export default LoginToReg;