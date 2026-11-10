/* global Office */
const STORAGE_KEY = "quill-desk-v1";
const DEFAULT_INSTRUCTIONS =
  "You are a careful email assistant. Be concise and concrete. Do not invent facts, dates, or promises that are not in the mail. Do not add a subject line unless asked.";

const state = {
  catalog: [],
  locked: null,
  inOutlook: false,
  compose: false,
  settings: null,
  messages: [],
  output: "",
  me: "",
};

function $(id) {
  return document.getElementById(id);
}

function defaultSettings() {
  return {
    providerId: "openai",
    modelByProvider: {},
    customByProvider: {},
    keyByProvider: {},
    regionByProvider: {},
    copilotMode: "github",
    azureHost: "",
    instructions: "",
  };
}

function loadSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!parsed || typeof parsed !== "object") return defaultSettings();
    return { ...defaultSettings(), ...parsed };
  } catch {
    return defaultSettings();
  }
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.settings));
}

function api(path) {
  return new URL(path, window.location.href).toString();
}

function provider() {
  return state.catalog.find((item) => item.id === state.settings.providerId) || state.catalog[0];
}

function modelId() {
  const current = provider();
  const custom = (state.settings.customByProvider[current.id] || "").trim();
  if (custom) return custom;
  return state.settings.modelByProvider[current.id] || current.defaultModel;
}

function showError(message) {
  const node = $("error");
  node.hidden = !message;
  node.textContent = message || "";
}

function mailBlock() {
  const from = state.inOutlook ? $("from").textContent.replace(/^From:\s*/, "") : $("mail-from").value.trim();
  const subject = state.inOutlook ? $("subject").textContent : $("mail-subject").value.trim();
  const body = state.inOutlook ? state.body || "" : $("mail-body").value.trim();
  const who = state.me ? `I am ${state.me}.\n` : "";
  return { from, subject, body, text: `${who}From: ${from || "Unknown"}\nSubject: ${subject || "(no subject)"}\n\n${body}` };
}

function promptFor(action, extra) {
  const block = mailBlock().text;
  if (action === "summarize") return `Summarize this email in short bullets: what they want, any deadline, and what I should do next.\n\n${block}`;
  if (action === "reply") return `Draft a reply from me to the sender. Plain prose, no subject line, no sign-off. Match their language. Do not invent commitments.\n\n${block}`;
  if (action === "actions") return `List action items from this email. Each item: task, owner if stated, deadline if stated. If there are none, say so.\n\n${block}`;
  if (action === "tone") return `In a few sentences, describe the tone of this email and how I should answer it.\n\n${block}`;
  if (action === "translate") return `Translate this email into ${extra || "English"}. Keep names, dates, and numbers exact.\n\n${block}`;
  return `Email:\n${block}\n\nRequest: ${extra || "Help me with this email."}`;
}

function fillForm() {
  const current = provider();
  if (!current) return;
  $("title").textContent = state.locked ? current.displayName.replace(" Email Assistant", "") : "Quill Desk";
  $("subtitle").textContent = current.name;
  $("provider").value = current.id;
  $("provider-wrap").hidden = Boolean(state.locked);
  $("key-name").textContent = current.keyLabel;
  $("api-key").value = state.settings.keyByProvider[current.id] || "";
  $("api-key").placeholder = current.keyPlaceholder || "";
  $("docs").href = current.docsUrl;
  $("instructions").value = state.settings.instructions || "";
  $("azure-host").value = state.settings.azureHost || "";
  $("copilot-modes").hidden = current.id !== "copilot";
  $("azure-wrap").hidden = !(current.id === "copilot" && state.settings.copilotMode === "azure");
  for (const button of $("copilot-modes").querySelectorAll("button")) {
    button.classList.toggle("active", button.dataset.mode === state.settings.copilotMode);
  }
  const regionWrap = $("region-wrap");
  regionWrap.hidden = !current.regions;
  const region = $("region");
  region.innerHTML = "";
  (current.regions || []).forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.label;
    region.appendChild(option);
  });
  region.value = state.settings.regionByProvider[current.id] || current.defaultRegion || "";
  const model = $("model");
  model.innerHTML = "";
  current.models.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.label;
    model.appendChild(option);
  });
  const selected = state.settings.modelByProvider[current.id] || current.defaultModel;
  if ([...model.options].some((option) => option.value === selected)) model.value = selected;
  $("custom-model").value = state.settings.customByProvider[current.id] || "";
  const modelLabel = current.id === "copilot" && state.settings.copilotMode === "azure" ? "Deployment name" : "Model";
  $("model-name").textContent = modelLabel;
}

