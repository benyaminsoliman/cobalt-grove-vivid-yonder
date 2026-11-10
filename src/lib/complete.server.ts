import { getProvider, providerEndpoint, type Provider } from "@/data/catalog";

export type CompleteInput = {
  providerId: string;
  model: string;
  apiKey: string;
  region?: string;
  copilotMode?: "github" | "azure";
  azureHost?: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  referer?: string;
};

type Upstream = { url: string; headers: Record<string, string>; body: unknown; kind: "openai" | "anthropic" | "gemini" };

const hits = new Map<string, { n: number; reset: number }>();

export function rateLimited(ip: string): boolean {
  const now = Date.now();
  const row = hits.get(ip);
  if (!row || now > row.reset) {
    hits.set(ip, { n: 1, reset: now + 60_000 });
    return false;
  }
  row.n += 1;
  return row.n > 30;
}

function assertModel(model: string) {
  if (model.length < 1 || model.length > 120 || model.includes("..") || !/^[\w./:-]+$/.test(model)) {
    throw new Error("Model id looks invalid. Use the list, or paste the id from the provider console.");
  }
}

function buildAzureUrl(hostRaw: string, deployment: string): string {
  let raw = hostRaw.trim();
  if (!raw) throw new Error("Enter your Azure resource host, for example my-resource.openai.azure.com.");
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("That Azure host is not a valid address.");
  }
  if (url.protocol !== "https:") throw new Error("Azure host must use https.");
  const host = url.hostname.toLowerCase();
  const allowed =
    host.endsWith(".openai.azure.com") ||
    host.endsWith(".cognitiveservices.azure.com") ||
    host.endsWith(".services.ai.azure.com");
  if (!allowed) {
    throw new Error("Host must be an Azure OpenAI resource, for example my-resource.openai.azure.com.");
  }
  assertModel(deployment);
  return `https://${host}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=2024-10-21`;
}

function splitSystem(messages: CompleteInput["messages"]): { system: string; chat: { role: "user" | "assistant"; content: string }[] } {
  const system = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content.trim())
    .filter(Boolean)
    .join("\n\n");
  const chat = messages
    .filter((message) => message.role !== "system")
    .map((message) => ({ role: message.role as "user" | "assistant", content: message.content }));
  if (chat.length === 0) throw new Error("Nothing to send.");
  if (chat[0]?.role !== "user") throw new Error("The conversation has to start with your request.");
  return { system, chat };
}

function upstreamFor(input: CompleteInput, provider: Provider): Upstream {
  const { system, chat } = splitSystem(input.messages);
  const model = input.model.trim();
  assertModel(model);

  if (provider.protocol === "anthropic") {
    return {
      kind: "anthropic",
      url: "https://api.anthropic.com/v1/messages",
      headers: {
        "content-type": "application/json",
        "x-api-key": input.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: {
        model,
        max_tokens: 1400,
        system: system || undefined,
        messages: chat,
      },
    };
  }

  if (provider.protocol === "gemini") {
    return {
      kind: "gemini",
      url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": input.apiKey,
      },
      body: {
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
        contents: chat.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        generationConfig: { maxOutputTokens: 1400 },
      },
    };
  }

  let url: string;
  const headers: Record<string, string> = { "content-type": "application/json" };
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

  const openaiMessages = [
    ...(system ? [{ role: "system", content: system }] : []),
    ...chat,
  ];
  return {
    kind: "openai",
    url,
    headers,
    body: { model, messages: openaiMessages, max_tokens: 1400 },
  };
}

function textFromPayload(kind: Upstream["kind"], payload: unknown): string {
  const data = payload as {
    choices?: { message?: { content?: unknown } }[];
    content?: { type?: string; text?: string }[];
    candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
    error?: { message?: string };
    promptFeedback?: { blockReason?: string };
  };
  if (kind === "anthropic") {
    const text = (data.content ?? []).map((part) => part.text ?? "").join("").trim();
    if (text) return text;
  } else if (kind === "gemini") {
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const text = parts.map((part) => part.text ?? "").join("").trim();
    if (text) return text;
    if (data.promptFeedback?.blockReason) {
      throw new Error(`Gemini blocked the request (${data.promptFeedback.blockReason}).`);
    }
  } else {
    const content = data.choices?.[0]?.message?.content;
    if (typeof content === "string" && content.trim()) return content.trim();
    if (Array.isArray(content)) {
      const text = content
        .map((part) => {
          if (typeof part === "string") return part;
          if (part && typeof part === "object" && "text" in part && typeof part.text === "string") return part.text;
          return "";
        })
        .join("")
        .trim();
      if (text) return text;
    }
  }
  throw new Error("The model returned an empty reply.");
}

async function readError(response: Response): Promise<string> {
  const raw = await response.text();
  try {
    const parsed = JSON.parse(raw) as { error?: { message?: string } | string; message?: string };
    if (typeof parsed.error === "string" && parsed.error) return parsed.error;
    if (parsed.error && typeof parsed.error === "object" && parsed.error.message) return parsed.error.message;
    if (parsed.message) return parsed.message;
  } catch {
    /* plain text */
  }
  return raw.slice(0, 400) || `The provider returned ${response.status}.`;
}

async function postUpstream(target: Upstream): Promise<unknown> {
  const response = await fetch(target.url, {
    method: "POST",
    headers: target.headers,
    body: JSON.stringify(target.body),
    redirect: "error",
    signal: AbortSignal.timeout(50_000),
  });
  if (!response.ok) {
    const message = await readError(response);
    const error = new Error(message.replace(/\s+/g, " ").slice(0, 500));
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }
  return response.json();
}

export async function completeChat(input: CompleteInput): Promise<string> {
  const provider = getProvider(input.providerId);
  if (!provider) throw new Error("Unknown provider.");
  const key = input.apiKey.trim();
  if (key.length < 6) throw new Error("Enter the API key for this provider.");
  if (key.length > 500 || /[\r\n]/.test(key)) throw new Error("That API key does not look valid.");

  const total = input.messages.reduce((sum, message) => sum + message.content.length, 0);
  if (total > 60_000) throw new Error("That email is too long to send. Trim it and try again.");

  const target = upstreamFor({ ...input, apiKey: key }, provider);
  try {
    const payload = await postUpstream(target);
    return textFromPayload(target.kind, payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The provider request failed.";
    const status = error instanceof Error ? (error as Error & { status?: number }).status : undefined;
    const openaiBody = target.body as { max_tokens?: number; messages?: unknown; model?: string };
    if (target.kind === "openai" && status === 400 && /max_tokens/i.test(message) && openaiBody.max_tokens) {
      const retry = await postUpstream({
        ...target,
        body: {
          model: openaiBody.model,
          messages: openaiBody.messages,
          max_completion_tokens: openaiBody.max_tokens,
        },
      });
      return textFromPayload("openai", retry);
    }
    if (/model/i.test(message) && /(not found|does not exist|invalid|unknown)/i.test(message)) {
      throw new Error(`${message} Paste the exact model id from the provider console into Model id.`);
    }
    throw error instanceof Error ? error : new Error(message);
  }
}
