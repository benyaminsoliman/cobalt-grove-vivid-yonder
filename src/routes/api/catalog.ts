import { createFileRoute } from "@tanstack/react-router";
import { PROVIDERS } from "@/data/catalog";
import { DEFAULT_INSTRUCTIONS } from "@/lib/prompts";

export const Route = createFileRoute("/api/catalog")({
  server: {
    handlers: {
      GET: () =>
        new Response(JSON.stringify({ instructions: DEFAULT_INSTRUCTIONS, providers: PROVIDERS }), {
          headers: { "content-type": "application/json", "cache-control": "no-store" },
        }),
    },
  },
});
