import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, PenLine } from "lucide-react";
import { getProvider, PROVIDERS, type Provider } from "@/data/catalog";
import { buildManifest, installNotes, manifestTargets, normalizeBase } from "@/lib/manifest";
import { actionPrompt, type ChatMessage, type MailAction } from "@/lib/prompts";
import { apiUrl, publicBase } from "@/lib/public-base";
import {
  defaultSettings,
  instructionText,
  loadSettings,
  saveSettings,
  type CopilotMode,
  type DeskSettings,
} from "@/lib/storage";
import { makeZip } from "@/lib/zip";

const SAMPLE = {
  from: "Marta Almeida <marta@norte-supply.example>",
  subject: "Revised ship date for the Lisbon fixtures",
  body: `Hello,

The anodized brackets for the Lisbon lobby will leave our warehouse on 18 November, not the 12th. Customs asked for the mill certificates again, and the reprint added four working days.

Please confirm you can still receive them at the Rua da Prata dock on the 20th between 08:00 and 11:00. If that window is gone, send two other mornings next week.

The invoice for the deposit is attached in the real thread. Nothing is due until the crates clear.

Thanks,
Marta`,
};

const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Arabic", "Chinese", "Japanese", "Hindi", "Korean"];

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function effectiveModel(provider: Provider, settings: DeskSettings): string {
  const custom = settings.customByProvider[provider.id]?.trim();
  if (custom) return custom;
  return settings.modelByProvider[provider.id] || provider.defaultModel;
}

