import { DEFAULT_INSTRUCTIONS } from "@/lib/prompts";

export const STORAGE_KEY = "quill-desk-v1";

export type CopilotMode = "github" | "azure";

export type DeskSettings = {
  providerId: string;
  modelByProvider: Record<string, string>;
  customByProvider: Record<string, string>;
  keyByProvider: Record<string, string>;
  regionByProvider: Record<string, string>;
  copilotMode: CopilotMode;
  azureHost: string;
  instructions: string;
};

export function defaultSettings(): DeskSettings {
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

export function loadSettings(): DeskSettings {
  if (typeof localStorage === "undefined") return defaultSettings();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw) as Partial<DeskSettings>;
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
      providerId: typeof parsed.providerId === "string" ? parsed.providerId : "openai",
    };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(settings: DeskSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function instructionText(settings: DeskSettings): string {
  const custom = settings.instructions.trim();
  return custom ? `${DEFAULT_INSTRUCTIONS}\n\n${custom}` : DEFAULT_INSTRUCTIONS;
}
