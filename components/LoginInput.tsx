import { useState } from "react";

import { createAuthStyles } from "@/assets/styles/auth.styles";
import Ionicons from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { useTheme } from "../hooks/useTheme";
import { SAUDI_PHONE_REGEX } from "../utils/constants";

interface LoginInputProps {
	setFinalPhone: (phone: string) => void
	sendOtp: (phone: string) => void
}


const DEFAULT_ERRORS = {invalidPhone: false};

const LoginInput: React.FC<LoginInputProps> = ({setFinalPhone, sendOtp}) =>  {

	const {colors} = useTheme();
	const authStyles = createAuthStyles(colors);

	const [phoneNumber, setPhoneNumber] = useState("");
	const [errors, setErrors] = useState(DEFAULT_ERRORS);
	
	
	const handleNumberChange = (num:string) => {
		// Remove any character that is not a digit (0-9)
    	const cleanedNum = num.replace(/[^0-9]/g, '');
    	setPhoneNumber(cleanedNum);
	}

	
	const validatePhoneNumber = () => {

		const errs = {invalidPhone: false}

		if (!SAUDI_PHONE_REGEX.test(phoneNumber) && phoneNumber.trim() ) {
			errs.invalidPhone = true;
		} 

		return errs;
	}


	const handleLogin =  async () => {
		
		const errs = validatePhoneNumber();

		setErrors(errs);
		
		
		if (!errs.invalidPhone && phoneNumber.trim()) {

			setFinalPhone(phoneNumber);
			sendOtp(phoneNumber);

			setPhoneNumber("");
		}

	}


	return (
		<View style={authStyles.inputSection}>
			
			<View style={authStyles.inputWrapper}>

				<TextInput 
					style={authStyles.input}
					placeholder="Phone Number"
					value={phoneNumber}
					keyboardType="number-pad"
					onChangeText={handleNumberChange} // onChangeText directly passes the string instead of an event object
					onSubmitEditing={handleLogin}
					placeholderTextColor={colors.textMuted}
				/>

				<TouchableOpacity 
					onPress={handleLogin} 
					activeOpacity={0.8} 
					disabled={!phoneNumber.trim()}
				>
					<LinearGradient 
						colors={phoneNumber.trim() ? colors.gradients.blue : colors.gradients.muted}
						style={[authStyles.loginButton, !phoneNumber.trim() && authStyles.loginButtonDisabled]}	
					>
						
						<Ionicons name="log-in-outline" size={24} color="#ffffff" />
						<Text style={{color:"#ffffff"}} >Login</Text>

					</LinearGradient>


				</TouchableOpacity>
			
			</View>

			<View style={authStyles.invalidInputWrapper}>

				{errors.invalidPhone && 
					<View>
						<Text style={authStyles.invalidInputText}>
							The phone number entered is not a valid Saudi phone number.
						</Text>
						<Text style={authStyles.subtitle}>
							Check if you entered your number correctly.
						</Text>
					</View>
					
				}

			</View>

		</View>
	)

}


export default LoginInput;