export function Desk() {
  const [tab, setTab] = useState<"assist" | "manifest">("assist");
  const [settings, setSettings] = useState<DeskSettings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);
  const [customOpen, setCustomOpen] = useState<Record<string, boolean>>({});
  const [baseInput, setBaseInput] = useState("");
  const [manifestId, setManifestId] = useState("all");
  const [mail, setMail] = useState(SAMPLE);
  const [custom, setCustom] = useState("");
  const [language, setLanguage] = useState("Spanish");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [followup, setFollowup] = useState("");

  useEffect(() => {
    setSettings(loadSettings());
    setBaseInput(publicBase());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveSettings(settings);
  }, [settings, hydrated]);

  const provider = getProvider(settings.providerId) ?? PROVIDERS[0];
  const model = effectiveModel(provider, settings);
  const base = normalizeBase(baseInput);
  const targets = manifestTargets();
  const listedModel = settings.modelByProvider[provider.id] || provider.defaultModel;
  const inList = provider.models.some((item) => item.id === listedModel);
  const usingCustom = Boolean(customOpen[provider.id]) || Boolean(settings.customByProvider[provider.id]?.trim()) || !inList;

  const xml = useMemo(() => {
    if (!base) return "";
    try {
      return buildManifest(manifestId, base);
    } catch (err) {
      return err instanceof Error ? err.message : "Could not build that manifest.";
    }
  }, [base, manifestId]);

  function patch(partial: Partial<DeskSettings>) {
    setSettings((current) => ({ ...current, ...partial }));
  }

  function setProviderId(providerId: string) {
    patch({ providerId });
    setMessages([]);
    setOutput("");
    setError("");
  }

  async function run(action: MailAction, extra?: string) {
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
    const next: ChatMessage[] = [
      { role: "system", content: instructionText(settings) },
      { role: "user", content: prompt },
    ];
    setMessages(next);
    await send(next, key);
  }

  async function sendFollowup() {
    const note = followup.trim();
    if (!note || messages.length === 0) return;
    const key = settings.keyByProvider[provider.id]?.trim() ?? "";
    const next: ChatMessage[] = [...messages, { role: "assistant", content: output }, { role: "user", content: note }];
    setFollowup("");
    setMessages(next);
    await send(next, key);
  }

  async function send(next: ChatMessage[], key: string) {
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
          messages: next,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { text?: string; error?: string };
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
    const target = targets.find((item) => item.id === manifestId);
    downloadBlob(target?.fileName ?? "manifest.xml", new Blob([xml], { type: "application/xml" }));
  }

  function downloadAll() {
    if (!base) return;
    const files = targets.map((target) => ({
      name: target.fileName,
      text: buildManifest(target.id, base),
    }));
    files.push({ name: "INSTALL.txt", text: installNotes(base) });
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

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-seal text-sealfg">
            <PenLine className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-3xl leading-none font-medium tracking-tight">Quill Desk</h1>
            <p className="mt-1 text-sm text-muted">Your key. Their model. The open email.</p>
          </div>
        </div>
        <div className="flex rounded-full bg-card p-1 ring-1 ring-line" role="tablist" aria-label="Sections">
          {(
            [
              ["assist", "Assistant"],
              ["manifest", "Outlook manifests"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`h-10 rounded-full px-4 text-sm font-medium lg:hidden ${tab === id ? "bg-seal text-sealfg" : "text-ink"}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
          <p className="hidden px-3 py-2 text-sm text-muted lg:block">Assistant and sideload files, side by side</p>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <section className={tab === "assist" ? "block" : "hidden lg:block"} aria-label="Email assistant">
          <div className="rounded-2xl bg-card p-4 ring-1 ring-line sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Provider</span>
                <select
                  className="h-11 rounded-lg border border-line bg-paper px-3"
                  value={provider.id}
                  onChange={(event) => setProviderId(event.target.value)}
                >
                  {PROVIDERS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">
                  {provider.id === "copilot" && settings.copilotMode === "azure" ? "Deployment name" : "Model"}
                </span>
                <select
                  className="h-11 rounded-lg border border-line bg-paper px-3"
                  value={usingCustom ? "__custom__" : listedModel}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === "__custom__") {
                      setCustomOpen((current) => ({ ...current, [provider.id]: true }));
                      return;
                    }
                    setCustomOpen((current) => ({ ...current, [provider.id]: false }));
                    patch({
                      modelByProvider: { ...settings.modelByProvider, [provider.id]: value },
                      customByProvider: { ...settings.customByProvider, [provider.id]: "" },
                    });
                  }}
                >
                  {provider.models.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                  <option value="__custom__">Other model id…</option>
                </select>
              </label>
            </div>

            {usingCustom ? (
              <label className="mt-3 grid gap-1 text-sm">
                <span className="font-medium">Model id</span>
                <input
                  className="h-11 rounded-lg border border-line bg-paper px-3"
                  value={settings.customByProvider[provider.id] ?? ""}
                  placeholder="Exact id from the provider console"
                  onChange={(event) =>
                    patch({ customByProvider: { ...settings.customByProvider, [provider.id]: event.target.value } })
                  }
                />
              </label>
            ) : null}

            {provider.regions ? (
              <label className="mt-3 grid gap-1 text-sm">
                <span className="font-medium">Endpoint region</span>
                <select
                  className="h-11 rounded-lg border border-line bg-paper px-3"
                  value={settings.regionByProvider[provider.id] || provider.defaultRegion}
                  onChange={(event) =>
                    patch({ regionByProvider: { ...settings.regionByProvider, [provider.id]: event.target.value } })
                  }
                >
                  {provider.regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {provider.id === "copilot" ? (
              <div className="mt-3 grid gap-3">
                <div className="flex rounded-full bg-paper p-1 ring-1 ring-line">
                  {(
                    [
                      ["github", "GitHub Models"],
                      ["azure", "Azure OpenAI"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className={`h-10 flex-1 rounded-full px-3 text-sm font-medium ${settings.copilotMode === id ? "bg-seal text-sealfg" : "text-ink"}`}
                      onClick={() => patch({ copilotMode: id as CopilotMode })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {settings.copilotMode === "azure" ? (
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium">Azure host</span>
                    <input
                      className="h-11 rounded-lg border border-line bg-paper px-3"
                      value={settings.azureHost}
                      placeholder="my-resource.openai.azure.com"
                      onChange={(event) => patch({ azureHost: event.target.value })}
                    />
                  </label>
                ) : null}
              </div>
            ) : null}

            <p className="mt-3 text-sm leading-relaxed text-muted">{provider.blurb}</p>

            <label className="mt-3 grid gap-1 text-sm">
              <span className="flex items-center justify-between gap-3 font-medium">
                {provider.keyLabel}
                <a className="font-normal text-seal underline-offset-2 hover:underline" href={provider.docsUrl} target="_blank" rel="noreferrer">
                  {provider.docsLabel}
                </a>
              </span>
              <input
                type="password"
                autoComplete="off"
                className="h-11 rounded-lg border border-line bg-paper px-3"
                placeholder={provider.keyPlaceholder}
                value={settings.keyByProvider[provider.id] ?? ""}
                onChange={(event) =>
                  patch({ keyByProvider: { ...settings.keyByProvider, [provider.id]: event.target.value } })
                }
              />
            </label>

            <details className="mt-3 text-sm">
              <summary className="font-medium">Standing instructions</summary>
              <textarea
                className="mt-2 min-h-24 w-full rounded-lg border border-line bg-paper px-3 py-2"
                placeholder="Example: reply in short bullets, never promise a date, sign off is added by Outlook."
                value={settings.instructions}
                onChange={(event) => patch({ instructions: event.target.value })}
              />
            </details>
          </div>

          <div className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-line sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-medium">Open mail</h2>
              <button type="button" className="text-sm font-medium text-seal" onClick={() => setMail(SAMPLE)}>
                Load sample
              </button>
            </div>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">From</span>
              <input
                className="h-11 rounded-lg border border-line bg-paper px-3"
                value={mail.from}
                onChange={(event) => setMail({ ...mail, from: event.target.value })}
              />
            </label>
            <label className="mt-3 grid gap-1 text-sm">
              <span className="font-medium">Subject</span>
              <input
                className="h-11 rounded-lg border border-line bg-paper px-3"
                value={mail.subject}
                onChange={(event) => setMail({ ...mail, subject: event.target.value })}
              />
            </label>
            <label className="mt-3 grid gap-1 text-sm">
              <span className="font-medium">Body</span>
              <textarea
                className="min-h-40 w-full rounded-lg border border-line bg-paper px-3 py-2"
                maxLength={20000}
                value={mail.body}
                onChange={(event) => setMail({ ...mail, body: event.target.value })}
              />
            </label>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {(
                [
                  ["summarize", "Summarize"],
                  ["reply", "Draft reply"],
                  ["actions", "Action items"],
                  ["tone", "Read the tone"],
                ] as const
              ).map(([action, label]) => (
                <button
                  key={action}
                  type="button"
                  disabled={busy}
                  className="h-11 rounded-lg bg-seal px-3 text-sm font-medium text-sealfg disabled:opacity-50"
                  onClick={() => void run(action)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <label className="sr-only" htmlFor="language">
                Translate into
              </label>
              <select
                id="language"
                className="h-11 rounded-lg border border-line bg-paper px-3 text-sm"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                {LANGUAGES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <button
                type="button"
                disabled={busy}
                className="h-11 flex-1 rounded-lg border border-line bg-paper px-3 text-sm font-medium disabled:opacity-50"
                onClick={() => void run("translate", language)}
              >
                Translate
              </button>
            </div>

            <label className="mt-3 grid gap-1 text-sm">
              <span className="font-medium">Ask something else</span>
              <textarea
                className="min-h-20 w-full rounded-lg border border-line bg-paper px-3 py-2"
                placeholder="What is she actually asking me to decide?"
                value={custom}
                onChange={(event) => setCustom(event.target.value)}
              />
            </label>
            <button
              type="button"
              disabled={busy}
              className="mt-2 h-11 w-full rounded-lg bg-ink text-sm font-medium text-paper disabled:opacity-50"
              onClick={() => void run("custom", custom)}
            >
              {busy ? "Writing…" : "Send"}
            </button>

            {error ? (
              <p className="mt-3 rounded-lg bg-danger px-3 py-2 text-sm text-dangerfg" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-4 border-t border-line pt-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-medium">Reply</h2>
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-1 text-sm font-medium text-seal disabled:opacity-50"
                  onClick={() => void copyOutput()}
                  disabled={!output}
                >
                  {notice === "reply" ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                  {notice === "reply" ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="min-h-28 rounded-lg bg-paper px-3 py-3 text-sm leading-relaxed whitespace-pre-wrap">
                {output ||
                  (busy
                    ? "Writing…"
                    : "Summaries, drafts, and action lists land here. Inside Outlook, the same pane can insert a draft into the message.")}
              </div>
              {output ? (
                <div className="mt-3 flex gap-2">
                  <label className="sr-only" htmlFor="followup">
                    Follow-up
                  </label>
                  <input
                    id="followup"
                    className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 text-sm"
                    placeholder="Shorter, and don’t mention customs"
                    value={followup}
                    onChange={(event) => setFollowup(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void sendFollowup();
                    }}
                  />
                  <button
                    type="button"
                    className="h-11 rounded-lg bg-seal px-4 text-sm font-medium text-sealfg disabled:opacity-50"
                    disabled={busy}
                    onClick={() => void sendFollowup()}
                  >
                    Revise
                  </button>
                </div>
              ) : null}
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Using {provider.name} · {model}. The key stays in this browser. The request is forwarded to that provider and is not saved.
              </p>
            </div>
          </div>
        </section>

        <section className={`${tab === "manifest" ? "block" : "hidden lg:block"} lg:sticky lg:top-4`} aria-label="Outlook manifests">
          <div className="rounded-2xl bg-card p-4 ring-1 ring-line sm:p-5">
            <h2 className="font-display text-xl font-medium">Sideload into Outlook</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Same shape as a single-provider mail add-in: ribbon button, task pane, your key typed once. Install all models at once, or one lab at a time.
            </p>
            <label className="mt-4 grid gap-1 text-sm">
              <span className="font-medium">Public address of this app</span>
              <input
                className="h-11 rounded-lg border border-line bg-paper px-3"
                value={baseInput}
                spellCheck={false}
                onChange={(event) => setBaseInput(event.target.value)}
              />
            </label>
            {!base && baseInput ? (
              <p className="mt-2 text-sm text-danger" role="alert">
                Use an https address. http://localhost works only for a local sideload.
              </p>
            ) : null}
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
              <li>After you publish, put that public https address above and download again.</li>
              <li>Outlook: Get Add-ins, My add-ins, Add a custom add-in, Add from file.</li>
              <li>Open a message, click the button, paste the key, then summarize or draft.</li>
            </ol>
            <a className="mt-3 inline-block text-sm font-medium text-seal underline-offset-2 hover:underline" href="addin/taskpane.html">
              Open the task pane in this browser
            </a>

            <div className="mt-4 grid max-h-64 gap-1 overflow-auto pr-1">
              {targets.map((target) => {
                const selected = target.id === manifestId;
                return (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => setManifestId(target.id)}
                    className={`rounded-lg px-3 py-2 text-left ${selected ? "bg-seal text-sealfg" : "hover:bg-paper"}`}
                  >
                    <span className="block text-sm font-medium">{target.title}</span>
                    <span className={`mt-0.5 block text-xs leading-relaxed ${selected ? "text-sealfg" : "text-muted"}`}>
                      {target.blurb}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-seal px-4 text-sm font-medium text-sealfg disabled:opacity-50"
                onClick={downloadOne}
                disabled={!base}
              >
                <Download className="size-4" aria-hidden="true" />
                Download this XML
              </button>
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-line bg-paper px-4 text-sm font-medium disabled:opacity-50"
                onClick={downloadAll}
                disabled={!base}
              >
                <Download className="size-4" aria-hidden="true" />
                Download all
              </button>
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-line bg-paper px-4 text-sm font-medium disabled:opacity-50"
                onClick={() => void copyXml()}
                disabled={!xml.startsWith("<?xml")}
              >
                <Copy className="size-4" aria-hidden="true" />
                {notice === "xml" ? "Copied" : "Copy XML"}
              </button>
            </div>

            <pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-ink px-3 py-3 text-xs leading-relaxed whitespace-pre-wrap text-paper">
              {xml || "The manifest appears here once this page knows its address."}
            </pre>
          </div>
        </section>
      </div>
    </main>
  );
}
