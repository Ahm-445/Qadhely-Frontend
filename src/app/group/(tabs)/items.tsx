import { Redirect } from "expo-router";
import { useState } from "react";

import AddItem from "../../../../components/AddItem";
import AddItemForm from "../../../../components/AddItemForm";
import { isGroupManager, useGroup } from "../../../../hooks/useGroup";


// US 12 — the "Add items" tab, for the Group Creator and admins only.
// The tab is off the bar for everyone else; this guard also covers a direct URL.
//
// The tab holds the two steps of adding an item: the search, and then the picked item's form.

function AddItemsTab() {

	const details = useGroup();

	const [pickedItemId, setPickedItemId] = useState<string | null>(null);

	if (!isGroupManager(details.myRole)) return <Redirect href={{ pathname: "/group/list", params: details }} />;

	if (pickedItemId !== null) {

		return (
			<AddItemForm
				itemId={pickedItemId}
				onAdded={() => setPickedItemId(null)}
				onCancel={() => setPickedItemId(null)}
			/>
		);

	}

	return <AddItem onPickItem={setPickedItemId} />;

}


export default AddItemsTab;
