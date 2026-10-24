import { createAuthStyles } from "@/assets/styles/auth.styles";
import { Alert, StatusBar } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../../components/Header";
import LoginHeader from "../../components/LoginHeader";
import LoginInput from "../../components/LoginInput";
import LoginToReg from "../../components/LoginToReg";
import OtpScreen from "../../components/OTPScreen";

import { router } from "expo-router";
import { useState } from "react";

function Login() {
	
	const {colors} = useTheme();
	const {checkPhoneLogin, login} = useAuth();

	const loginStyles = createAuthStyles(colors);

	const [isOtpSent, setIsOtpSent] = useState(false);
  	const [phoneNumber, setPhoneNumber] = useState("");
	

  	// Ask the backend to send an OTP; open the code sheet only if it worked.
  	const handleSendOtp = async (phone: string) => {
		setPhoneNumber(phone);

		const result = await checkPhoneLogin(phone);

		if (result?.success) {
			setIsOtpSent(true);
		} else {
			Alert.alert("Error", result?.error ?? "Could not send the verification code.");
		}
  	};

	// Resend from inside the OTP sheet. Throwing shows the error there.
	const handleResendOtp = async () => {
		const result = await checkPhoneLogin(phoneNumber);

		if (!result?.success) {
			throw new Error(result?.error ?? "Could not resend the code.");
		}
	};

	// Check the code with the backend. Throwing makes OtpScreen show the error and shake.
  	const handleVerifyOtp = async (otp: string) => {
		const result = await login(phoneNumber, otp);

		if (!result?.success) {
			throw new Error(result?.error ?? "Invalid code. Please try again.");
		}

		setIsOtpSent(false);
		router.replace("/Home");
  	};


	return (
		<LinearGradient 
			colors={colors.gradients.background} 
			style={loginStyles.container}
		>

			<StatusBar barStyle={colors.statusBarStyle}/>

			<SafeAreaView style={loginStyles.safeArea}>

				<Header />

				<LoginHeader />

				<LoginInput setFinalPhone={setPhoneNumber}  sendOtp={handleSendOtp}/>
				
				<LoginToReg />

				<OtpScreen
					visible={isOtpSent}
					destination={phoneNumber}
					onClose={() => setIsOtpSent(false)}
					onResend={handleResendOtp} // enabled only after 60s
					onVerify={handleVerifyOtp}
				/>


			</SafeAreaView>

		</LinearGradient>
		
		
	)

}



export default Login;