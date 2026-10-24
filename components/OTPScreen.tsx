import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	ActivityIndicator,
	Animated,
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { OtpInput, OtpInputRef } from 'react-native-otp-entry';
// npm install react-native-otp-entry




/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface OtpScreenProps {
	/** Controls modal visibility */
	visible: boolean;
	/** Called when the user dismisses the modal (X button, backdrop, Android back) */
	onClose: () => void;
	/** Called with the full code. Throw / reject to show an error state. */
	onVerify: (code: string) => Promise<void> | void;
	/** Called when the user taps "Resend code" */
	onResend?: () => Promise<void> | void;
	/** Where the code was sent, shown in the subtitle */
	destination?: string;
	/** Number of digits (default 6). With allowedLengths, the number of input cells. */
	length?: number;
	/**
	 * Optional: accepted code lengths, e.g. [4, 6]. When set, Verify is enabled for any of
	 * these lengths (use it with autoSubmit={false}, since the code can't auto-submit when
	 * its length isn't known). Default: only `length` digits are accepted.
	 */
	allowedLengths?: number[];
	/** Seconds before another OTP can be requested (default 60) */
	resendSeconds?: number;
	/** Submit automatically once all digits are entered (default true) */
	autoSubmit?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

const OtpScreen: React.FC<OtpScreenProps> = ({
	visible,
	onClose,
	onVerify,
	onResend,
	destination,
	length = 6,
	allowedLengths,
	resendSeconds = 60,
	autoSubmit = true,
}) => {
	const [code, setCode] = useState('');
	const [error, setError] = useState<string | null>(null);
	// true when the current error came from a failed verification (not a resend)
	const [verifyFailed, setVerifyFailed] = useState(false);
	const [loading, setLoading] = useState(false);
	const [resending, setResending] = useState(false);
	const [timer, setTimer] = useState(resendSeconds);

	const otpRef = useRef<OtpInputRef>(null);
	const shake = useRef(new Animated.Value(0)).current;

	/* ----------------------------- Reset on open ----------------------------- */
	useEffect(() => {
		if (visible) {
			setCode('');
			setError(null);
			setLoading(false);
			setTimer(resendSeconds); // code was just sent → start the 60s countdown
			const t = setTimeout(() => otpRef.current?.focus(), 350);
			return () => clearTimeout(t);
		}
	}, [visible, resendSeconds]);

	/* --------------------------- 60s resend countdown ------------------------ */
	useEffect(() => {
		if (!visible || timer <= 0) return;
		const id = setTimeout(() => setTimer((s) => s - 1), 1000);
		return () => clearTimeout(id);
	}, [visible, timer]);

	/* -------------------------------- Helpers -------------------------------- */
	const runShake = () => {
		shake.setValue(0);
		Animated.sequence(
			[10, -10, 6, -6, 0].map((toValue) =>
				Animated.timing(shake, { toValue, duration: 50, useNativeDriver: true }),
			),
		).start();
	};

	const isAcceptedLength = (n: number) =>
		allowedLengths ? allowedLengths.includes(n) : n === length;

	const submit = useCallback(
		async (value: string) => {
			if (!isAcceptedLength(value.length) || loading) return;
			setLoading(true);
			setError(null);
			try {
				await onVerify(value);
			} catch (e: any) {
				setError(e?.message || 'Invalid code. Please try again.');
				setVerifyFailed(true);
				setCode('');
				otpRef.current?.clear();
				runShake();
				otpRef.current?.focus();
			} finally {
				setLoading(false);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[length, allowedLengths, loading, onVerify],
	);

	const handleResend = async () => {
		if (timer > 0 || resending) return;
		setResending(true);
		setError(null);
		try {
			await onResend?.();
			setCode('');
			otpRef.current?.clear();
			setTimer(resendSeconds); // restart the countdown for the next OTP
			otpRef.current?.focus();
		} catch (e: any) {
			setError(e?.message || 'Could not resend code.');
			setVerifyFailed(false);
		} finally {
			setResending(false);
		}
	};

	const formatTime = (s: number) =>
		`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

	/* --------------------------------- Render -------------------------------- */
	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
			statusBarTranslucent
		>
			<KeyboardAvoidingView
				style={styles.flex}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				{/* Backdrop */}
				<Pressable style={styles.backdrop} onPress={onClose} />

				{/* Sheet */}
				<View style={styles.sheet}>
					<View style={styles.handle} />

					<Pressable
						style={styles.closeBtn}
						onPress={onClose}
						hitSlop={12}
						accessibilityRole="button"
						accessibilityLabel="Close"
					>
						<Text style={styles.closeText}>✕</Text>
					</Pressable>

					<Text style={styles.title}>Verification code</Text>
					<Text style={styles.subtitle}>
						Enter the {allowedLengths ? allowedLengths.join(' or ') : length}-digit code we sent
						{destination ? ' to ' : ''}
						{destination ? <Text style={styles.bold}>{destination}</Text> : null}
					</Text>

					{/* OTP expiry notice. The code and the resend countdown both last resendSeconds. */}
					{timer > 0 ? (
						<Text style={styles.expiryNote}>
							This code is valid for {resendSeconds} seconds and will be invalidated after that.
						</Text>
					) : (
						<Text style={[styles.expiryNote, styles.expiryExpired]}>
							This code has expired. Tap "Resend code" to get a new one.
						</Text>
					)}

					{/* OTP input */}
					<Animated.View style={{ transform: [{ translateX: shake }] }}>
						<OtpInput
							ref={otpRef}
							numberOfDigits={length}
							type="numeric"
							focusColor={error ? ERROR : PRIMARY}
							disabled={loading}
							blurOnFilled={autoSubmit}
							onTextChange={(text) => {
								setCode(text);
								if (error) setError(null);
							}}
							onFilled={(text) => autoSubmit && submit(text)}
							textInputProps={{
								accessibilityLabel: 'One-time code',
								textContentType: 'oneTimeCode', // iOS SMS autofill
								autoComplete: Platform.OS === 'android' ? 'sms-otp' : 'one-time-code',
							}}
							theme={{
								containerStyle: styles.otpContainer,
								pinCodeContainerStyle: [
									styles.cell,
									error ? styles.cellError : null,
								] as any,
								focusedPinCodeContainerStyle: styles.cellActive,
								filledPinCodeContainerStyle: styles.cellFilled,
								pinCodeTextStyle: styles.cellText,
								focusStickStyle: styles.caret,
							}}
						/>
					</Animated.View>

					{error ? <Text style={styles.error}>{error}</Text> : null}
					{error && verifyFailed ? (
						<Text style={styles.errorHint}>
							Please check that the code you entered matches the one sent to your phone.
						</Text>
					) : null}

					{/* Verify */}
					<Pressable
						onPress={() => submit(code)}
						disabled={!isAcceptedLength(code.length) || loading}
						style={({ pressed }) => [
							styles.button,
							(!isAcceptedLength(code.length) || loading) && styles.buttonDisabled,
							pressed && styles.buttonPressed,
						]}
					>
						{loading ? (
							<ActivityIndicator color="#fff" />
						) : (
							<Text style={styles.buttonText}>Verify</Text>
						)}
					</Pressable>

					{/* Resend with 60s countdown */}
					<View style={styles.resendRow}>
						<Text style={styles.muted}>Didn't get the code? </Text>
						{timer > 0 ? (
							<Text style={styles.muted}>
								Resend in <Text style={styles.timer}>{formatTime(timer)}</Text>
							</Text>
						) : (
							<Pressable onPress={handleResend} disabled={resending} hitSlop={8}>
								<Text style={styles.link}>
									{resending ? 'Sending…' : 'Resend code'}
								</Text>
							</Pressable>
						)}
					</View>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
};

export default OtpScreen;

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const PRIMARY = '#00d704';
const ERROR = '#DC2626';

const styles = StyleSheet.create({
	flex: { flex: 1, justifyContent: 'flex-end' },
	backdrop: {
		...StyleSheet.absoluteFill,
		backgroundColor: 'rgba(0,0,0,0.45)',
	},
	sheet: {
		backgroundColor: '#fff',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		paddingHorizontal: 24,
		paddingTop: 12,
		paddingBottom: Platform.OS === 'ios' ? 40 : 28,
		shadowColor: '#000',
		shadowOpacity: 0.15,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: -4 },
		elevation: 12,
	},
	handle: {
		alignSelf: 'center',
		width: 40,
		height: 4,
		borderRadius: 2,
		backgroundColor: '#E5E7EB',
		marginBottom: 16,
	},
	closeBtn: { position: 'absolute', top: 16, right: 20, padding: 4 },
	closeText: { fontSize: 18, color: '#6B7280' },
	title: { fontSize: 22, fontWeight: '700', color: '#111827', marginTop: 8 },
	subtitle: {
		fontSize: 15,
		color: '#6B7280',
		marginTop: 6,
		marginBottom: 8,
		lineHeight: 21,
	},
	expiryNote: { fontSize: 13, color: '#6B7280', marginBottom: 24, lineHeight: 18 },
	expiryExpired: { color: ERROR, fontWeight: '600' },
	bold: { fontWeight: '600', color: '#111827' },
	otpContainer: { justifyContent: 'space-between' },
	cell: {
		width: 48,
		height: 56,
		borderRadius: 12,
		borderWidth: 1.5,
		borderColor: '#D1D5DB',
		backgroundColor: '#F9FAFB',
	},
	cellFilled: { borderColor: '#9CA3AF', backgroundColor: '#fff' },
	cellActive: { borderColor: PRIMARY, borderWidth: 2, backgroundColor: '#fff' },
	cellError: { borderColor: ERROR },
	cellText: { fontSize: 24, fontWeight: '600', color: '#111827' },
	caret: { width: 2, height: 24, backgroundColor: PRIMARY },
	error: { color: ERROR, fontSize: 14, marginTop: 12, textAlign: 'center' },
	errorHint: { color: '#6B7280', fontSize: 13, marginTop: 4, textAlign: 'center', lineHeight: 18 },
	button: {
		marginTop: 28,
		height: 52,
		borderRadius: 14,
		backgroundColor: PRIMARY,
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonDisabled: { opacity: 0.5 },
	buttonPressed: { opacity: 0.85 },
	buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
	resendRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 20,
	},
	muted: { color: '#6B7280', fontSize: 14 },
	timer: { color: '#111827', fontWeight: '600', fontVariant: ['tabular-nums'] },
	link: { color: PRIMARY, fontSize: 14, fontWeight: '600' },
});


/* -------------------------------------------------------------------------- */
/*                               Example usage                                */
/* -------------------------------------------------------------------------- */
/*
import OtpScreen from './OtpScreen';

export default function LoginScreen() {
	const [phone, setPhone] = useState('');
	const [otpVisible, setOtpVisible] = useState(false);

	const sendCode = async () => {
		await api.sendOtp(phone);
		setOtpVisible(true); // countdown starts at 60s when the modal opens
	};

	return (
		<View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
			<TextInput value={phone} onChangeText={setPhone} placeholder="Phone number" />
			<Button title="Continue" onPress={sendCode} />

			<OtpScreen
				visible={otpVisible}
				destination={phone}
				onClose={() => setOtpVisible(false)}
				onResend={() => api.sendOtp(phone)} // enabled only after 60s
				onVerify={async (code) => {
					await api.verifyOtp(phone, code); // throw on failure → error + shake
					setOtpVisible(false);
					navigation.replace('Home');
				}}
			/>
		</View>
	);
}
*/
