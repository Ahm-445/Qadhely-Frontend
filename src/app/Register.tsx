import { createAuthStyles } from "@/assets/styles/auth.styles";
import { StatusBar } from "react-native";
import { useTheme } from "../../hooks/useTheme";

import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import BackButton from "../../components/BackButton";
import Header from "../../components/Header";


function Register() {
	
	const {colors} = useTheme();

	const loginStyles = createAuthStyles(colors);

	return (
		<LinearGradient 
			colors={colors.gradients.background} 
			style={loginStyles.container}
		>

			<StatusBar barStyle={colors.statusBarStyle}/>

			<SafeAreaView style={loginStyles.safeArea}>

				<Header />

				<BackButton />

				

			</SafeAreaView>

		</LinearGradient>
		
		
	)

}



export default Register;