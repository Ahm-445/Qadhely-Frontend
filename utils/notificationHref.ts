import type { Href } from "expo-router";

import { groupEntryHref } from "../hooks/useGroup";


// US 18 AC-02 — where tapping an "items added" notification goes.
//
// The backend sends one notification per recipient, with (see services/pushNotifications.js):
//   data: { type: "items_added", groupId, groupName, myRole, memberCount }
// This turns that into the same route the Home screen uses to open a group, so the group opens
// exactly as if the user had tapped it there. Anything unexpected returns null: the app then
// ignores the tap instead of opening a wrong screen.

export const ITEMS_ADDED_NOTIFICATION = "items_added";

// a MongoDB ObjectId, which is what the backend uses for a group id
const GROUP_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

const ROLES = ["creator", "admin", "member"] as const;


function nonEmptyText(value: unknown): string | null {
	if (typeof value !== "string") return null;

	const trimmed = value.trim();

	return trimmed === "" ? null : trimmed;
}


/** The group route for a notification's data, or null when it is not a usable "items added" notification. */
export function notificationHref(data: unknown): Href | null {

	if (typeof data !== "object" || data === null || Array.isArray(data)) return null;

	const payload = data as Record<string, unknown>;

	if (payload.type !== ITEMS_ADDED_NOTIFICATION) return null;

	const id = nonEmptyText(payload.groupId);

	if (id === null || !GROUP_ID_PATTERN.test(id)) return null;

	// an unknown or missing role opens the group as a regular member: the least a user can see
	const myRole = ROLES.find((role) => role === payload.myRole) ?? "member";

	const count = Number(payload.memberCount);

	return groupEntryHref({
		id,
		name: nonEmptyText(payload.groupName) ?? "Shopping list",
		myRole,
		memberCount: Number.isInteger(count) && count >= 0 ? String(count) : "0",
	});
}
