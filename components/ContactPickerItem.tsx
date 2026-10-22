import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "../hooks/useTheme";
import type { RegisteredContact } from "../hooks/useGroups";


interface ContactPickerItemProps {
	contact: RegisteredContact
	selected: boolean
	onToggle: () => void
}


const ContactPickerItem: React.FC<ContactPickerItemProps> = ({ contact, selected, onToggle }) => {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	return (
		<TouchableOpacity style={groupsStyles.contactRow} activeOpacity={0.7} onPress={onToggle}>

			{selected ? (
				<LinearGradient colors={colors.gradients.primary} style={[groupsStyles.checkboxInner, { borderColor: "transparent" }]}>
					<Ionicons name="checkmark-outline" size={18} color="#ffffff" />
				</LinearGradient>
			) : (
				<View style={groupsStyles.checkboxInner} />
			)}

			<View style={{ flex: 1 }}>
				<Text style={groupsStyles.contactName}>{contact.contactName || contact.handleName}</Text>
				<Text style={groupsStyles.contactSub}>@{contact.handleName} · {contact.phoneNumber}</Text>
			</View>

		</TouchableOpacity>
	);

};


export default ContactPickerItem;
