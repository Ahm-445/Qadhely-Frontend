import { Href } from "expo-router";
import { createContext, ReactNode, useContext } from "react";
import type { Group } from "./useGroups";


// US 07 — the group the user opened on the Home page.
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


// The tab a role opens the group on. A regular member has no "Add items" tab, so they land on
// the list; both paths carry the group in the URL, which is what the tab bar reads back.
export function groupEntryHref(details: GroupDetails): Href {
	if (isGroupManager(details.myRole)) return { pathname: "/group/items", params: details };
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
