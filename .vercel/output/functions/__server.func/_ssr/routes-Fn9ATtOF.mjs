import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Check, i as Copy, n as PenLine, r as Download } from "../_libs/lucide-react.mjs";
import { a as PROVIDERS, c as previewPathPrefix, i as ALL_DOMAINS, n as DEFAULT_INSTRUCTIONS, r as actionPrompt, s as getProvider } from "./router-vSfXUjuC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Fn9ATtOF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function xmlEscape(value) {
	return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function normalizeBase(input) {
	const trimmed = input.trim();
	if (!trimmed) return null;
	let url;
	try {
		url = new URL(trimmed);
	} catch {
		return null;
	}
	if (url.protocol !== "https:" && url.protocol !== "http:") return null;
	const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
	if (url.protocol === "http:" && !local) return null;
	const path = url.pathname.replace(/\/+$/, "");
	return `${url.origin}${path === "/" ? "" : path}`;
}
function manifestTargets() {
	return [{
		id: "all",
		fileName: "manifest-all-models.xml",
		title: "All models",
		blurb: "One ribbon button. Pick OpenAI, Gemini, Claude, Grok, and the rest inside the pane."
	}, ...PROVIDERS.map((provider) => ({
		id: provider.id,
		fileName: `manifest-${provider.id}.xml`,
		title: provider.displayName,
		blurb: provider.blurb
	}))];
}
function icon(base, id, size) {
	return xmlEscape(`${base}/addin/icons/${id}-${size}.png`);
}
function buildManifest(providerId, baseInput) {
	const base = normalizeBase(baseInput);
	if (!base) throw new Error("Enter an https address (http://localhost is allowed for a local sideload).");
	const provider = providerId === "all" ? void 0 : getProvider(providerId);
	if (providerId !== "all" && !provider) throw new Error("Unknown provider.");
	const id = provider?.id ?? "all";
	const guid = provider?.guid ?? "4c8e1f20-6a3d-4b9e-8f71-2d5a9c0e11a0";
	const displayName = provider?.displayName ?? "Quill Desk";
	const description = provider?.description ?? "Summarize emails and draft replies with OpenAI, Gemini, Claude, Grok, Qwen, DeepSeek, Copilot, and other models. Bring your own API keys.";
	const button = provider?.buttonLabel ?? "Quill Desk";
	const tooltip = provider?.tooltip ?? "Summarize the open email or draft a reply with the model you choose";
	const group = provider ? provider.name : "Quill Desk";
	const domains = provider ? provider.domains : ALL_DOMAINS;
	const taskpaneXml = xmlEscape(provider ? `${base}/addin/taskpane.html?provider=${provider.id}` : `${base}/addin/taskpane.html`);
	const support = xmlEscape(base || "https://quilldesk.app");
	const domainXml = domains.map((domain) => `    <AppDomain>${xmlEscape(domain)}</AppDomain>`).join("\n");
	return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<OfficeApp xmlns="http://schemas.microsoft.com/office/appforoffice/1.1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bt="http://schemas.microsoft.com/office/officeappbasictypes/1.0"
  xmlns:mailappor="http://schemas.microsoft.com/office/mailappversionoverrides/1.0" xsi:type="MailApp">
  <Id>${guid}</Id>
  <Version>1.0.0.0</Version>
  <ProviderName>Quill Desk</ProviderName>
  <DefaultLocale>en-US</DefaultLocale>
  <DisplayName DefaultValue="${xmlEscape(displayName)}"/>
  <Description DefaultValue="${xmlEscape(description)}"/>
  <IconUrl DefaultValue="${icon(base, id, 32)}"/>
  <HighResolutionIconUrl DefaultValue="${icon(base, id, 64)}"/>
  <SupportUrl DefaultValue="${support}"/>
  <AppDomains>
${domainXml}
  </AppDomains>
  <Hosts>
    <Host Name="Mailbox"/>
  </Hosts>
  <Requirements>
    <Sets>
      <Set Name="Mailbox" MinVersion="1.1"/>
    </Sets>
  </Requirements>
  <FormSettings>
    <Form xsi:type="ItemRead">
      <DesktopSettings>
        <SourceLocation DefaultValue="${taskpaneXml}"/>
        <RequestedHeight>450</RequestedHeight>
      </DesktopSettings>
    </Form>
  </FormSettings>
  <Permissions>ReadWriteItem</Permissions>
  <Rule xsi:type="RuleCollection" Mode="Or">
    <Rule xsi:type="ItemIs" ItemType="Message" FormType="Read"/>
    <Rule xsi:type="ItemIs" ItemType="Message" FormType="Edit"/>
  </Rule>
  <DisableEntityHighlighting>false</DisableEntityHighlighting>
  <VersionOverrides xmlns="http://schemas.microsoft.com/office/mailappversionoverrides" xsi:type="VersionOverridesV1_0">
    <Requirements>
      <bt:Sets DefaultMinVersion="1.3">
        <bt:Set Name="Mailbox"/>
      </bt:Sets>
    </Requirements>
    <Hosts>
      <Host xsi:type="MailHost">
        <DesktopFormFactor>
          <ExtensionPoint xsi:type="MessageReadCommandSurface">
            <OfficeTab id="TabDefault">
              <Group id="msgReadGroup_${id}">
                <Label resid="GroupLabel"/>
                <Control xsi:type="Button" id="msgReadOpenPaneButton_${id}">
                  <Label resid="TaskpaneButton.Label"/>
                  <Supertip>
                    <Title resid="TaskpaneButton.Label"/>
                    <Description resid="TaskpaneButton.Tooltip"/>
                  </Supertip>
                  <Icon>
                    <bt:Image size="16" resid="Icon.16x16"/>
                    <bt:Image size="32" resid="Icon.32x32"/>
                    <bt:Image size="80" resid="Icon.80x80"/>
                  </Icon>
                  <Action xsi:type="ShowTaskpane">
                    <SourceLocation resid="Taskpane.Url"/>
                  </Action>
                </Control>
              </Group>
            </OfficeTab>
          </ExtensionPoint>
          <ExtensionPoint xsi:type="MessageComposeCommandSurface">
            <OfficeTab id="TabDefault">
              <Group id="msgComposeGroup_${id}">
                <Label resid="GroupLabel"/>
                <Control xsi:type="Button" id="msgComposeOpenPaneButton_${id}">
                  <Label resid="TaskpaneButton.Label"/>
                  <Supertip>
                    <Title resid="TaskpaneButton.Label"/>
                    <Description resid="TaskpaneButton.Tooltip"/>
                  </Supertip>
                  <Icon>
                    <bt:Image size="16" resid="Icon.16x16"/>
                    <bt:Image size="32" resid="Icon.32x32"/>
                    <bt:Image size="80" resid="Icon.80x80"/>
                  </Icon>
                  <Action xsi:type="ShowTaskpane">
                    <SourceLocation resid="Taskpane.Url"/>
                  </Action>
                </Control>
              </Group>
            </OfficeTab>
          </ExtensionPoint>
        </DesktopFormFactor>
      </Host>
    </Hosts>
    <Resources>
      <bt:Images>
        <bt:Image id="Icon.16x16" DefaultValue="${icon(base, id, 16)}"/>
        <bt:Image id="Icon.32x32" DefaultValue="${icon(base, id, 32)}"/>
        <bt:Image id="Icon.80x80" DefaultValue="${icon(base, id, 80)}"/>
      </bt:Images>
      <bt:Urls>
        <bt:Url id="Taskpane.Url" DefaultValue="${taskpaneXml}"/>
      </bt:Urls>
      <bt:ShortStrings>
        <bt:String id="GroupLabel" DefaultValue="${xmlEscape(group)}"/>
        <bt:String id="TaskpaneButton.Label" DefaultValue="${xmlEscape(button)}"/>
      </bt:ShortStrings>
      <bt:LongStrings>
        <bt:String id="TaskpaneButton.Tooltip" DefaultValue="${xmlEscape(tooltip)}"/>
      </bt:LongStrings>
    </Resources>
  </VersionOverrides>
</OfficeApp>
`;
}
function installNotes(base) {
	return `Quill Desk — Outlook sideload
================================

Host used in these manifests:
${base}

1. Install "manifest-all-models.xml" if you want every provider in one ribbon button.
   Or install a single manifest-*.xml if you want a separate button per lab.
2. Outlook on the web or the new Outlook: Get Add-ins → My add-ins →
   Add a custom add-in → Add from file. Choose the XML.
   Classic Outlook on Windows: File → Get Add-ins, then the same My add-ins path.
   Outlook on Mac: Get Add-ins from the ribbon, then Add from file.
3. Open a message, click the new ribbon button, paste the API key for that
   provider, and use Summarize, Draft reply, Action items, or your own prompt.
4. Keys are stored only in that browser/webview. They are sent to this app,
   which forwards them to the provider. They are not written to a database.

Microsoft 365 admins can deploy the same XML from the admin center
(Settings → Integrated apps → Upload custom apps).

If you publish Quill Desk to a new address, download the manifests again
so every icon and task-pane link points at that address.

Copilot note: Microsoft 365 Copilot does not hand out a chat API key.
The Copilot manifest uses GitHub Models (a GitHub token) or Azure OpenAI
(your resource host + deployment name + key).
`;
}
function previewPrefix() {
	if (typeof window === "undefined") return "";
	return previewPathPrefix(window.location.hostname, window.location.pathname) ?? "";
}
function publicBase() {
	if (typeof window === "undefined") return "";
	return `${window.location.origin}${previewPrefix()}`;
}
function apiUrl(path) {
	const normalized = path.startsWith("/") ? path : `/${path}`;
	return `${previewPrefix()}${normalized}`;
}
var STORAGE_KEY = "quill-desk-v1";
function defaultSettings() {
	return {
		providerId: "openai",
		modelByProvider: {},
		customByProvider: {},
		keyByProvider: {},
		regionByProvider: {},
		copilotMode: "github",
		azureHost: "",
		instructions: ""
	};
}
function loadSettings() {
	if (typeof localStorage === "undefined") return defaultSettings();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return defaultSettings();
		const parsed = JSON.parse(raw);
		return {
			...defaultSettings(),
			...parsed,
			modelByProvider: parsed.modelByProvider ?? {},
			customByProvider: parsed.customByProvider ?? {},
			keyByProvider: parsed.keyByProvider ?? {},
			regionByProvider: parsed.regionByProvider ?? {},
			copilotMode: parsed.copilotMode === "azure" ? "azure" : "github",
			instructions: typeof parsed.instructions === "string" ? parsed.instructions : "",
			azureHost: typeof parsed.azureHost === "string" ? parsed.azureHost : "",
			providerId: typeof parsed.providerId === "string" ? parsed.providerId : "openai"
		};
	} catch {
		return defaultSettings();
	}
}
function saveSettings(settings) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
function instructionText(settings) {
	const custom = settings.instructions.trim();
	return custom ? `${DEFAULT_INSTRUCTIONS}\n\n${custom}` : DEFAULT_INSTRUCTIONS;
}
var CRC_TABLE = (() => {
	const table = /* @__PURE__ */ new Uint32Array(256);
	for (let n = 0; n < 256; n += 1) {
		let c = n;
		for (let k = 0; k < 8; k += 1) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
		table[n] = c >>> 0;
	}
	return table;
})();
function crc32(data) {
	let c = 4294967295;
	for (let i = 0; i < data.length; i += 1) c = CRC_TABLE[(c ^ data[i]) & 255] ^ c >>> 8;
	return (c ^ 4294967295) >>> 0;
}
function makeZip(files) {
	const encoder = new TextEncoder();
	const locals = [];
	const centrals = [];
	let offset = 0;
	for (const file of files) {
		const name = encoder.encode(file.name);
		const data = encoder.encode(file.text);
		const crc = crc32(data);
		const local = new Uint8Array(30 + name.length + data.length);
		const view = new DataView(local.buffer);
		view.setUint32(0, 67324752, true);
		view.setUint16(4, 20, true);
		view.setUint32(14, crc, true);
		view.setUint32(18, data.length, true);
		view.setUint32(22, data.length, true);
		view.setUint16(26, name.length, true);
		local.set(name, 30);
		local.set(data, 30 + name.length);
		locals.push(local);
		const central = new Uint8Array(46 + name.length);
		const centralView = new DataView(central.buffer);
		centralView.setUint32(0, 33639248, true);
		centralView.setUint16(4, 20, true);
		centralView.setUint16(6, 20, true);
		centralView.setUint32(16, crc, true);
		centralView.setUint32(20, data.length, true);
		centralView.setUint32(24, data.length, true);
		centralView.setUint16(28, name.length, true);
		centralView.setUint32(42, offset, true);
		central.set(name, 46);
		centrals.push(central);
		offset += local.length;
	}
	const centralSize = centrals.reduce((sum, part) => sum + part.length, 0);
	const end = /* @__PURE__ */ new Uint8Array(22);
	const endView = new DataView(end.buffer);
	endView.setUint32(0, 101010256, true);
	endView.setUint16(8, files.length, true);
	endView.setUint16(10, files.length, true);
	endView.setUint32(12, centralSize, true);
	endView.setUint32(16, offset, true);
	const out = new Uint8Array(offset + centralSize + end.length);
	let cursor = 0;
	for (const part of [
		...locals,
		...centrals,
		end
	]) {
		out.set(part, cursor);
		cursor += part.length;
	}
	return out;
}
var SAMPLE = {
	from: "Marta Almeida <marta@norte-supply.example>",
	subject: "Revised ship date for the Lisbon fixtures",
	body: `Hello,

The anodized brackets for the Lisbon lobby will leave our warehouse on 18 November, not the 12th. Customs asked for the mill certificates again, and the reprint added four working days.

Please confirm you can still receive them at the Rua da Prata dock on the 20th between 08:00 and 11:00. If that window is gone, send two other mornings next week.

The invoice for the deposit is attached in the real thread. Nothing is due until the crates clear.

Thanks,
Marta`
};
var LANGUAGES = [
	"English",
	"Spanish",
	"French",
	"German",
	"Portuguese",
	"Arabic",
	"Chinese",
	"Japanese",
	"Hindi",
	"Korean"
];
function downloadBlob(filename, blob) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}
function effectiveModel(provider, settings) {
	const custom = settings.customByProvider[provider.id]?.trim();
	if (custom) return custom;
	return settings.modelByProvider[provider.id] || provider.defaultModel;
}
function Desk() {
	const [tab, setTab] = (0, import_react.useState)("assist");
	const [settings, setSettings] = (0, import_react.useState)(defaultSettings);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const [customOpen, setCustomOpen] = (0, import_react.useState)({});
	const [baseInput, setBaseInput] = (0, import_react.useState)("");
	const [manifestId, setManifestId] = (0, import_react.useState)("all");
	const [mail, setMail] = (0, import_react.useState)(SAMPLE);
	const [custom, setCustom] = (0, import_react.useState)("");
	const [language, setLanguage] = (0, import_react.useState)("Spanish");
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [output, setOutput] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [notice, setNotice] = (0, import_react.useState)("");
	const [followup, setFollowup] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setSettings(loadSettings());
		setBaseInput(publicBase());
		setHydrated(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (hydrated) saveSettings(settings);
	}, [settings, hydrated]);
	const provider = getProvider(settings.providerId) ?? PROVIDERS[0];
	const model = effectiveModel(provider, settings);
	const base = normalizeBase(baseInput);
	const targets = manifestTargets();
	const listedModel = settings.modelByProvider[provider.id] || provider.defaultModel;
	const inList = provider.models.some((item) => item.id === listedModel);
	const usingCustom = Boolean(customOpen[provider.id]) || Boolean(settings.customByProvider[provider.id]?.trim()) || !inList;
	const xml = (0, import_react.useMemo)(() => {
		if (!base) return "";
		try {
			return buildManifest(manifestId, base);
		} catch (err) {
			return err instanceof Error ? err.message : "Could not build that manifest.";
		}
	}, [base, manifestId]);
	function patch(partial) {
		setSettings((current) => ({
			...current,
			...partial
		}));
	}
	function setProviderId(providerId) {
		patch({ providerId });
		setMessages([]);
		setOutput("");
		setError("");
	}
	async function run(action, extra) {
		if (!mail.body.trim()) {
			setError("Paste an email first.");
			return;
		}
		const key = settings.keyByProvider[provider.id]?.trim() ?? "";
		if (key.length < 6) {
			setError(`Add a ${provider.name} API key. It stays in this browser.`);
			return;
		}
		if (provider.id === "copilot" && settings.copilotMode === "azure" && !settings.azureHost.trim()) {
			setError("Enter the Azure host, for example my-resource.openai.azure.com.");
			return;
		}
		const prompt = actionPrompt(action, mail, extra);
		const next = [{
			role: "system",
			content: instructionText(settings)
		}, {
			role: "user",
			content: prompt
		}];
		setMessages(next);
		await send(next, key);
	}
	async function sendFollowup() {
		const note = followup.trim();
		if (!note || messages.length === 0) return;
		const key = settings.keyByProvider[provider.id]?.trim() ?? "";
		const next = [
			...messages,
			{
				role: "assistant",
				content: output
			},
			{
				role: "user",
				content: note
			}
		];
		setFollowup("");
		setMessages(next);
		await send(next, key);
	}
	async function send(next, key) {
		setBusy(true);
		setError("");
		try {
			const response = await fetch(apiUrl("/api/complete"), {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					providerId: provider.id,
					model,
					apiKey: key,
					region: settings.regionByProvider[provider.id] || provider.defaultRegion,
					copilotMode: settings.copilotMode,
					azureHost: settings.azureHost,
					messages: next
				})
			});
			const data = await response.json().catch(() => ({}));
			if (!response.ok || !data.text) throw new Error(data.error || "The model did not answer.");
			setOutput(data.text);
		} catch (err) {
			setError(err instanceof Error ? err.message : "The request failed.");
		} finally {
			setBusy(false);
		}
	}
	async function copyOutput() {
		if (!output) return;
		await navigator.clipboard.writeText(output);
		setNotice("reply");
		window.setTimeout(() => setNotice(""), 1600);
	}
	function downloadOne() {
		if (!base || !xml.startsWith("<?xml")) return;
		downloadBlob(targets.find((item) => item.id === manifestId)?.fileName ?? "manifest.xml", new Blob([xml], { type: "application/xml" }));
	}
	function downloadAll() {
		if (!base) return;
		const files = targets.map((target) => ({
			name: target.fileName,
			text: buildManifest(target.id, base)
		}));
		files.push({
			name: "INSTALL.txt",
			text: installNotes(base)
		});
		const bytes = makeZip(files);
		const copy = new Uint8Array(bytes.byteLength);
		copy.set(bytes);
		downloadBlob("quill-desk-manifests.zip", new Blob([copy], { type: "application/zip" }));
	}
	async function copyXml() {
		if (!xml.startsWith("<?xml")) return;
		await navigator.clipboard.writeText(xml);
		setNotice("xml");
		window.setTimeout(() => setNotice(""), 1600);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 sm:py-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mb-6 flex flex-wrap items-end justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-11 items-center justify-center rounded-xl bg-seal text-sealfg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, {
						className: "size-5",
						"aria-hidden": "true"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl leading-none font-medium tracking-tight",
					children: "Quill Desk"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Your key. Their model. The open email."
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex rounded-full bg-card p-1 ring-1 ring-line",
				role: "tablist",
				"aria-label": "Sections",
				children: [[["assist", "Assistant"], ["manifest", "Outlook manifests"]].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					role: "tab",
					"aria-selected": tab === id,
					className: `h-10 rounded-full px-4 text-sm font-medium lg:hidden ${tab === id ? "bg-seal text-sealfg" : "text-ink"}`,
					onClick: () => setTab(id),
					children: label
				}, id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "hidden px-3 py-2 text-sm text-muted lg:block",
					children: "Assistant and sideload files, side by side"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: tab === "assist" ? "block" : "hidden lg:block",
				"aria-label": "Email assistant",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl bg-card p-4 ring-1 ring-line sm:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "grid gap-1 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: "Provider"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: "h-11 rounded-lg border border-line bg-paper px-3",
									value: provider.id,
									onChange: (event) => setProviderId(event.target.value),
									children: PROVIDERS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: item.id,
										children: item.name
									}, item.id))
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "grid gap-1 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: provider.id === "copilot" && settings.copilotMode === "azure" ? "Deployment name" : "Model"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "h-11 rounded-lg border border-line bg-paper px-3",
									value: usingCustom ? "__custom__" : listedModel,
									onChange: (event) => {
										const value = event.target.value;
										if (value === "__custom__") {
											setCustomOpen((current) => ({
												...current,
												[provider.id]: true
											}));
											return;
										}
										setCustomOpen((current) => ({
											...current,
											[provider.id]: false
										}));
										patch({
											modelByProvider: {
												...settings.modelByProvider,
												[provider.id]: value
											},
											customByProvider: {
												...settings.customByProvider,
												[provider.id]: ""
											}
										});
									},
									children: [provider.models.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: item.id,
										children: item.label
									}, item.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "__custom__",
										children: "Other model id…"
									})]
								})]
							})]
						}),
						usingCustom ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-3 grid gap-1 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: "Model id"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "h-11 rounded-lg border border-line bg-paper px-3",
								value: settings.customByProvider[provider.id] ?? "",
								placeholder: "Exact id from the provider console",
								onChange: (event) => patch({ customByProvider: {
									...settings.customByProvider,
									[provider.id]: event.target.value
								} })
							})]
						}) : null,
						provider.regions ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-3 grid gap-1 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: "Endpoint region"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "h-11 rounded-lg border border-line bg-paper px-3",
								value: settings.regionByProvider[provider.id] || provider.defaultRegion,
								onChange: (event) => patch({ regionByProvider: {
									...settings.regionByProvider,
									[provider.id]: event.target.value
								} }),
								children: provider.regions.map((region) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: region.id,
									children: region.label
								}, region.id))
							})]
						}) : null,
						provider.id === "copilot" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex rounded-full bg-paper p-1 ring-1 ring-line",
								children: [["github", "GitHub Models"], ["azure", "Azure OpenAI"]].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: `h-10 flex-1 rounded-full px-3 text-sm font-medium ${settings.copilotMode === id ? "bg-seal text-sealfg" : "text-ink"}`,
									onClick: () => patch({ copilotMode: id }),
									children: label
								}, id))
							}), settings.copilotMode === "azure" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "grid gap-1 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: "Azure host"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "h-11 rounded-lg border border-line bg-paper px-3",
									value: settings.azureHost,
									placeholder: "my-resource.openai.azure.com",
									onChange: (event) => patch({ azureHost: event.target.value })
								})]
							}) : null]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-relaxed text-muted",
							children: provider.blurb
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-3 grid gap-1 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center justify-between gap-3 font-medium",
								children: [provider.keyLabel, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									className: "font-normal text-seal underline-offset-2 hover:underline",
									href: provider.docsUrl,
									target: "_blank",
									rel: "noreferrer",
									children: provider.docsLabel
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "password",
								autoComplete: "off",
								className: "h-11 rounded-lg border border-line bg-paper px-3",
								placeholder: provider.keyPlaceholder,
								value: settings.keyByProvider[provider.id] ?? "",
								onChange: (event) => patch({ keyByProvider: {
									...settings.keyByProvider,
									[provider.id]: event.target.value
								} })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							className: "mt-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
								className: "font-medium",
								children: "Standing instructions"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: "mt-2 min-h-24 w-full rounded-lg border border-line bg-paper px-3 py-2",
								placeholder: "Example: reply in short bullets, never promise a date, sign off is added by Outlook.",
								value: settings.instructions,
								onChange: (event) => patch({ instructions: event.target.value })
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 rounded-2xl bg-card p-4 ring-1 ring-line sm:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-xl font-medium",
								children: "Open mail"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-sm font-medium text-seal",
								onClick: () => setMail(SAMPLE),
								children: "Load sample"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: "From"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "h-11 rounded-lg border border-line bg-paper px-3",
								value: mail.from,
								onChange: (event) => setMail({
									...mail,
									from: event.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-3 grid gap-1 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: "Subject"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "h-11 rounded-lg border border-line bg-paper px-3",
								value: mail.subject,
								onChange: (event) => setMail({
									...mail,
									subject: event.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-3 grid gap-1 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: "Body"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: "min-h-40 w-full rounded-lg border border-line bg-paper px-3 py-2",
								maxLength: 2e4,
								value: mail.body,
								onChange: (event) => setMail({
									...mail,
									body: event.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 grid grid-cols-2 gap-2",
							children: [
								["summarize", "Summarize"],
								["reply", "Draft reply"],
								["actions", "Action items"],
								["tone", "Read the tone"]
							].map(([action, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: busy,
								className: "h-11 rounded-lg bg-seal px-3 text-sm font-medium text-sealfg disabled:opacity-50",
								onClick: () => void run(action),
								children: label
							}, action))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "sr-only",
									htmlFor: "language",
									children: "Translate into"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									id: "language",
									className: "h-11 rounded-lg border border-line bg-paper px-3 text-sm",
									value: language,
									onChange: (event) => setLanguage(event.target.value),
									children: LANGUAGES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: busy,
									className: "h-11 flex-1 rounded-lg border border-line bg-paper px-3 text-sm font-medium disabled:opacity-50",
									onClick: () => void run("translate", language),
									children: "Translate"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-3 grid gap-1 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: "Ask something else"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: "min-h-20 w-full rounded-lg border border-line bg-paper px-3 py-2",
								placeholder: "What is she actually asking me to decide?",
								value: custom,
								onChange: (event) => setCustom(event.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: busy,
							className: "mt-2 h-11 w-full rounded-lg bg-ink text-sm font-medium text-paper disabled:opacity-50",
							onClick: () => void run("custom", custom),
							children: busy ? "Writing…" : "Send"
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 rounded-lg bg-danger px-3 py-2 text-sm text-dangerfg",
							role: "alert",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 border-t border-line pt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-xl font-medium",
										children: "Reply"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "inline-flex h-10 items-center gap-1 text-sm font-medium text-seal disabled:opacity-50",
										onClick: () => void copyOutput(),
										disabled: !output,
										children: [notice === "reply" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
											className: "size-4",
											"aria-hidden": "true"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
											className: "size-4",
											"aria-hidden": "true"
										}), notice === "reply" ? "Copied" : "Copy"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "min-h-28 rounded-lg bg-paper px-3 py-3 text-sm leading-relaxed whitespace-pre-wrap",
									children: output || (busy ? "Writing…" : "Summaries, drafts, and action lists land here. Inside Outlook, the same pane can insert a draft into the message.")
								}),
								output ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "sr-only",
											htmlFor: "followup",
											children: "Follow-up"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "followup",
											className: "h-11 min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 text-sm",
											placeholder: "Shorter, and don’t mention customs",
											value: followup,
											onChange: (event) => setFollowup(event.target.value),
											onKeyDown: (event) => {
												if (event.key === "Enter") sendFollowup();
											}
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "h-11 rounded-lg bg-seal px-4 text-sm font-medium text-sealfg disabled:opacity-50",
											disabled: busy,
											onClick: () => void sendFollowup(),
											children: "Revise"
										})
									]
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 text-xs leading-relaxed text-muted",
									children: [
										"Using ",
										provider.name,
										" · ",
										model,
										". The key stays in this browser. The request is forwarded to that provider and is not saved."
									]
								})
							]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: `${tab === "manifest" ? "block" : "hidden lg:block"} lg:sticky lg:top-4`,
				"aria-label": "Outlook manifests",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl bg-card p-4 ring-1 ring-line sm:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-medium",
							children: "Sideload into Outlook"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted",
							children: "Same shape as a single-provider mail add-in: ribbon button, task pane, your key typed once. Install all models at once, or one lab at a time."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-4 grid gap-1 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: "Public address of this app"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "h-11 rounded-lg border border-line bg-paper px-3",
								value: baseInput,
								spellCheck: false,
								onChange: (event) => setBaseInput(event.target.value)
							})]
						}),
						!base && baseInput ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-danger",
							role: "alert",
							children: "Use an https address. http://localhost works only for a local sideload."
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
							className: "mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "After you publish, put that public https address above and download again." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Outlook: Get Add-ins, My add-ins, Add a custom add-in, Add from file." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Open a message, click the button, paste the key, then summarize or draft." })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "mt-3 inline-block text-sm font-medium text-seal underline-offset-2 hover:underline",
							href: "addin/taskpane.html",
							children: "Open the task pane in this browser"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 grid max-h-64 gap-1 overflow-auto pr-1",
							children: targets.map((target) => {
								const selected = target.id === manifestId;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setManifestId(target.id),
									className: `rounded-lg px-3 py-2 text-left ${selected ? "bg-seal text-sealfg" : "hover:bg-paper"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-sm font-medium",
										children: target.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `mt-0.5 block text-xs leading-relaxed ${selected ? "text-sealfg" : "text-muted"}`,
										children: target.blurb
									})]
								}, target.id);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "inline-flex h-11 items-center gap-2 rounded-lg bg-seal px-4 text-sm font-medium text-sealfg disabled:opacity-50",
									onClick: downloadOne,
									disabled: !base,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
										className: "size-4",
										"aria-hidden": "true"
									}), "Download this XML"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "inline-flex h-11 items-center gap-2 rounded-lg border border-line bg-paper px-4 text-sm font-medium disabled:opacity-50",
									onClick: downloadAll,
									disabled: !base,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
										className: "size-4",
										"aria-hidden": "true"
									}), "Download all"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "inline-flex h-11 items-center gap-2 rounded-lg border border-line bg-paper px-4 text-sm font-medium disabled:opacity-50",
									onClick: () => void copyXml(),
									disabled: !xml.startsWith("<?xml"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
										className: "size-4",
										"aria-hidden": "true"
									}), notice === "xml" ? "Copied" : "Copy XML"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "mt-4 max-h-80 overflow-auto rounded-lg bg-ink px-3 py-3 text-xs leading-relaxed whitespace-pre-wrap text-paper",
							children: xml || "The manifest appears here once this page knows its address."
						})
					]
				})
			})]
		})]
	});
}
var SplitComponent = Desk;
//#endregion
export { SplitComponent as component };
