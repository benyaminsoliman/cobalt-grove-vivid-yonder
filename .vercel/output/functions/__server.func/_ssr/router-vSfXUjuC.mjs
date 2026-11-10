import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, _ as createFileRoute, b as require_jsx_runtime, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, v as createRootRoute, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as object, i as number, n as array, o as string, r as literal, s as union, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-vSfXUjuC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* Path-based preview hosts serve the dev server under `/{port_id}/` and strip
* that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
* prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
* client routing and generated links aligned with the public URL.
*/
var PATH_BASED_PREVIEW_HOSTS = /* @__PURE__ */ new Set([
	"preview.grok.genai.mil",
	"preview.grok.mil",
	"preview.grokgsac.com"
]);
var PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;
function previewPathPrefix(hostname, pathname) {
	if (!PATH_BASED_PREVIEW_HOSTS.has(hostname.toLowerCase())) return void 0;
	return PORT_ID_PREFIX.exec(pathname)?.[0];
}
function prefixRewrite(prefix) {
	return {
		input: ({ url }) => {
			if (url.pathname === prefix) url.pathname = "/";
			else if (url.pathname.startsWith(`${prefix}/`)) url.pathname = url.pathname.slice(prefix.length);
			return url;
		},
		output: ({ url }) => {
			url.pathname = `${prefix}${url.pathname}`;
			return url;
		}
	};
}
function previewPathRewrite() {
	if (typeof window === "undefined") return void 0;
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
	return prefix ? prefixRewrite(prefix) : void 0;
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-B_5XWfmT.css";
var Route$3 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Quill Desk" },
			{
				name: "description",
				content: "Outlook email assistant for OpenAI, Gemini, Claude, Grok, Qwen, DeepSeek, Copilot, and other models. Bring your own API key."
			},
			{
				name: "theme-color",
				content: "#f3efe6"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,520;9..144,640&display=swap"
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter = () => import("./routes-Fn9ATtOF.mjs");
var Route$2 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var PROVIDERS = [
	{
		id: "openai",
		name: "OpenAI",
		blurb: "ChatGPT models. Paste a secret key from the OpenAI platform.",
		keyLabel: "OpenAI API key",
		keyPlaceholder: "sk-…",
		docsUrl: "https://platform.openai.com/api-keys",
		docsLabel: "OpenAI API keys",
		protocol: "openai",
		endpoint: "https://api.openai.com/v1/chat/completions",
		models: [
			{
				id: "gpt-4.1",
				label: "GPT-4.1"
			},
			{
				id: "gpt-4.1-mini",
				label: "GPT-4.1 mini"
			},
			{
				id: "gpt-4.1-nano",
				label: "GPT-4.1 nano"
			},
			{
				id: "gpt-4o",
				label: "GPT-4o"
			},
			{
				id: "gpt-4o-mini",
				label: "GPT-4o mini"
			},
			{
				id: "gpt-5",
				label: "GPT-5"
			},
			{
				id: "gpt-5-mini",
				label: "GPT-5 mini"
			},
			{
				id: "gpt-5.1",
				label: "GPT-5.1"
			},
			{
				id: "gpt-5.2",
				label: "GPT-5.2"
			},
			{
				id: "gpt-5.4",
				label: "GPT-5.4"
			},
			{
				id: "o3",
				label: "o3"
			},
			{
				id: "o4-mini",
				label: "o4-mini"
			}
		],
		defaultModel: "gpt-4.1",
		domains: ["https://api.openai.com"],
		guid: "5d9f2031-7b4e-4c0f-9072-3e6b0d1f22b1",
		displayName: "OpenAI Email Assistant",
		description: "Summarize emails and draft replies with OpenAI. Bring your own API key.",
		buttonLabel: "OpenAI Assistant",
		tooltip: "Use your OpenAI key to summarize mail or draft a reply"
	},
	{
		id: "gemini",
		name: "Gemini",
		blurb: "Google Gemini. Use an AI Studio key.",
		keyLabel: "Gemini API key",
		keyPlaceholder: "AIza…",
		docsUrl: "https://aistudio.google.com/apikey",
		docsLabel: "Google AI Studio",
		protocol: "gemini",
		models: [
			{
				id: "gemini-2.5-flash",
				label: "Gemini 2.5 Flash"
			},
			{
				id: "gemini-2.5-pro",
				label: "Gemini 2.5 Pro"
			},
			{
				id: "gemini-2.5-flash-lite",
				label: "Gemini 2.5 Flash-Lite"
			},
			{
				id: "gemini-2.0-flash",
				label: "Gemini 2.0 Flash"
			},
			{
				id: "gemini-3-flash",
				label: "Gemini 3 Flash"
			},
			{
				id: "gemini-3-pro",
				label: "Gemini 3 Pro"
			},
			{
				id: "gemini-3.1-pro",
				label: "Gemini 3.1 Pro"
			}
		],
		defaultModel: "gemini-2.5-flash",
		domains: ["https://generativelanguage.googleapis.com"],
		guid: "6e0a3142-8c5f-4d10-a183-4f7c1e2033c2",
		displayName: "Gemini Email Assistant",
		description: "Summarize emails and draft replies with Gemini. Bring your own API key.",
		buttonLabel: "Gemini Assistant",
		tooltip: "Use your Gemini key to summarize mail or draft a reply"
	},
	{
		id: "claude",
		name: "Claude",
		blurb: "Anthropic Claude. Use a key from the Claude console.",
		keyLabel: "Anthropic API key",
		keyPlaceholder: "sk-ant-…",
		docsUrl: "https://console.anthropic.com/settings/keys",
		docsLabel: "Anthropic console",
		protocol: "anthropic",
		models: [
			{
				id: "claude-sonnet-4-5",
				label: "Claude Sonnet 4.5"
			},
			{
				id: "claude-opus-4-5",
				label: "Claude Opus 4.5"
			},
			{
				id: "claude-haiku-4-5",
				label: "Claude Haiku 4.5"
			},
			{
				id: "claude-sonnet-4-6",
				label: "Claude Sonnet 4.6"
			},
			{
				id: "claude-opus-4-6",
				label: "Claude Opus 4.6"
			},
			{
				id: "claude-sonnet-5",
				label: "Claude Sonnet 5"
			},
			{
				id: "claude-opus-5",
				label: "Claude Opus 5"
			},
			{
				id: "claude-haiku-4-5-20251001",
				label: "Claude Haiku 4.5 (dated)"
			}
		],
		defaultModel: "claude-sonnet-4-5",
		domains: ["https://api.anthropic.com"],
		guid: "913d6475-bf82-4043-94a6-72af415366f5",
		displayName: "Claude Email Assistant",
		description: "Summarize emails and draft replies with Claude. Bring your own API key.",
		buttonLabel: "Claude Assistant",
		tooltip: "Use your Anthropic key to summarize mail or draft a reply"
	},
	{
		id: "grok",
		name: "Grok",
		blurb: "xAI Grok. Use a key from the xAI console. Not the Grok chat login.",
		keyLabel: "xAI API key",
		keyPlaceholder: "xai-…",
		docsUrl: "https://console.x.ai/",
		docsLabel: "xAI console",
		protocol: "openai",
		endpoint: "https://api.x.ai/v1/chat/completions",
		models: [
			{
				id: "grok-4.5",
				label: "Grok 4.5"
			},
			{
				id: "grok-4",
				label: "Grok 4"
			},
			{
				id: "grok-4-fast",
				label: "Grok 4 Fast"
			},
			{
				id: "grok-3",
				label: "Grok 3"
			},
			{
				id: "grok-3-mini",
				label: "Grok 3 mini"
			},
			{
				id: "grok-4.1",
				label: "Grok 4.1"
			},
			{
				id: "grok-4.3",
				label: "Grok 4.3"
			}
		],
		defaultModel: "grok-4.5",
		domains: ["https://api.x.ai"],
		guid: "a24e7586-c093-4154-85b7-83b052647706",
		displayName: "Grok Email Assistant",
		description: "Summarize emails and draft replies with Grok. Bring your own xAI API key.",
		buttonLabel: "Grok Assistant",
		tooltip: "Use your xAI key to summarize mail or draft a reply"
	},
	{
		id: "deepseek",
		name: "DeepSeek",
		blurb: "DeepSeek chat and reasoner. deepseek-chat tracks their current default.",
		keyLabel: "DeepSeek API key",
		keyPlaceholder: "sk-…",
		docsUrl: "https://platform.deepseek.com/api_keys",
		docsLabel: "DeepSeek platform",
		protocol: "openai",
		endpoint: "https://api.deepseek.com/v1/chat/completions",
		models: [
			{
				id: "deepseek-chat",
				label: "DeepSeek Chat (current)"
			},
			{
				id: "deepseek-reasoner",
				label: "DeepSeek Reasoner"
			},
			{
				id: "deepseek-v4-flash",
				label: "DeepSeek V4 Flash"
			},
			{
				id: "deepseek-v4-pro",
				label: "DeepSeek V4 Pro"
			}
		],
		defaultModel: "deepseek-chat",
		domains: ["https://api.deepseek.com"],
		guid: "802c5364-ae71-4f32-8395-619e304255e4",
		displayName: "DeepSeek Email Assistant",
		description: "Summarize emails and draft replies with DeepSeek. Bring your own API key.",
		buttonLabel: "DeepSeek Assistant",
		tooltip: "Use your DeepSeek key to summarize mail or draft a reply"
	},
	{
		id: "qwen",
		name: "Qwen",
		blurb: "Alibaba Qwen via DashScope. International and China endpoints.",
		keyLabel: "DashScope API key",
		keyPlaceholder: "sk-…",
		docsUrl: "https://www.alibabacloud.com/help/en/model-studio/get-api-key",
		docsLabel: "Model Studio key help",
		protocol: "openai",
		defaultRegion: "intl",
		regions: [{
			id: "intl",
			label: "International",
			endpoint: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions"
		}, {
			id: "cn",
			label: "China (Beijing)",
			endpoint: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
		}],
		models: [
			{
				id: "qwen-plus",
				label: "Qwen Plus"
			},
			{
				id: "qwen-max",
				label: "Qwen Max"
			},
			{
				id: "qwen-turbo",
				label: "Qwen Turbo"
			},
			{
				id: "qwen-flash",
				label: "Qwen Flash"
			},
			{
				id: "qwen3-max",
				label: "Qwen3 Max"
			},
			{
				id: "qwen3.5-plus",
				label: "Qwen3.5 Plus"
			},
			{
				id: "qwen3-235b-a22b",
				label: "Qwen3 235B"
			}
		],
		defaultModel: "qwen-plus",
		domains: ["https://dashscope-intl.aliyuncs.com", "https://dashscope.aliyuncs.com"],
		guid: "7f1b4253-9d60-4e21-b294-508d2f3144d3",
		displayName: "Qwen Email Assistant",
		description: "Summarize emails and draft replies with Qwen. Bring your own DashScope key.",
		buttonLabel: "Qwen Assistant",
		tooltip: "Use your Qwen key to summarize mail or draft a reply"
	},
	{
		id: "copilot",
		name: "Copilot / Microsoft",
		blurb: "Microsoft 365 Copilot has no bring-your-own chat key. This uses GitHub Models or Azure OpenAI, the public Microsoft endpoints.",
		keyLabel: "Token or Azure key",
		keyPlaceholder: "github_pat_… or Azure key",
		docsUrl: "https://github.com/marketplace/models",
		docsLabel: "GitHub Models",
		protocol: "microsoft",
		models: [
			{
				id: "gpt-4o",
				label: "GPT-4o"
			},
			{
				id: "gpt-4o-mini",
				label: "GPT-4o mini"
			},
			{
				id: "gpt-4.1",
				label: "GPT-4.1"
			},
			{
				id: "gpt-4.1-mini",
				label: "GPT-4.1 mini"
			},
			{
				id: "Phi-4",
				label: "Phi-4"
			},
			{
				id: "Meta-Llama-3.3-70B-Instruct",
				label: "Llama 3.3 70B"
			},
			{
				id: "Mistral-large",
				label: "Mistral Large"
			}
		],
		defaultModel: "gpt-4o",
		domains: ["https://models.inference.ai.azure.com", "https://openai.azure.com"],
		guid: "b35f8697-d1a4-4265-96c8-94c163758817",
		displayName: "Copilot Email Assistant",
		description: "Summarize emails and draft replies with GitHub Models or Azure OpenAI. Bring your own key.",
		buttonLabel: "Copilot Assistant",
		tooltip: "Use GitHub Models or Azure OpenAI to summarize mail or draft a reply"
	},
	{
		id: "mistral",
		name: "Mistral",
		blurb: "Mistral La Plateforme. magistral and large models included.",
		keyLabel: "Mistral API key",
		keyPlaceholder: "…",
		docsUrl: "https://console.mistral.ai/api-keys",
		docsLabel: "Mistral console",
		protocol: "openai",
		endpoint: "https://api.mistral.ai/v1/chat/completions",
		models: [
			{
				id: "mistral-large-latest",
				label: "Mistral Large"
			},
			{
				id: "mistral-medium-latest",
				label: "Mistral Medium"
			},
			{
				id: "mistral-small-latest",
				label: "Mistral Small"
			},
			{
				id: "magistral-medium-latest",
				label: "Magistral Medium"
			},
			{
				id: "codestral-latest",
				label: "Codestral"
			},
			{
				id: "open-mistral-nemo",
				label: "Mistral Nemo"
			}
		],
		defaultModel: "mistral-small-latest",
		domains: ["https://api.mistral.ai"],
		guid: "c46097a8-e2b5-4376-a7d9-a5d274869928",
		displayName: "Mistral Email Assistant",
		description: "Summarize emails and draft replies with Mistral. Bring your own API key.",
		buttonLabel: "Mistral Assistant",
		tooltip: "Use your Mistral key to summarize mail or draft a reply"
	},
	{
		id: "groq",
		name: "Groq",
		blurb: "Fast open models on Groq. Useful when you want Llama, Qwen, or Kimi without each lab's key.",
		keyLabel: "Groq API key",
		keyPlaceholder: "gsk_…",
		docsUrl: "https://console.groq.com/keys",
		docsLabel: "Groq console",
		protocol: "openai",
		endpoint: "https://api.groq.com/openai/v1/chat/completions",
		models: [
			{
				id: "llama-3.3-70b-versatile",
				label: "Llama 3.3 70B"
			},
			{
				id: "llama-3.1-8b-instant",
				label: "Llama 3.1 8B"
			},
			{
				id: "meta-llama/llama-4-scout-17b-16e-instruct",
				label: "Llama 4 Scout"
			},
			{
				id: "qwen/qwen3-32b",
				label: "Qwen3 32B"
			},
			{
				id: "moonshotai/kimi-k2-instruct",
				label: "Kimi K2"
			},
			{
				id: "openai/gpt-oss-120b",
				label: "GPT-OSS 120B"
			}
		],
		defaultModel: "llama-3.3-70b-versatile",
		domains: ["https://api.groq.com"],
		guid: "d571a8b9-f3c6-4487-b8ea-b6e38597aa39",
		displayName: "Groq Email Assistant",
		description: "Summarize emails and draft replies with models hosted on Groq.",
		buttonLabel: "Groq Assistant",
		tooltip: "Use your Groq key to summarize mail or draft a reply"
	},
	{
		id: "openrouter",
		name: "OpenRouter",
		blurb: "One key, many labs. Model ids look like vendor/model. Paste any id from your dashboard.",
		keyLabel: "OpenRouter API key",
		keyPlaceholder: "sk-or-…",
		docsUrl: "https://openrouter.ai/keys",
		docsLabel: "OpenRouter keys",
		protocol: "openai",
		endpoint: "https://openrouter.ai/api/v1/chat/completions",
		models: [
			{
				id: "openai/gpt-4.1",
				label: "OpenAI GPT-4.1"
			},
			{
				id: "openai/gpt-4.1-mini",
				label: "OpenAI GPT-4.1 mini"
			},
			{
				id: "anthropic/claude-sonnet-4.5",
				label: "Claude Sonnet 4.5"
			},
			{
				id: "anthropic/claude-opus-4.5",
				label: "Claude Opus 4.5"
			},
			{
				id: "google/gemini-2.5-flash",
				label: "Gemini 2.5 Flash"
			},
			{
				id: "google/gemini-2.5-pro",
				label: "Gemini 2.5 Pro"
			},
			{
				id: "x-ai/grok-4",
				label: "Grok 4"
			},
			{
				id: "deepseek/deepseek-chat",
				label: "DeepSeek Chat"
			},
			{
				id: "qwen/qwen3-max",
				label: "Qwen3 Max"
			},
			{
				id: "meta-llama/llama-3.3-70b-instruct",
				label: "Llama 3.3 70B"
			},
			{
				id: "mistralai/mistral-large",
				label: "Mistral Large"
			}
		],
		defaultModel: "openai/gpt-4.1-mini",
		domains: ["https://openrouter.ai"],
		guid: "e682b9ca-04d7-4598-89fb-c7f496a8bb4a",
		displayName: "OpenRouter Email Assistant",
		description: "Summarize emails and draft replies through OpenRouter. One key, many models.",
		buttonLabel: "OpenRouter Assistant",
		tooltip: "Use your OpenRouter key to reach many models from one pane"
	},
	{
		id: "kimi",
		name: "Kimi",
		blurb: "Moonshot Kimi. Pick the international or China endpoint to match the key.",
		keyLabel: "Moonshot API key",
		keyPlaceholder: "sk-…",
		docsUrl: "https://platform.moonshot.cn/console/api-keys",
		docsLabel: "Moonshot console",
		protocol: "openai",
		defaultRegion: "intl",
		regions: [{
			id: "intl",
			label: "International",
			endpoint: "https://api.moonshot.ai/v1/chat/completions"
		}, {
			id: "cn",
			label: "China",
			endpoint: "https://api.moonshot.cn/v1/chat/completions"
		}],
		models: [
			{
				id: "moonshot-v1-auto",
				label: "Moonshot v1 auto"
			},
			{
				id: "moonshot-v1-8k",
				label: "Moonshot v1 8K"
			},
			{
				id: "moonshot-v1-32k",
				label: "Moonshot v1 32K"
			},
			{
				id: "moonshot-v1-128k",
				label: "Moonshot v1 128K"
			},
			{
				id: "kimi-k2-0711-preview",
				label: "Kimi K2"
			},
			{
				id: "kimi-latest",
				label: "Kimi latest"
			}
		],
		defaultModel: "moonshot-v1-auto",
		domains: ["https://api.moonshot.ai", "https://api.moonshot.cn"],
		guid: "f793c0db-15e8-46a9-9a0c-d805a7b9cc5b",
		displayName: "Kimi Email Assistant",
		description: "Summarize emails and draft replies with Kimi. Bring your own Moonshot key.",
		buttonLabel: "Kimi Assistant",
		tooltip: "Use your Moonshot key to summarize mail or draft a reply"
	},
	{
		id: "glm",
		name: "GLM",
		blurb: "Zhipu GLM on the BigModel API.",
		keyLabel: "BigModel API key",
		keyPlaceholder: "…",
		docsUrl: "https://open.bigmodel.cn/usercenter/apikeys",
		docsLabel: "BigModel keys",
		protocol: "openai",
		endpoint: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
		models: [
			{
				id: "glm-4-flash",
				label: "GLM-4 Flash"
			},
			{
				id: "glm-4-plus",
				label: "GLM-4 Plus"
			},
			{
				id: "glm-4.5",
				label: "GLM-4.5"
			},
			{
				id: "glm-4.6",
				label: "GLM-4.6"
			},
			{
				id: "glm-4.7",
				label: "GLM-4.7"
			},
			{
				id: "glm-5",
				label: "GLM-5"
			}
		],
		defaultModel: "glm-4-flash",
		domains: ["https://open.bigmodel.cn"],
		guid: "08a4d1ec-26f9-47ba-8b1d-e916b8cadc6c",
		displayName: "GLM Email Assistant",
		description: "Summarize emails and draft replies with GLM. Bring your own BigModel key.",
		buttonLabel: "GLM Assistant",
		tooltip: "Use your Zhipu key to summarize mail or draft a reply"
	},
	{
		id: "perplexity",
		name: "Perplexity",
		blurb: "Sonar models. They can pull in web context, so treat citations as leads, not proof.",
		keyLabel: "Perplexity API key",
		keyPlaceholder: "pplx-…",
		docsUrl: "https://www.perplexity.ai/settings/api",
		docsLabel: "Perplexity API settings",
		protocol: "openai",
		endpoint: "https://api.perplexity.ai/chat/completions",
		models: [
			{
				id: "sonar",
				label: "Sonar"
			},
			{
				id: "sonar-pro",
				label: "Sonar Pro"
			},
			{
				id: "sonar-reasoning",
				label: "Sonar Reasoning"
			},
			{
				id: "sonar-reasoning-pro",
				label: "Sonar Reasoning Pro"
			}
		],
		defaultModel: "sonar",
		domains: ["https://api.perplexity.ai"],
		guid: "19b5e2fd-370a-48cb-9c2e-fa27c9db0d7d",
		displayName: "Perplexity Email Assistant",
		description: "Summarize emails and draft replies with Perplexity Sonar. Bring your own API key.",
		buttonLabel: "Perplexity Assistant",
		tooltip: "Use your Perplexity key to summarize mail or draft a reply"
	}
];
function getProvider(id) {
	return PROVIDERS.find((provider) => provider.id === id);
}
function providerEndpoint(provider, region) {
	if (provider.regions && provider.regions.length > 0) return (provider.regions.find((item) => item.id === region) ?? provider.regions.find((item) => item.id === provider.defaultRegion) ?? provider.regions[0]).endpoint;
	if (!provider.endpoint) throw new Error(`${provider.name} has no endpoint.`);
	return provider.endpoint;
}
var ALL_DOMAINS = [...new Set(PROVIDERS.flatMap((provider) => provider.domains))];
var DEFAULT_INSTRUCTIONS = "You are a careful email assistant. Be concise and concrete. Do not invent facts, dates, or promises that are not in the mail. Do not add a subject line unless asked.";
function mailBlock(mail) {
	return `${mail.me ? `I am ${mail.me}.\n` : ""}From: ${mail.from || "Unknown"}\nSubject: ${mail.subject || "(no subject)"}\n\n${mail.body.trim()}`;
}
function actionPrompt(action, mail, extra) {
	const block = mailBlock(mail);
	switch (action) {
		case "summarize": return `Summarize this email in short bullets: what they want, any deadline, and what I should do next.\n\n${block}`;
		case "reply": return `Draft a reply from me to the sender. Plain prose, no subject line, no sign-off. Match their language. Do not invent commitments.\n\n${block}`;
		case "actions": return `List action items from this email. Each item: task, owner if stated, deadline if stated. If there are none, say so.\n\n${block}`;
		case "tone": return `In a few sentences, describe the tone of this email and how I should answer it.\n\n${block}`;
		case "translate": return `Translate this email into ${extra?.trim() || "English"}. Keep names, dates, and numbers exact.\n\n${block}`;
		case "custom": return `Email:\n${block}\n\nRequest: ${extra?.trim() || "Help me with this email."}`;
	}
}
var Route$1 = createFileRoute("/api/catalog")({ server: { handlers: { GET: () => new Response(JSON.stringify({
	instructions: DEFAULT_INSTRUCTIONS,
	providers: PROVIDERS
}), { headers: {
	"content-type": "application/json",
	"cache-control": "no-store"
} }) } } });
var hits = /* @__PURE__ */ new Map();
function rateLimited(ip) {
	const now = Date.now();
	const row = hits.get(ip);
	if (!row || now > row.reset) {
		hits.set(ip, {
			n: 1,
			reset: now + 6e4
		});
		return false;
	}
	row.n += 1;
	return row.n > 30;
}
function assertModel(model) {
	if (model.length < 1 || model.length > 120 || model.includes("..") || !/^[\w./:-]+$/.test(model)) throw new Error("Model id looks invalid. Use the list, or paste the id from the provider console.");
}
function buildAzureUrl(hostRaw, deployment) {
	let raw = hostRaw.trim();
	if (!raw) throw new Error("Enter your Azure resource host, for example my-resource.openai.azure.com.");
	if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
	let url;
	try {
		url = new URL(raw);
	} catch {
		throw new Error("That Azure host is not a valid address.");
	}
	if (url.protocol !== "https:") throw new Error("Azure host must use https.");
	const host = url.hostname.toLowerCase();
	if (!(host.endsWith(".openai.azure.com") || host.endsWith(".cognitiveservices.azure.com") || host.endsWith(".services.ai.azure.com"))) throw new Error("Host must be an Azure OpenAI resource, for example my-resource.openai.azure.com.");
	assertModel(deployment);
	return `https://${host}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=2024-10-21`;
}
function splitSystem(messages) {
	const system = messages.filter((message) => message.role === "system").map((message) => message.content.trim()).filter(Boolean).join("\n\n");
	const chat = messages.filter((message) => message.role !== "system").map((message) => ({
		role: message.role,
		content: message.content
	}));
	if (chat.length === 0) throw new Error("Nothing to send.");
	if (chat[0]?.role !== "user") throw new Error("The conversation has to start with your request.");
	return {
		system,
		chat
	};
}
function upstreamFor(input, provider) {
	const { system, chat } = splitSystem(input.messages);
	const model = input.model.trim();
	assertModel(model);
	if (provider.protocol === "anthropic") return {
		kind: "anthropic",
		url: "https://api.anthropic.com/v1/messages",
		headers: {
			"content-type": "application/json",
			"x-api-key": input.apiKey,
			"anthropic-version": "2023-06-01"
		},
		body: {
			model,
			max_tokens: 1400,
			system: system || void 0,
			messages: chat
		}
	};
	if (provider.protocol === "gemini") return {
		kind: "gemini",
		url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
		headers: {
			"content-type": "application/json",
			"x-goog-api-key": input.apiKey
		},
		body: {
			systemInstruction: system ? { parts: [{ text: system }] } : void 0,
			contents: chat.map((message) => ({
				role: message.role === "assistant" ? "model" : "user",
				parts: [{ text: message.content }]
			})),
			generationConfig: { maxOutputTokens: 1400 }
		}
	};
	let url;
	const headers = { "content-type": "application/json" };
	if (provider.protocol === "microsoft") {
		if (input.copilotMode === "azure") {
			url = buildAzureUrl(input.azureHost ?? "", model);
			headers["api-key"] = input.apiKey;
		} else {
			url = "https://models.inference.ai.azure.com/chat/completions";
			headers.authorization = `Bearer ${input.apiKey}`;
		}
	} else {
		url = providerEndpoint(provider, input.region);
		headers.authorization = `Bearer ${input.apiKey}`;
		if (provider.id === "openrouter") {
			headers["HTTP-Referer"] = input.referer || "https://quilldesk.app";
			headers["X-Title"] = "Quill Desk";
		}
	}
	const openaiMessages = [...system ? [{
		role: "system",
		content: system
	}] : [], ...chat];
	return {
		kind: "openai",
		url,
		headers,
		body: {
			model,
			messages: openaiMessages,
			max_tokens: 1400
		}
	};
}
function textFromPayload(kind, payload) {
	const data = payload;
	if (kind === "anthropic") {
		const text = (data.content ?? []).map((part) => part.text ?? "").join("").trim();
		if (text) return text;
	} else if (kind === "gemini") {
		const text = (data.candidates?.[0]?.content?.parts ?? []).map((part) => part.text ?? "").join("").trim();
		if (text) return text;
		if (data.promptFeedback?.blockReason) throw new Error(`Gemini blocked the request (${data.promptFeedback.blockReason}).`);
	} else {
		const content = data.choices?.[0]?.message?.content;
		if (typeof content === "string" && content.trim()) return content.trim();
		if (Array.isArray(content)) {
			const text = content.map((part) => {
				if (typeof part === "string") return part;
				if (part && typeof part === "object" && "text" in part && typeof part.text === "string") return part.text;
				return "";
			}).join("").trim();
			if (text) return text;
		}
	}
	throw new Error("The model returned an empty reply.");
}
async function readError(response) {
	const raw = await response.text();
	try {
		const parsed = JSON.parse(raw);
		if (typeof parsed.error === "string" && parsed.error) return parsed.error;
		if (parsed.error && typeof parsed.error === "object" && parsed.error.message) return parsed.error.message;
		if (parsed.message) return parsed.message;
	} catch {}
	return raw.slice(0, 400) || `The provider returned ${response.status}.`;
}
async function postUpstream(target) {
	const response = await fetch(target.url, {
		method: "POST",
		headers: target.headers,
		body: JSON.stringify(target.body),
		redirect: "error",
		signal: AbortSignal.timeout(5e4)
	});
	if (!response.ok) {
		const message = await readError(response);
		const error = new Error(message.replace(/\s+/g, " ").slice(0, 500));
		error.status = response.status;
		throw error;
	}
	return response.json();
}
async function completeChat(input) {
	const provider = getProvider(input.providerId);
	if (!provider) throw new Error("Unknown provider.");
	const key = input.apiKey.trim();
	if (key.length < 6) throw new Error("Enter the API key for this provider.");
	if (key.length > 500 || /[\r\n]/.test(key)) throw new Error("That API key does not look valid.");
	if (input.messages.reduce((sum, message) => sum + message.content.length, 0) > 6e4) throw new Error("That email is too long to send. Trim it and try again.");
	const target = upstreamFor({
		...input,
		apiKey: key
	}, provider);
	try {
		const payload = await postUpstream(target);
		return textFromPayload(target.kind, payload);
	} catch (error) {
		const message = error instanceof Error ? error.message : "The provider request failed.";
		const status = error instanceof Error ? error.status : void 0;
		const openaiBody = target.body;
		if (target.kind === "openai" && status === 400 && /max_tokens/i.test(message) && openaiBody.max_tokens) return textFromPayload("openai", await postUpstream({
			...target,
			body: {
				model: openaiBody.model,
				messages: openaiBody.messages,
				max_completion_tokens: openaiBody.max_tokens
			}
		}));
		if (/model/i.test(message) && /(not found|does not exist|invalid|unknown)/i.test(message)) throw new Error(`${message} Paste the exact model id from the provider console into Model id.`);
		throw error instanceof Error ? error : new Error(message);
	}
}
var bodySchema = object({
	providerId: string().min(1).max(40),
	model: string().min(1).max(120),
	apiKey: string().min(6).max(500),
	region: string().max(20).optional(),
	copilotMode: _enum(["github", "azure"]).optional(),
	azureHost: string().max(300).optional(),
	messages: array(object({
		role: _enum([
			"system",
			"user",
			"assistant"
		]),
		content: string().min(1).max(3e4)
	})).min(1).max(20)
});
function clientIp(request) {
	const forwarded = request.headers.get("x-forwarded-for");
	if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
	return "local";
}
function json(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"content-type": "application/json",
			"cache-control": "no-store"
		}
	});
}
var Route = createFileRoute("/api/complete")({ server: { handlers: { POST: async ({ request }) => {
	if (rateLimited(clientIp(request))) return json({ error: "Too many requests. Wait a minute and try again." }, 429);
	let raw;
	try {
		const text = await request.text();
		if (text.length > 2e5) return json({ error: "Request is too large." }, 413);
		raw = JSON.parse(text);
	} catch {
		return json({ error: "The request was not valid JSON." }, 400);
	}
	const parsed = bodySchema.safeParse(raw);
	if (!parsed.success) return json({ error: "Check the provider, model, and API key." }, 400);
	try {
		return json({ text: await completeChat({
			...parsed.data,
			referer: request.headers.get("origin") ?? void 0
		}) });
	} catch (error) {
		const message = error instanceof Error ? error.message : "The provider request failed.";
		console.error("[complete]", parsed.data.providerId, message.slice(0, 180));
		return json({ error: message }, 502);
	}
} } } });
var rootRouteChildren = {
	IndexRoute: Route$2.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$3
	}),
	ApiCatalogRoute: Route$1.update({
		id: "/api/catalog",
		path: "/api/catalog",
		getParentRoute: () => Route$3
	}),
	ApiCompleteRoute: Route.update({
		id: "/api/complete",
		path: "/api/complete",
		getParentRoute: () => Route$3
	})
};
var routeTree = Route$3._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		rewrite: previewPathRewrite(),
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { PROVIDERS as a, previewPathPrefix as c, ALL_DOMAINS as i, DEFAULT_INSTRUCTIONS as n, actionPrompt as r, getProvider as s, router_exports as t };
