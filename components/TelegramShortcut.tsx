import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Alert, Linking, Text, TouchableOpacity, View } from "react-native";

import { TELEGRAM_BOT_URL } from "../config/telegram";
import { useTheme } from "../hooks/useTheme";


// Telegram add items — on the "Add items" tab, opens the Qadhely bot so the Group Creator or an
// admin can add items on the go. The bot runs the whole flow on the server: /add searches the
// catalog (top 20 results, AC-01), asks for a quantity and a unit (kg, piece or box, AC-02), adds
// the item and sends back the updated list (AC-03); /cancel leaves the list as it was (AC-04), and
// a wrong answer is pointed out and asked again (AC-05).
// The item reaches this app through the list's own refresh (GroupList re-reads every 10 seconds).
// Hidden when no bot is configured (config/telegram.ts).

interface TelegramShortcutProps {
	groupName: string
}


function TelegramShortcut({ groupName }: TelegramShortcutProps) {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	if (!TELEGRAM_BOT_URL) return null;

	const botUrl = TELEGRAM_BOT_URL;

	const openBot = async () => {
		try {
			await Linking.openURL(botUrl);
		}
		catch {
			Alert.alert("Could not open Telegram", `Open ${botUrl} in Telegram to add items from there.`);
		}
	};


	return (
		<TouchableOpacity
			activeOpacity={0.85}
			onPress={openBot}
			accessibilityRole="link"
			accessibilityLabel="Add items from Telegram"
			accessibilityHint="Opens the Qadhely bot in Telegram"
		>
			<LinearGradient colors={colors.gradients.surface} style={groupsStyles.telegramCard}>

				<LinearGradient colors={colors.gradients.blue} style={groupsStyles.groupIcon}>
					<Ionicons name="paper-plane-outline" size={22} color="#ffffff" />
				</LinearGradient>

				<View style={groupsStyles.groupTextContainer}>

					<Text style={groupsStyles.groupName}>Add from Telegram</Text>

					<Text style={groupsStyles.telegramText}>
						{`Send /group to pick ${groupName ? `"${groupName}"` : "this list"}, then /add to search for an item. Send /cancel to stop at any step.`}
					</Text>

					<Text style={groupsStyles.telegramHint}>First time? Tap Start in the bot and share your phone number.</Text>

				</View>

				<Ionicons name="open-outline" size={20} color={colors.primary} />

			</LinearGradient>
		</TouchableOpacity>
	);

}


export default TelegramShortcut;
