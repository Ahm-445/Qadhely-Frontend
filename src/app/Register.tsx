import { createAuthStyles } from "@/assets/styles/auth.styles";
import { StatusBar } from "react-native";
import { useTheme } from "../../hooks/useTheme";

import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import OtpScreen from "../../components/OTPScreen";
import RegisterHeader from "../../components/RegisterHeader";
import RegisterInput from "../../components/RegisterInput";

import { useState } from "react";


function Register() {
	
	const {colors} = useTheme();

	const loginStyles = createAuthStyles(colors);

	const [isOtpSent, setIsOtpSent] = useState(false);
	const [, setName] = useState(""); // kept for the registration request once the API exists
	const [phoneNumber, setPhoneNumber] = useState("");

	const handleSendOtp = () => {
		// UI only: OTP sending is not wired to a backend yet
		setIsOtpSent(true);
	};

	const handleVerifyOtp = async () => {
		// Never report success until registration is connected to the backend
		throw new Error("Registration is not available yet.");
	};

	return (
		<LinearGradient 
			colors={colors.gradients.background} 
			style={loginStyles.container}
		>

			<StatusBar barStyle={colors.statusBarStyle}/>

			<SafeAreaView style={loginStyles.safeArea}>

				<Header />

				<BackButton fallbackHref="/Login" />

				<RegisterHeader />

				<RegisterInput 
					setFinalName={setName} 
					setFinalPhone={setPhoneNumber} 
					sendOtp={handleSendOtp}
				/>

				<OtpScreen
					visible={isOtpSent}
					destination={phoneNumber}
					onClose={() => setIsOtpSent(false)}
					onResend={() => {}} // enabled only after 60s
					onVerify={handleVerifyOtp}
				/>

			</SafeAreaView>

		</LinearGradient>
	)

}



export default Register;
