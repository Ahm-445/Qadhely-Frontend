import { Redirect } from "expo-router";

import AddItem from "../../../../components/AddItem";
import { isGroupManager, useGroup } from "../../../../hooks/useGroup";


// US 07 — the "Add items" tab, for the Group Creator and admins only.
// The tab is off the bar for everyone else; this guard also covers a direct URL.

function AddItemsTab() {

	const details = useGroup();

	if (!isGroupManager(details.myRole)) return <Redirect href={{ pathname: "/group/list", params: details }} />;

	return <AddItem />;

}


export default AddItemsTab;
