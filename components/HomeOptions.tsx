import { createHomeStyles } from "@/assets/styles/home.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Text, TouchableOpacity } from "react-native";

import DeleteAccountFlow from "./DeleteAccountFlow";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";


interface HomeOptionsProps {
	visible: boolean
	onClose: () => void
}


// opening is an "entering UI" transition; closing stays a little quicker
const OPEN_DURATION = 180;
const CLOSE_DURATION = 140;


// Drop down shown under the "Options" button on Home: "Logout" and "Delete account" (US 04).
function HomeOptions({ visible, onClose }: HomeOptionsProps) {

	const { colors } = useTheme();
	const { logout } = useAuth();

	const homeStyles = createHomeStyles(colors);

	// opacity rides a curve, the offset rides a spring so the menu feels physical
	const [opacity] = useState(() => new Animated.Value(0));
	const [translateY] = useState(() => new Animated.Value(-8));

	const [reduceMotion, setReduceMotion] = useState(false);

	// US 04: the delete-account warning and OTP sheet
	const [deleteOpen, setDeleteOpen] = useState(false);


	
	useEffect(() => {

		let active = true;

		AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
			if (active) setReduceMotion(enabled);
		});

		const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);

		return () => {
			active = false;
			subscription.remove();
		};

	}, []);


	// activates when [visible, reduceMotion, opacity, translateY] are modified
	useEffect(() => {

		// reduced motion keeps the fade but drops the slide
		const showOffset = reduceMotion
			? Animated.timing(translateY, { toValue: 0, duration: 0, useNativeDriver: true })
			: Animated.spring(translateY, { toValue: 0, damping: 18, stiffness: 240, mass: 0.6, useNativeDriver: true });

		const hideOffset = reduceMotion
			? Animated.timing(translateY, { toValue: -8, duration: 0, useNativeDriver: true })
			: Animated.timing(translateY, {
				toValue: -8,
				duration: CLOSE_DURATION,
				easing: Easing.in(Easing.cubic),
				useNativeDriver: true,
			});

		Animated.parallel([
			Animated.timing(opacity, {
				toValue: visible ? 1 : 0,
				duration: visible ? OPEN_DURATION : CLOSE_DURATION,
				easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
				useNativeDriver: true,
			}),
			visible ? showOffset : hideOffset,
		]).start();

	}, [visible, reduceMotion, opacity, translateY]);


	// clear the session, then send the user back to the login screen
	const handleLogout = async () => {
		onClose();
		try {
			await logout();
		}
		finally {
			router.replace("/Login");
		}
	};


	// US 04: close the menu, then show the irreversible-action warning
	const handleDeleteAccount = () => {
		onClose();
		setDeleteOpen(true);
	};


	return (
		<>
		<Animated.View
			pointerEvents={visible ? "auto" : "none"}
			accessibilityElementsHidden={!visible}
			importantForAccessibility={visible ? "yes" : "no-hide-descendants"}
			style={[
				homeStyles.optionsDropdown,
				{ opacity, transform: [{ translateY }] },
			]}
		>

			<TouchableOpacity
				style={homeStyles.optionRow}
				activeOpacity={0.8}
				onPress={handleLogout}
			>

				<Ionicons name="log-out-outline" size={22} color={colors.danger} />

				<Text style={homeStyles.logoutText}>
					Logout
				</Text>

			</TouchableOpacity>

			<TouchableOpacity
				style={homeStyles.optionRow}
				activeOpacity={0.8}
				onPress={handleDeleteAccount}
			>

				<Ionicons name="trash-outline" size={22} color={colors.danger} />

				<Text style={[homeStyles.logoutText, { flexShrink: 0 }]} numberOfLines={1}>
					Delete account
				</Text>

			</TouchableOpacity>

		</Animated.View>

		<DeleteAccountFlow visible={deleteOpen} onClose={() => setDeleteOpen(false)} />
		</>
	);

}


export default HomeOptions;
