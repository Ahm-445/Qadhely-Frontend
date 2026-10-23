import { useRef, useState } from "react";

import { createAuthStyles } from "@/assets/styles/auth.styles";
import Ionicons from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { useTheme } from "../hooks/useTheme";
import { SAUDI_PHONE_REGEX } from "../utils/constants";

interface RegisterInputProps {
	setFinalName: (name: string) => void
	setFinalPhone: (phone: string) => void
	sendOtp: () => void
}

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 50;
// Provisional UI rule: letters (Arabic/English), marks, digits, separated by spaces or common name punctuation
const NAME_REGEX = /^[\p{L}\p{M}\p{N}]+(?:[ '’.\-_]+[\p{L}\p{M}\p{N}]+)*\.?$/u;

const DEFAULT_ERRORS = {invalidName: false, invalidPhone: false};

const RegisterInput: React.FC<RegisterInputProps> = ({setFinalName, setFinalPhone, sendOtp}) => {

	const {colors} = useTheme();
	const authStyles = createAuthStyles(colors);

	const [name, setName] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [errors, setErrors] = useState(DEFAULT_ERRORS);

	const phoneInputRef = useRef<TextInput>(null);

	const canSubmit = name.trim() !== "" && phoneNumber.trim() !== "";


	const handleNameChange = (value: string) => {
		setName(value);
		if (errors.invalidName) setErrors({...errors, invalidName: false});
	}


	const handleNumberChange = (num: string) => {
		// Remove any character that is not a digit (0-9)
		setPhoneNumber(num.replace(/[^0-9]/g, ''));
		if (errors.invalidPhone) setErrors({...errors, invalidPhone: false});
	}


	const validateInputs = () => {

		const trimmedName = name.trim().replace(/\s+/g, " ");

		return {
			invalidName: trimmedName.length < NAME_MIN_LENGTH
				|| trimmedName.length > NAME_MAX_LENGTH
				|| !NAME_REGEX.test(trimmedName),
			invalidPhone: !SAUDI_PHONE_REGEX.test(phoneNumber),
		};
	}


	const handleRegister = () => {

		const errs = validateInputs();

		setErrors(errs);

		if (!errs.invalidName && !errs.invalidPhone) {

			setFinalName(name.trim().replace(/\s+/g, " "));
			setFinalPhone(phoneNumber);
			sendOtp();
		}

	}


	return (
		<View style={authStyles.inputSection}>

			<View style={authStyles.inputWrapper}>

				<TextInput
					style={authStyles.input}
					placeholder="Name"
					value={name}
					autoCapitalize="words"
					autoComplete="name"
					maxLength={NAME_MAX_LENGTH}
					onChangeText={handleNameChange}
					returnKeyType="next"
					submitBehavior="submit"
					onSubmitEditing={() => phoneInputRef.current?.focus()}
					placeholderTextColor={colors.textMuted}
				/>

				{/* Spacer matching the Register button so both inputs have the same width */}
				<View style={authStyles.loginButton} />

			</View>

			<View style={authStyles.inputWrapper}>

				<TextInput
					ref={phoneInputRef}
					style={authStyles.input}
					placeholder="Phone Number"
					value={phoneNumber}
					keyboardType="number-pad"
					onChangeText={handleNumberChange}
					onSubmitEditing={handleRegister}
					placeholderTextColor={colors.textMuted}
				/>

				<TouchableOpacity
					onPress={handleRegister}
					activeOpacity={0.8}
					disabled={!canSubmit}
				>
					<LinearGradient
						colors={canSubmit ? colors.gradients.primary : colors.gradients.muted}
						style={[authStyles.loginButton, !canSubmit && authStyles.loginButtonDisabled]}
					>

						<Ionicons name="person-add-outline" size={24} color="#ffffff" />
						<Text style={{color:"#ffffff"}}>Register</Text>

					</LinearGradient>
				</TouchableOpacity>

			</View>

			<View>

				{errors.invalidName &&
					<View>
						<Text style={authStyles.invalidInputText}>
							The name entered is not valid.
						</Text>
						<Text style={authStyles.subtitle}>
							Use {NAME_MIN_LENGTH}-{NAME_MAX_LENGTH} characters: letters, digits, spaces, and . - &apos; _
						</Text>
					</View>
				}

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


export default RegisterInput;
