import AsyncStorage from "@react-native-async-storage/async-storage";
import { Contact, ContactField, requestPermissionsAsync } from "expo-contacts";
import { useCallback, useState } from "react";
import { API_BASE_URL } from "../config/api";


// US 05 — Create Shopping List Groups


export const MAX_INITIAL_MEMBERS = 10;
export const GROUP_NAME_MAX = 50;


export interface Group {
	id: string
	name: string
	createdBy: string
	myRole: "creator" | "admin" | "member"
	memberCount: number
	createdAt: string
	updatedAt: string
}

export interface MyGroups {
	created: Group[]
	shared: Group[]
}

export interface RegisteredContact {
	id: string
	handleName: string
	phoneNumber: string
	contactName?: string	// name saved on this phone
}

type Result<T> = { success: true; data: T } | { success: false; error: string };



// The login screen saves the backend's login response under "user" (see useAuth.tsx).
// The backend returns the JWT as `token`; useAuth's type calls it `jwt`, so accept both.
async function getToken(): Promise<string | null> {
	const value = await AsyncStorage.getItem("user");
	if (!value) return null;

	const user = JSON.parse(value);
	return user?.token ?? user?.jwt ?? null;
}


async function request<T>(path: string, method: "GET" | "POST", body?: unknown): Promise<Result<T>> {
	try {
		const token = await getToken();

		const response = await fetch(`${API_BASE_URL}${path}`, {
			method,
			headers: {
				"Content-Type": "application/json",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
			body: body === undefined ? undefined : JSON.stringify(body),
		});

		const data = await response.json().catch(() => ({}));

		if (!response.ok) {
			throw new Error(data.error || `HTTP ${response.status}`);
		}

		return { success: true, data };
	}
	catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(message);
		return { success: false, error: message };
	}
}



// last 9 digits of a number (5XXXXXXXX), used to match the backend's number to the phone's contact name
const localPart = (phone: string) => phone.replace(/\D/g, "").slice(-9);


function useGroups() {

	const [groups, setGroups] = useState<MyGroups>({ created: [], shared: [] });
	const [loading, setLoading] = useState(false);


	// GET /api/groups  (Home page: Created Groups / Shared Groups)
	const fetchGroups = useCallback(async () => {
		setLoading(true);
		const result = await request<MyGroups>("/api/groups", "GET");
		if (result.success) setGroups(result.data);
		setLoading(false);
		return result;
	}, []);


	// POST /api/groups
	const createGroup = async (name: string, memberIds: string[]) => {
		return request<{ message: string; group: Group }>("/api/groups", "POST", { name, memberIds });
	};


	// Reads the phone's contacts and asks the backend which ones are registered.
	// NFR-09: numbers are only sent for matching — nothing is saved.
	const getRegisteredContacts = async (): Promise<Result<{ permission: boolean; users: RegisteredContact[] }>> => {
		try {
			const { status } = await requestPermissionsAsync();

			if (status !== "granted") {
				return { success: true, data: { permission: false, users: [] } };
			}

			const contacts = await Contact.getAllDetails([ContactField.FULL_NAME, ContactField.PHONES]);

			const phones: string[] = [];
			const nameByPhone: Record<string, string> = {};

			for (const contact of contacts) {
				for (const phone of contact.phones ?? []) {
					if (!phone.number) continue;
					phones.push(phone.number);
					if (contact.fullName) nameByPhone[localPart(phone.number)] = contact.fullName;
				}
			}

			if (phones.length === 0) {
				return { success: true, data: { permission: true, users: [] } };
			}

			const result = await request<{ users: RegisteredContact[] }>("/api/contacts/match", "POST", { phones: phones.slice(0, 2000) });

			if (!result.success) return result;

			const users = result.data.users.map((u) => ({ ...u, contactName: nameByPhone[localPart(u.phoneNumber)] }));

			return { success: true, data: { permission: true, users } };
		}
		catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.error(message);
			return { success: false, error: "Could not read your contacts." };
		}
	};

	
	// Generate an invite link for a group
	const generateGroupInvite = async (groupId: string) => {
		return request<{ inviteLink: string }>(
			`/api/groups/${groupId}/invite`,
			"POST"
		);
	};

	// Join a group using an invite token
	const joinGroupByInvite = async (inviteToken: string) => {
		return request<{ message: string; group: Group }>(
			`/api/groups/join/${inviteToken}`,
			"POST"
		);
	};

	return { groups, loading, fetchGroups, createGroup, getRegisteredContacts, generateGroupInvite, joinGroupByInvite };
}


export default useGroups;
