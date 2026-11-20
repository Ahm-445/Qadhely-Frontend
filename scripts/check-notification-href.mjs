// US 18 AC-02 — checks which route a tapped "items added" notification opens.
//
//   node scripts/check-notification-href.mjs
//
// Uses Node's built-in test runner and the TypeScript compiler the project already has, so it
// needs no extra test framework: .ts/.tsx files are compiled on the fly, in memory.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const ts = require(resolve(root, "node_modules/typescript"));

for (const extension of [".ts", ".tsx"]) {
	require.extensions[extension] = (module, filename) => {
		const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
			fileName: filename,
			compilerOptions: {
				module: ts.ModuleKind.CommonJS,
				target: ts.ScriptTarget.ES2020,
				jsx: ts.JsxEmit.ReactJSX,
				esModuleInterop: true,
			},
		});

		module._compile(outputText, filename);
	};
}

const { notificationHref, ITEMS_ADDED_NOTIFICATION } = require(resolve(root, "utils/notificationHref.ts"));
const { groupEntryHref } = require(resolve(root, "hooks/useGroup.tsx"));


const GROUP_ID = "665f1c2a9b1e8a0012345678";

// exactly what the backend sends to an admin of a 4-person group (see tests/us18 in the backend)
const backendPayload = {
	type: "items_added",
	groupId: GROUP_ID,
	groupName: "Family groceries",
	myRole: "admin",
	memberCount: 4,
};


test("the notification type matches the one the backend sends", () => {
	assert.equal(ITEMS_ADDED_NOTIFICATION, "items_added");
});

test("the backend's payload opens the group's list, with the group, role and member count", () => {
	assert.deepEqual(notificationHref(backendPayload), {
		pathname: "/group/list",
		params: { id: GROUP_ID, name: "Family groceries", myRole: "admin", memberCount: "4" },
	});
});

test("it is the same route the Home screen uses to open a group", () => {
	assert.deepEqual(
		notificationHref(backendPayload),
		groupEntryHref({ id: GROUP_ID, name: "Family groceries", myRole: "admin", memberCount: "4" })
	);
});

test("every route parameter is a string (they travel in the URL)", () => {
	const { params } = notificationHref(backendPayload);

	for (const value of Object.values(params)) assert.equal(typeof value, "string");
});

for (const role of ["creator", "admin", "member"]) {
	test(`the recipient's own role is kept: ${role}`, () => {
		assert.equal(notificationHref({ ...backendPayload, myRole: role }).params.myRole, role);
	});
}

for (const role of [undefined, null, "", "owner", "ADMIN", 7, {}]) {
	test(`an unknown role (${JSON.stringify(role) ?? "missing"}) opens the group as a regular member`, () => {
		assert.equal(notificationHref({ ...backendPayload, myRole: role }).params.myRole, "member");
	});
}

test("the member count may arrive as a number or as numeric text", () => {
	assert.equal(notificationHref({ ...backendPayload, memberCount: 12 }).params.memberCount, "12");
	assert.equal(notificationHref({ ...backendPayload, memberCount: "12" }).params.memberCount, "12");
	assert.equal(notificationHref({ ...backendPayload, memberCount: 0 }).params.memberCount, "0");
});

for (const count of [undefined, null, "many", -1, 1.5, NaN, {}]) {
	test(`an unusable member count (${String(count)}) falls back to 0 instead of failing`, () => {
		assert.equal(notificationHref({ ...backendPayload, memberCount: count }).params.memberCount, "0");
	});
}

test("a missing or blank group name falls back to a default; a real one is trimmed", () => {
	assert.equal(notificationHref({ ...backendPayload, groupName: undefined }).params.name, "Shopping list");
	assert.equal(notificationHref({ ...backendPayload, groupName: "   " }).params.name, "Shopping list");
	assert.equal(notificationHref({ ...backendPayload, groupName: "  Home  " }).params.name, "Home");
});

test("a group name is passed along as plain text, never interpreted", () => {
	const name = "../../Login?x=1&myRole=creator";

	assert.equal(notificationHref({ ...backendPayload, groupName: name }).params.name, name);
	assert.equal(notificationHref({ ...backendPayload, groupName: name }).pathname, "/group/list");
});

test("extra fields in the payload are ignored", () => {
	assert.deepEqual(
		Object.keys(notificationHref({ ...backendPayload, itemName: "x", extra: 1 }).params).sort(),
		["id", "memberCount", "myRole", "name"]
	);
});

// malformed notifications must be ignored (null), never open a wrong screen or throw

for (const [label, data] of [
	["no data", undefined],
	["null data", null],
	["a string", "items_added"],
	["a number", 42],
	["an array", [backendPayload]],
	["an empty object", {}],
]) {
	test(`malformed: ${label} is ignored`, () => {
		assert.equal(notificationHref(data), null);
	});
}

for (const type of [undefined, null, "", "item_removed", "item_modified", "ITEMS_ADDED", 5]) {
	test(`malformed: type ${JSON.stringify(type) ?? "missing"} is ignored`, () => {
		assert.equal(notificationHref({ ...backendPayload, type }), null);
	});
}

for (const groupId of [undefined, null, "", "   ", 123, {}, "short", "665f1c2a9b1e8a001234567", "665f1c2a9b1e8a00123456789", "zzzzzzzzzzzzzzzzzzzzzzzz", "../Home", "665f1c2a9b1e8a0012345678/../x"]) {
	test(`malformed: group id ${JSON.stringify(groupId) ?? "missing"} is ignored`, () => {
		assert.equal(notificationHref({ ...backendPayload, groupId }), null);
	});
}

test("an upper-case object id is accepted", () => {
	assert.equal(notificationHref({ ...backendPayload, groupId: GROUP_ID.toUpperCase() }).params.id, GROUP_ID.toUpperCase());
});

test("the helper never throws on hostile input", () => {
	const hostile = [Symbol.iterator, () => {}, new Date(), /x/, Object.create(null), { get type() { return "items_added"; }, groupId: GROUP_ID }];

	for (const data of hostile) assert.doesNotThrow(() => notificationHref(data));
});
