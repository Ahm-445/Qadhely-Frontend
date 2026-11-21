// Telegram add items — the Qadhely bot the Group Creator and admins add items through.
// Set EXPO_PUBLIC_TELEGRAM_BOT_USERNAME in .env (e.g. "QadhelyBot"; a leading "@" or a
// t.me link also works). Left empty, the app shows no Telegram shortcut.

// Telegram usernames: 5-32 letters, digits or underscores
const USERNAME_PATTERN = /^[A-Za-z0-9_]{5,32}$/;

function getTelegramBotUrl(): string | null {
	const raw = process.env.EXPO_PUBLIC_TELEGRAM_BOT_USERNAME?.trim() ?? "";

	const username = raw
		.replace(/^(https?:\/\/)?(www\.)?t\.me\//i, "")
		.replace(/^@/, "")
		.replace(/\/+$/, "");

	if (!USERNAME_PATTERN.test(username)) {
		if (__DEV__ && raw !== "") console.warn(`EXPO_PUBLIC_TELEGRAM_BOT_USERNAME is not a Telegram username: "${raw}"`);
		return null;
	}

	// a t.me link opens the Telegram app when it is installed, and the web page otherwise.
	// No ?start= payload: the bot only answers a plain "/start".
	return `https://t.me/${username}`;
}

export const TELEGRAM_BOT_URL = getTelegramBotUrl();
