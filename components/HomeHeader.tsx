import { createHomeStyles } from "@/assets/styles/home.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import HomeOptions from "./HomeOptions";


// 12:00 AM – 12:00 PM morning, 12:00 PM – 5:00 PM afternoon, 5:00 PM – 12:00 AM evening
function getGreeting(hour: number) {

	if (hour < 12) return "Good morning";
	if (hour < 17) return "Good afternoon";

	return "Good evening";

}


function HomeHeader() {

	const { colors } = useTheme();
	const { user } = useAuth();

	const homeStyles = createHomeStyles(colors);

	const [optionsVisible, setOptionsVisible] = useState(false);

	const greeting = getGreeting(new Date().getHours());

	return (
		<View style={homeStyles.homeHeader}>

			<View style={homeStyles.greetingContainer}>

				<Text style={homeStyles.greetingText}>
					{greeting}
				</Text>

				<Text style={homeStyles.handleNameText}>
					{user?.handleName ?? ""}
				</Text>

			</View>

			<View style={homeStyles.optionsWrapper}>

				<TouchableOpacity
					style={homeStyles.optionsButton}
					activeOpacity={0.8}
					onPress={() => setOptionsVisible((visible) => !visible)}
				>

					<Ionicons name="menu-outline" size={26} color="#ffffff" />

					<Text style={homeStyles.optionsButtonText}>
						Options
					</Text>

				</TouchableOpacity>

				<HomeOptions
					visible={optionsVisible}
					onClose={() => setOptionsVisible(false)}
				/>

			</View>

		</View>
	);

}


export default HomeHeader;