function readForm() {
  const current = provider();
  state.settings.providerId = state.locked || $("provider").value;
  state.settings.keyByProvider[current.id] = $("api-key").value.trim();
  state.settings.modelByProvider[current.id] = $("model").value;
  state.settings.customByProvider[current.id] = $("custom-model").value.trim();
  state.settings.regionByProvider[current.id] = $("region").value;
  state.settings.instructions = $("instructions").value;
  state.settings.azureHost = $("azure-host").value.trim();
  saveSettings();
}

async function callModel(messages) {
  readForm();
  const current = provider();
  const key = (state.settings.keyByProvider[current.id] || "").trim();
  if (key.length < 6) throw new Error(`Add a ${current.name} API key.`);
  $("loading").hidden = false;
  showError("");
  const response = await fetch(api("../api/complete"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      providerId: current.id,
      model: modelId(),
      apiKey: key,
      region: state.settings.regionByProvider[current.id] || current.defaultRegion,
      copilotMode: state.settings.copilotMode,
      azureHost: state.settings.azureHost,
      messages,
    }),
  });
  const data = await response.json().catch(() => ({}));
  $("loading").hidden = true;
  if (!response.ok || !data.text) throw new Error(data.error || "The model did not answer.");
  return data.text;
}

async function run(action, extra) {
  const mail = mailBlock();
  if (!mail.body.trim()) {
    showError("No email body yet.");
    return;
  }
  const custom = state.settings.instructions.trim();
  const system = custom ? `${DEFAULT_INSTRUCTIONS}\n\n${custom}` : DEFAULT_INSTRUCTIONS;
  state.messages = [
    { role: "system", content: system },
    { role: "user", content: promptFor(action, extra) },
  ];
  try {
    state.output = await callModel(state.messages);
    $("result").textContent = state.output;
    $("result-wrap").hidden = false;
    $("insert").hidden = !state.compose;
  } catch (error) {
    showError(error instanceof Error ? error.message : "The request failed.");
  }
}

function loadOutlook() {
  const item = Office.context.mailbox.item;
  if (!item) {
    $("subject").textContent = "No message open";
    return;
  }
  state.compose = Boolean(item.to && typeof item.to.getAsync === "function");
  const profile = Office.context.mailbox.userProfile;
  state.me = profile ? profile.displayName || profile.emailAddress || "" : "";
  if (!state.compose) {
    $("subject").textContent = item.subject || "(no subject)";
    const from = item.from ? item.from.displayName || item.from.emailAddress : "Unknown";
    $("from").textContent = `From: ${from}`;
  } else {
    $("from").textContent = "Draft";
    item.subject.getAsync((result) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) $("subject").textContent = result.value || "New message";
    });
  }
  item.body.getAsync(Office.CoercionType.Text, (result) => {
    state.body = result.status === Office.AsyncResultStatus.Succeeded ? result.value : "";
  });
  $("manual").hidden = true;
}

function showMain() {
  $("settings").hidden = true;
  $("main").hidden = false;
  if (state.inOutlook) loadOutlook();
}

