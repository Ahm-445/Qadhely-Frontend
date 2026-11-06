import { Redirect } from "expo-router";
import { useState } from "react";

import { View } from "react-native";

import AddItemForm from "../../../../components/AddItemForm";
import AddItemSearch from "../../../../components/AddItemSearch";
import { isGroupManager, useGroup } from "../../../../hooks/useGroup";


// US 12 — the "Add items" tab, for the Group Creator and admins only.
// The tab is off the bar for everyone else; this guard also covers a direct URL.
//
// The tab holds the two steps of adding an item: the search, and then the picked item's form.
// The search stays mounted (hidden) behind the form, so backing out or adding an item returns to
// the same results.

function AddItemsTab() {

	const details = useGroup();

	const [pickedItemId, setPickedItemId] = useState<string | null>(null);

	if (!isGroupManager(details.myRole)) return <Redirect href={{ pathname: "/group/list", params: details }} />;

	return (
		<>

			<View style={{ flex: 1, display: pickedItemId === null ? "flex" : "none" }}>
				<AddItemSearch onPickItem={setPickedItemId} />
			</View>

			{pickedItemId !== null && (
				<AddItemForm
					itemId={pickedItemId}
					onAdded={() => setPickedItemId(null)}
					onCancel={() => setPickedItemId(null)}
				/>
			)}

		</>
	);

}


export default AddItemsTab;
