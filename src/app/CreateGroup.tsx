import { createGroupsStyles } from "@/assets/styles/groups.styles";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	KeyboardAvoidingView,
	Platform,
	StatusBar,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackButton from "../../components/BackButton";
import ContactPickerItem from "../../components/ContactPickerItem";
import Header from "../../components/Header";
import useGroups, { GROUP_NAME_MAX, MAX_INITIAL_MEMBERS, RegisteredContact } from "../../hooks/useGroups";
import { useTheme } from "../../hooks/useTheme";


// US 05 — AC-01 / AC-02: name the group, pick 0–10 registered contacts, "Create list"

function CreateGroup() {

	const { colors } = useTheme();
	const groupsStyles = createGroupsStyles(colors);

	const { createGroup, getRegisteredContacts } = useGroups();

	const [name, setName] = useState("");
	const [isFocused, setIsFocused] = useState(false);
	const [contacts, setContacts] = useState<RegisteredContact[]>([]);
	const [selected, setSelected] = useState<string[]>([]);
	const [loadingContacts, setLoadingContacts] = useState(true);
	const [contactsNote, setContactsNote] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");


	// load the user's contacts that are registered with Qadhely
	useEffect(() => {
		let active = true;

		getRegisteredContacts().then((result) => {
			if (!active) return;

			if (!result.success) {
				setContactsNote(result.error);
			}
			else if (!result.data.permission) {
				setContactsNote("Allow access to your contacts to add family members now. You can also add them later.");
			}
			else if (result.data.users.length === 0) {
				setContactsNote("None of your contacts use Qadhely yet. You can invite them later.");
			}
			else {
				setContacts(result.data.users);
			}

			setLoadingContacts(false);
		});

		return () => { active = false; };
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);


	const toggleContact = (id: string) => {
		setError("");

		if (selected.includes(id)) {
			setSelected(selected.filter((x) => x !== id));
		}
		else if (selected.length < MAX_INITIAL_MEMBERS) {
			setSelected([...selected, id]);
		}
		else {
			setError(`You can add up to ${MAX_INITIAL_MEMBERS} members.`);
		}
	};


	const handleCreate = async () => {
		const groupName = name.trim();

		if (!groupName) {
			setError("Enter a name for the group.");
			return;
		}

		setSubmitting(true);
		setError("");

		const result = await createGroup(groupName, selected);

		setSubmitting(false);

		if (!result.success) {
			setError(result.error);
			return;
		}

		// AC-03: Home reloads when it is shown and lists the group under "Created Groups"
		router.back();
	};


	const canCreate = !!name.trim() && !submitting;


	return (
		<LinearGradient colors={colors.gradients.background} style={groupsStyles.container}>

			<StatusBar barStyle={colors.statusBarStyle} />

			<SafeAreaView style={groupsStyles.safeArea}>

				<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>

					<Header />

					<BackButton />

					<View style={groupsStyles.formSection}>

						<Text style={groupsStyles.label}>Group name</Text>

						<TextInput
							style={[groupsStyles.input, isFocused && groupsStyles.inputFocused]}
							placeholder="e.g. Family groceries"
							placeholderTextColor={colors.textMuted}
							value={name}
							onChangeText={(text) => { setName(text); setError(""); }}
							onFocus={() => setIsFocused(true)}
							onBlur={() => setIsFocused(false)}
							maxLength={GROUP_NAME_MAX}
							returnKeyType="done"
						/>

						<View style={groupsStyles.membersHeader}>
							<Text style={groupsStyles.label}>Add members (optional)</Text>
							<Text style={groupsStyles.counter}>{selected.length}/{MAX_INITIAL_MEMBERS}</Text>
						</View>

					</View>

					{loadingContacts ? (
						<ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />
					) : (
						<FlatList
							style={groupsStyles.contactList}
							contentContainerStyle={groupsStyles.contactListContent}
							data={contacts}
							keyExtractor={(contact) => contact.id}
							ListEmptyComponent={<Text style={groupsStyles.note}>{contactsNote}</Text>}
							renderItem={({ item }) => (
								<ContactPickerItem
									contact={item}
									selected={selected.includes(item.id)}
									onToggle={() => toggleContact(item.id)}
								/>
							)}
						/>
					)}

					{!!error && <Text style={groupsStyles.errorText}>{error}</Text>}

					<View style={groupsStyles.footer}>
						<TouchableOpacity activeOpacity={0.8} onPress={handleCreate} disabled={!canCreate}>
							<LinearGradient
								colors={canCreate ? colors.gradients.primary : colors.gradients.muted}
								style={[groupsStyles.createButton, !canCreate && groupsStyles.createButtonDisabled]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
							>
								{submitting ? (
									<ActivityIndicator color="#ffffff" />
								) : (
									<>
										<Ionicons name="checkmark-circle-outline" size={24} color="#ffffff" />
										<Text style={groupsStyles.createButtonText}>Create list</Text>
									</>
								)}
							</LinearGradient>
						</TouchableOpacity>
					</View>

				</KeyboardAvoidingView>

			</SafeAreaView>

		</LinearGradient>
	);

}


export default CreateGroup;
