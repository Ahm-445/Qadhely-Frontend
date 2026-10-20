import { createAuthStyles } from "@/assets/styles/auth.styles";
import { StatusBar } from "react-native";
import { useTheme } from "../../hooks/useTheme";

import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../../components/Header";
import LoginHeader from "../../components/LoginHeader";
import LoginInput from "../../components/LoginInput";
import LoginToReg from "../../components/LoginToReg";
import OtpScreen from "../../components/OTPScreen";

import { useState } from "react";

function Login() {
	
	const {colors} = useTheme();

	const loginStyles = createAuthStyles(colors);

	const [isOtpSent, setIsOtpSent] = useState(false);
  	const [phoneNumber, setPhoneNumber] = useState("");
	

  	const handleSendOtp = () => {
    	// Trigger your API call to send OTP here
   		setIsOtpSent(true);
  	};

  	const handleVerifyOtp = (otp: string) => {
    	console.log('Entered OTP:', otp);
    	// Verify OTP with your backend
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
					onResend={() => {}} // enabled only after 60s
					onVerify={() => {}}
				/>


			</SafeAreaView>

		</LinearGradient>
		
		
	)

}



export default Login;