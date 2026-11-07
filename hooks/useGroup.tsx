import { Href } from "expo-router";
import { createContext, ReactNode, useContext } from "react";
import type { Group } from "./useGroups";

// This file is used for internal group managment (Which screens are visible to a particular user, i.e Know which group you're in)
// US 12 — the group the user opened on the Home page.
// Home passes its details as route params (no extra request needed); the (tabs) layout
// reads them once and hands them down, because the three tab screens are siblings of
// each other and cannot see those params themselves.

export type GroupDetails = {
	id: string
	name: string
	myRole: Group["myRole"]
	memberCount: string
}


// US 30 AC-03: the Group Creator and admins manage the group, regular members only read it
export function isGroupManager(role: Group["myRole"] | undefined): boolean {
	return role === "creator" || role === "admin";
}


// The tab a group opens on: the center tab, "Group list", for every role. The group travels in
// the URL, which is what the tab bar reads back.
export function groupEntryHref(details: GroupDetails): Href {
	return { pathname: "/group/list", params: details };
}


const GroupContext = createContext<GroupDetails | null>(null);


function GroupProvider({ details, children }: { details: GroupDetails; children: ReactNode }) {

	return (
		<GroupContext.Provider value={details}>
			{children}
		</GroupContext.Provider>
	);

}


function useGroup(): GroupDetails {

	const details = useContext(GroupContext);

	if (!details) throw new Error("useGroup must be used within a GroupProvider.");

	return details;

}


export { GroupProvider, useGroup };
