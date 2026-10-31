import { Redirect } from "expo-router";

import AiSuggestions from "../../../../components/AiSuggestions";
import { isGroupManager, useGroup } from "../../../../hooks/useGroup";


// US 07 — the "AI suggestions" tab, for the Group Creator and admins only.
// The tab is off the bar for everyone else; this guard also covers a direct URL.

function AiSuggestionsTab() {

	const details = useGroup();

	if (!isGroupManager(details.myRole)) return <Redirect href={{ pathname: "/group/list", params: details }} />;

	return <AiSuggestions />;

}


export default AiSuggestionsTab;
