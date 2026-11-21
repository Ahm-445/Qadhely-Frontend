import { useState } from "react";
import { Modal } from "react-native";

import AddItemForm from "./AddItemForm";
import AddItemSearch from "./AddItemSearch";
import type { ListItem } from "../hooks/useGroups";
import { listItemName } from "../services/catalog";


// US 22 — replacing a not-found item, shown over the Group list.
// Opened either with a picked suggestion (straight to the add-item screen to set the quantity) or
// from "Edit manually" (the catalog search first, with the suggested text in the search bar, AC-01;
// an empty bar when there is none, AC-02). Picking an item and applying it replaces the old one (AC-03).

type ReplaceItemModalProps = {
	item: ListItem                 // the not-found item being replaced
	pickedItemId: string | null    // a suggestion the admin tapped; null opens the search
	searchQuery: string            // what "Edit manually" puts in the search bar
	onClose: () => void
	onReplaced: () => void
}


function ReplaceItemModal({ item, pickedItemId, searchQuery, onClose, onReplaced }: ReplaceItemModalProps) {

	// started from a suggestion: Back closes; started from the search: Back returns to the results
	const [picked, setPicked] = useState<string | null>(pickedItemId);
	const startedWithPick = pickedItemId !== null;

	return (
		<Modal visible animationType="slide" onRequestClose={onClose}>

			{picked === null ? (
				<AddItemSearch
					initialQuery={item.replacementText ? searchQuery : ""}
					title={`Replace ${listItemName(item)}`}
					onBack={onClose}
					onPickItem={setPicked}
				/>
			) : (
				<AddItemForm
					itemId={picked}
					replacing={item}
					onAdded={onReplaced}
					onCancel={startedWithPick ? onClose : () => setPicked(null)}
				/>
			)}

		</Modal>
	);

}


export default ReplaceItemModal;