async function boot(inOutlook) {
  state.inOutlook = inOutlook;
  state.settings = loadSettings();
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("provider");
  try {
    const response = await fetch(api("../api/catalog"));
    const data = await response.json();
    state.catalog = data.providers || [];
  } catch {
    showError("Could not load the model list.");
    return;
  }
  const select = $("provider");
  state.catalog.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    select.appendChild(option);
  });
  if (requested && requested !== "all" && state.catalog.some((item) => item.id === requested)) {
    state.locked = requested;
    state.settings.providerId = requested;
  }
  if (!state.catalog.some((item) => item.id === state.settings.providerId)) {
    state.settings.providerId = state.catalog[0]?.id || "openai";
  }
  fillForm();
  const key = (state.settings.keyByProvider[state.settings.providerId] || "").trim();
  if (key.length >= 6) showMain();
  else $("settings-note").textContent = "The key stays on this device. It is sent only to the provider you pick.";

  if (!inOutlook) {
    $("manual").hidden = false;
    $("subject").textContent = "Not inside Outlook";
    $("from").textContent = "Paste a message below, or open this pane from a mail item.";
    $("mail-from").value = "Marta Almeida <marta@norte-supply.example>";
    $("mail-subject").value = "Revised ship date for the Lisbon fixtures";
    $("mail-body").value =
      "The anodized brackets will leave on 18 November, not the 12th. Please confirm the Rua da Prata dock can still take them on the 20th between 08:00 and 11:00.";
  } else if (Office.context.mailbox.addHandlerAsync) {
    Office.context.mailbox.addHandlerAsync(Office.EventType.ItemChanged, loadOutlook);
  }
}

function wire() {
  $("provider").addEventListener("change", () => {
    state.settings.providerId = $("provider").value;
    fillForm();
  });
  $("copilot-modes").addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    state.settings.copilotMode = button.dataset.mode;
    fillForm();
  });
  $("save").addEventListener("click", () => {
    readForm();
    const key = state.settings.keyByProvider[provider().id] || "";
    if (key.length < 6) {
      $("settings-note").textContent = "Enter the API key first.";
      return;
    }
    showMain();
  });
  $("settings-toggle").addEventListener("click", () => {
    if ($("settings").hidden) {
      fillForm();
      $("settings").hidden = false;
      $("main").hidden = true;
    } else {
      readForm();
      $("settings").hidden = true;
      $("main").hidden = false;
    }
  });
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => run(button.dataset.action));
  });
  $("translate").addEventListener("click", () => run("translate", $("language").value));
  $("ask").addEventListener("click", () => run("custom", $("custom").value.trim()));
  $("copy").addEventListener("click", async () => {
    if (!state.output) return;
    await navigator.clipboard.writeText(state.output);
    $("copy").textContent = "Copied";
    setTimeout(() => {
      $("copy").textContent = "Copy";
    }, 1200);
  });
  $("insert").addEventListener("click", () => {
    const item = Office.context.mailbox.item;
    if (!item || !item.body || !item.body.setSelectedDataAsync) return;
    item.body.setSelectedDataAsync(state.output, { coercionType: Office.CoercionType.Text }, (result) => {
      if (result.status !== Office.AsyncResultStatus.Succeeded) showError("Outlook could not insert the draft.");
    });
  });
  $("revise").addEventListener("click", async () => {
    const note = $("followup").value.trim();
    if (!note || !state.output) return;
    state.messages = [...state.messages, { role: "assistant", content: state.output }, { role: "user", content: note }];
    $("followup").value = "";
    try {
      state.output = await callModel(state.messages);
      $("result").textContent = state.output;
    } catch (error) {
      showError(error instanceof Error ? error.message : "The request failed.");
    }
  });
}

function adoptOutlook() {
  state.inOutlook = true;
  $("manual").hidden = true;
  if (!$("main").hidden) loadOutlook();
}

let started = false;
function start(inOutlook) {
  if (started) {
    if (inOutlook) adoptOutlook();
    return;
  }
  started = true;
  wire();
  void boot(inOutlook);
}

if (typeof Office !== "undefined" && Office.onReady) {
  Office.onReady((info) => start(Boolean(info && info.host === Office.HostType.Outlook)));
  window.setTimeout(() => start(false), 8000);
} else {
  start(false);
}
