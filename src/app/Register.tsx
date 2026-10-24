import { createAuthStyles } from "@/assets/styles/auth.styles";
import { router } from "expo-router";
import { StatusBar } from "react-native";
import { useAuth } from "../../hooks/useAuth";
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
	const {checkPhoneRegister, register} = useAuth();

	const loginStyles = createAuthStyles(colors);

	const [isOtpSent, setIsOtpSent] = useState(false);
	const [name, setName] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");

	// Sends the OTP and opens the modal only if the backend confirms it was sent.
	// Resolves to an error message to show in the form, or null on success.
	const handleSendOtp = async (finalName: string, finalPhone: string) => {

		const result = await checkPhoneRegister(finalName, finalPhone);

		if (!result?.success) {
			return result?.error ?? "Could not send the verification code.";
		}

		setIsOtpSent(true);
		return null;
	};

	// The backend has no separate resend route: sending again re-calls register.
	// A thrown error is shown by the OTP modal.
	const handleResendOtp = async () => {

		const result = await checkPhoneRegister(name, phoneNumber);

		if (!result?.success) {
			throw new Error(result?.error ?? "Could not resend the code.");
		}
	};

	// A thrown error is shown by the OTP modal (wrong code, expired, too many attempts...).
	const handleVerifyOtp = async (otp: string) => {

		const result = await register(phoneNumber, otp);

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
					onResend={handleResendOtp} // enabled only after 60s
					onVerify={handleVerifyOtp}
				/>

			</SafeAreaView>

		</LinearGradient>
	)

}



export default Register;
