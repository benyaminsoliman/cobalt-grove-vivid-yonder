import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { completeChat, rateLimited } from "@/lib/complete.server";

const bodySchema = z.object({
  providerId: z.string().min(1).max(40),
  model: z.string().min(1).max(120),
  apiKey: z.string().min(6).max(500),
  region: z.string().max(20).optional(),
  copilotMode: z.enum(["github", "azure"]).optional(),
  azureHost: z.string().max(300).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string().min(1).max(30_000),
      }),
    )
    .min(1)
    .max(20),
});

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return "local";
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export const Route = createFileRoute("/api/complete")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (rateLimited(clientIp(request))) {
          return json({ error: "Too many requests. Wait a minute and try again." }, 429);
        }
        let raw: unknown;
        try {
          const text = await request.text();
          if (text.length > 200_000) return json({ error: "Request is too large." }, 413);
          raw = JSON.parse(text);
        } catch {
          return json({ error: "The request was not valid JSON." }, 400);
        }
        const parsed = bodySchema.safeParse(raw);
        if (!parsed.success) return json({ error: "Check the provider, model, and API key." }, 400);
        try {
          const text = await completeChat({
            ...parsed.data,
            referer: request.headers.get("origin") ?? undefined,
          });
          return json({ text });
        } catch (error) {
          const message = error instanceof Error ? error.message : "The provider request failed.";
          console.error("[complete]", parsed.data.providerId, message.slice(0, 180));
          return json({ error: message }, 502);
        }
      },
    },
  },
});
