// US 12 — the catalog seam.
//
// Browsing the catalog (the search bar and its results) is a separate piece of work. Until it
// lands, this module is the one place the app asks for a catalog item by id, so the Add Item
// screen can be built and tested against the real item shape from
// Qadhely_Backend/data/catalog.json.
//
// To switch to the real catalog, replace the body of getCatalogItem with the lookup or the
// API call — nothing else has to change.

export interface CatalogItem {
	id: string
	name_en: string
	name_ar: string
	brand_en: string
	brand_ar: string
	size_value: number
	size_unit: string
	size_text: string
	category: string
	store_category: string
	barcode: string
	image: string
	store: string
}


// One entry, copied verbatim from Qadhely_Backend/data/catalog.json, so the screen is
// exercised by a real item rather than an invented one.
const FIXTURE_ITEMS: Record<string, CatalogItem> = {
	"tamimi-137805": {
		id: "tamimi-137805",
		name_en: "Large White Eggs Plastic Packaging",
		name_ar: "بيض أبيض طازج حجم كبير في علبة بلاستيك",
		brand_en: "Al Gharbia",
		brand_ar: "الغربية",
		size_value: 30.0,
		size_unit: "pcs",
		size_text: "30 count",
		category: "dairy",
		store_category: "EGGS",
		barcode: "6287011950041",
		image: "https://storage.googleapis.com/tm-zopsmart-uploads/1/images/640/20250326/3695311-20250326-120924.webp",
		store: "Tamimi",
	},
};


/** The catalog item for an id, or null when the catalog has no such item. */
export function getCatalogItem(id: string): CatalogItem | null {
	return FIXTURE_ITEMS[id] ?? null;
}


/** "30 pcs" — the size the catalog stores, with a whole number left whole. */
export function catalogItemSize(item: CatalogItem): string {
	const value = String(item.size_value);

	return item.size_unit ? `${value} ${item.size_unit}` : value;
}


/** Ex: "Al Gharbia Large White Eggs Plastic Packaging 30 pcs" — brand, name and size, as one line. */
export function catalogItemTitle(item: CatalogItem): string {
	return [item.brand_en, item.name_en, catalogItemSize(item)].filter(Boolean).join(" ");
}
