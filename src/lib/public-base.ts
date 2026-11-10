import { previewPathPrefix } from "@/lib/preview-path-prefix";

export function previewPrefix(): string {
  if (typeof window === "undefined") return "";
  return previewPathPrefix(window.location.hostname, window.location.pathname) ?? "";
}

export function publicBase(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${previewPrefix()}`;
}

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${previewPrefix()}${normalized}`;
}
