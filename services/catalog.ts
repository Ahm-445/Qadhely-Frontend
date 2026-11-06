import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_BASE_URL } from "../config/api";


// US 12 — the product catalog.
//
// The catalog lives on the backend (data/catalog.json) and is searched through
// GET /api/catalog/search. The shape below is what the backend returns for a product: English
// only, and any field the catalog does not have comes back as null.

import type { ListItem } from "../hooks/useGroups";

export interface CatalogItem {
	id: string
	name_en: string
	brand_en: string | null
	size_value: number | null
	size_unit: string | null
	size_text: string | null
	image: string | null
	store: string | null
}

export interface CatalogSearchPage {
	query: string
	total: number
	limit: number
	offset: number
	hasMore: boolean
	items: CatalogItem[]
}


/** How many products one request asks for. */
export const CATALOG_PAGE_SIZE = 20;

// Every product the search has returned, by id. getCatalogItem reads from here, so a product the
// user just picked in the results is always found without another request.
const catalogCache = new Map<string, CatalogItem>();

const REQUEST_TIMEOUT_MS = 15000;


// The login screen saves the backend's login response under "user" (see useAuth.tsx).
// The backend returns the JWT as `token`; useAuth's type calls it `jwt`, so accept both.
async function getToken(): Promise<string | null> {
	const value = await AsyncStorage.getItem("user");
	if (!value) return null;

	const user = JSON.parse(value);
	return user?.token ?? user?.jwt ?? null;
}


/**
 * Searches the catalog by English product name or brand.
 *
 * Pass `signal` to cancel the request (a newer search replaces it). A cancelled request rejects
 * with an AbortError, which the caller should ignore. Every other failure rejects with an Error
 * whose message is safe to show the user.
 */
export async function searchCatalog(
	query: string,
	options: { offset?: number; limit?: number; signal?: AbortSignal } = {}
): Promise<CatalogSearchPage> {

	const { offset = 0, limit = CATALOG_PAGE_SIZE, signal } = options;

	const controller = new AbortController();
	const forwardAbort = () => controller.abort();

	if (signal?.aborted) controller.abort();
	signal?.addEventListener("abort", forwardAbort);

	let timedOut = false;
	const timer = setTimeout(() => {
		timedOut = true;
		controller.abort();
	}, REQUEST_TIMEOUT_MS);

	let response: Response;

	try {
		const token = await getToken();
		const params = `q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`;

		response = await fetch(`${API_BASE_URL}/api/catalog/search?${params}`, {
			headers: {
				Accept: "application/json",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
			signal: controller.signal,
		});
	}
	catch (error) {
		// cancelled by the caller: let it through untouched so the caller can ignore it
		if (signal?.aborted) throw error;

		throw new Error(
			timedOut
				? "The search took too long. Please try again."
				: "Cannot reach the server. Check your connection and try again."
		);
	}
	finally {
		clearTimeout(timer);
		signal?.removeEventListener("abort", forwardAbort);
	}

	const data = await response.json().catch(() => null);

	if (!response.ok) {

		if (response.status === 401) {
			throw new Error("Your session has expired. Please log in again.");
		}

		throw new Error(typeof data?.error === "string" ? data.error : "Something went wrong. Please try again.");
	}

	if (!data || !Array.isArray(data.items)) {
		throw new Error("Unexpected response from the server. Please try again.");
	}

	for (const item of data.items as CatalogItem[]) {
		catalogCache.set(item.id, item);
	}

	return data as CatalogSearchPage;
}


/**
 * The catalog item for an id, or null when this session has not seen it. It is synchronous and
 * reads the products that searchCatalog has returned, which always includes one the user just
 * picked from the search results.
 */
export function getCatalogItem(id: string): CatalogItem | null {
	return catalogCache.get(id) ?? null;
}


/** "30 pcs" from the structured size, or the catalog's own text ("30 count") when there is none. */
export function catalogItemSize(item: CatalogItem): string {

	if (item.size_value !== null) {
		const value = String(item.size_value);

		return item.size_unit ? `${value} ${item.size_unit}` : value;
	}

	return item.size_text ?? "";
}


/** "Al Gharbia Large White Eggs Plastic Packaging 30 pcs" — brand, name and size, as one line. */
export function catalogItemTitle(item: CatalogItem): string {
	return [item.brand_en, item.name_en, catalogItemSize(item)].filter(Boolean).join(" ");
}


/** The name a list row shows: the catalog's, the custom request's, or the id while the catalog has no such item. */
export function listItemName(item: ListItem): string {
	return item.catalogItem?.name_en ?? item.customName ?? item.catalogItemId ?? "";
}
