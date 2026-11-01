// US 12 AC-03 — a quantity is a whole number, 0 or more; a decimal point is allowed only by
// weight. These are plain functions so the rules can be reasoned about (and changed) apart
// from the screen that shows them. The backend validates the same rules again.

export const UNITS = ["piece", "kg", "box"] as const;

export type Unit = (typeof UNITS)[number];


/** What the unit dropdown shows. */ 
export const UNIT_LABELS: Record<Unit, string> = {
	piece: "Piece",
	kg: "Kg",
	box: "Box",
};


// Units measured by weight, where a decimal point makes sense.
const WEIGHT_UNITS: Unit[] = ["kg"];


export function allowsDecimal(unit: Unit): boolean {
	return WEIGHT_UNITS.includes(unit);
}


/**
 * Turns raw keystrokes into a quantity the user is allowed to type: digits, and a decimal
 * point only by weight. Everything else is dropped, so the field can never hold text that
 * could not be sent.
 */
export function sanitizeQuantityInput(text: string, unit: Unit): string {

	if (!allowsDecimal(unit)) return text.replace(/[^0-9]/g, "");

	// one decimal point at most, digits either side
	const cleaned = text.replace(/[^0-9.]/g, "");
	const [whole, ...rest] = cleaned.split(".");

	return rest.length === 0 ? whole : `${whole}.${rest.join("")}`;
}


/** null when the field is valid, otherwise the message to show under it. */
export function validateQuantity(text: string, unit: Unit): string | null {

	const trimmed = text.trim();

	if (trimmed === "") return "Enter a quantity.";

	const value = Number(trimmed);

	if (!Number.isFinite(value)) return "Enter a quantity as a number.";
	if (value < 0) return "Quantity cannot be negative.";
	if (!allowsDecimal(unit) && !Number.isInteger(value)) return `Use a whole number for ${UNIT_LABELS[unit]}.`;

	return null;
}


/** The number to send, or null while the field is not valid. */
export function parseQuantity(text: string, unit: Unit): number | null {

	if (validateQuantity(text, unit) !== null) return null;

	return Number(text.trim());
}
