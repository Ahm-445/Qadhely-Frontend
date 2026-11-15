import { createHomeStyles } from "@/assets/styles/home.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Modal, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";

import OtpScreen from "./OTPScreen";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { confirmDeleteAccount, requestDeleteAccountOtp } from "../services/accountApi";


// US 04 — Delete Account
// 1. A warning the user must accept: deleting is permanent (SF-14).
// 2. A WhatsApp code is sent and the OTP sheet opens with its 60-second countdown (AC-01).
// 3. A wrong code shows an error and the user can type it again (AC-03).
// 4. The right code deletes the account on the server; the app then logs out and shows Login (AC-02).

interface DeleteAccountFlowProps {
	visible: boolean
	onClose: () => void
}


function DeleteAccountFlow({ visible, onClose }: DeleteAccountFlowProps) {

	const { colors } = useTheme();
	const homeStyles = createHomeStyles(colors);

	const { user, logout } = useAuth();
	const token: string | undefined = user?.token ?? user?.jwt;

	const [acknowledged, setAcknowledged] = useState(false);
	const [sending, setSending] = useState(false);
	const [error, setError] = useState("");
	const [otpOpen, setOtpOpen] = useState(false);


	// closing the warning resets it, so it starts fresh the next time it opens
	const closeWarning = () => {
		setAcknowledged(false);
		setError("");
		onClose();
	};


	const sendCode = async () => {
		if (!token) throw new Error("You are not logged in.");
		await requestDeleteAccountOtp(token);
	};


	// step 2: after the warning is accepted, send the code and open the OTP sheet
	const handleContinue = async () => {
		setSending(true);
		setError("");
		try {
			await sendCode();
			closeWarning();
			setOtpOpen(true);
		}
		catch (e) {
			setError(e instanceof Error ? e.message : "Could not send the verification code.");
		}
		finally {
			setSending(false);
		}
	};


	// step 3 / 4: a thrown error is shown by the OTP sheet (wrong code, expired, too many attempts)
	const handleVerify = async (otp: string) => {

		if (!/^(\d{4}|\d{6})$/.test(otp)) {
			throw new Error("Enter the 4 or 6-digit code.");
		}

		if (!token) throw new Error("You are not logged in.");

		await confirmDeleteAccount(token, otp);

		setOtpOpen(false);

		// the account and its push tokens are gone on the server; clear this phone's session too
		await logout().catch(() => {});
		router.replace("/Login");

		const message = "Your account has been deleted.";
		if (Platform.OS === "web") window.alert(message);
		else Alert.alert("Account deleted", message);
	};


	return (
		<>

			<Modal visible={visible} transparent animationType="fade" onRequestClose={sending ? undefined : closeWarning}>

				<Pressable style={homeStyles.deleteBackdrop} onPress={sending ? undefined : closeWarning}>

					<Pressable style={homeStyles.deleteCard} onPress={() => {}}>

						<View style={homeStyles.deleteIcon}>
							<Ionicons name="warning-outline" size={28} color={colors.danger} />
						</View>

						<Text style={homeStyles.deleteTitle}>Delete your account?</Text>

						<Text style={homeStyles.deleteText}>
							This permanently deletes your account. You will be removed from all your groups, and groups where you are the only admin will be deleted with their lists. This can&apos;t be undone.
						</Text>

						<TouchableOpacity
							style={homeStyles.deleteAckRow}
							activeOpacity={0.8}
							onPress={() => setAcknowledged((v) => !v)}
							accessibilityRole="checkbox"
							accessibilityState={{ checked: acknowledged }}
						>
							<Ionicons
								name={acknowledged ? "checkbox" : "square-outline"}
								size={22}
								color={acknowledged ? colors.danger : colors.textMuted}
							/>
							<Text style={homeStyles.deleteAckText}>I understand this action is irreversible</Text>
						</TouchableOpacity>

						{!!error && <Text style={homeStyles.deleteError}>{error}</Text>}

						<View style={homeStyles.deleteButtons}>

							<TouchableOpacity
								style={[homeStyles.deleteButton, homeStyles.deleteCancelButton]}
								activeOpacity={0.8}
								disabled={sending}
								onPress={closeWarning}
							>
								<Text style={homeStyles.deleteCancelText}>Cancel</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[homeStyles.deleteButton, homeStyles.deleteConfirmButton, (!acknowledged || sending) && homeStyles.deleteButtonDisabled]}
								activeOpacity={0.8}
								disabled={!acknowledged || sending}
								onPress={handleContinue}
							>
								{sending
									? <ActivityIndicator color="#ffffff" />
									: <Text style={homeStyles.deleteConfirmText}>Delete account</Text>}
							</TouchableOpacity>

						</View>

					</Pressable>

				</Pressable>

			</Modal>

			<OtpScreen
				visible={otpOpen}
				destination={user?.phoneNumber}
				length={6} // input cells; the code may have 4 or 6 digits
				allowedLengths={[4, 6]}
				autoSubmit={false}
				onClose={() => setOtpOpen(false)}
				onResend={sendCode} // enabled only after 60s
				onVerify={handleVerify}
			/>

		</>
	);

}


export default DeleteAccountFlow;
