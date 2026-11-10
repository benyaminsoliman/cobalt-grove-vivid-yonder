export const DEFAULT_INSTRUCTIONS =
  "You are a careful email assistant. Be concise and concrete. Do not invent facts, dates, or promises that are not in the mail. Do not add a subject line unless asked.";

export type MailContext = {
  from: string;
  subject: string;
  body: string;
  me?: string;
};

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const ACTIONS = ["summarize", "reply", "actions", "tone", "translate", "custom"] as const;
export type MailAction = (typeof ACTIONS)[number];

export function isMailAction(value: string): value is MailAction {
  return (ACTIONS as readonly string[]).includes(value);
}

export function mailBlock(mail: MailContext): string {
  const who = mail.me ? `I am ${mail.me}.\n` : "";
  return `${who}From: ${mail.from || "Unknown"}\nSubject: ${mail.subject || "(no subject)"}\n\n${mail.body.trim()}`;
}

export function actionPrompt(action: MailAction, mail: MailContext, extra?: string): string {
  const block = mailBlock(mail);
  switch (action) {
    case "summarize":
      return `Summarize this email in short bullets: what they want, any deadline, and what I should do next.\n\n${block}`;
    case "reply":
      return `Draft a reply from me to the sender. Plain prose, no subject line, no sign-off. Match their language. Do not invent commitments.\n\n${block}`;
    case "actions":
      return `List action items from this email. Each item: task, owner if stated, deadline if stated. If there are none, say so.\n\n${block}`;
    case "tone":
      return `In a few sentences, describe the tone of this email and how I should answer it.\n\n${block}`;
    case "translate":
      return `Translate this email into ${extra?.trim() || "English"}. Keep names, dates, and numbers exact.\n\n${block}`;
    case "custom":
      return `Email:\n${block}\n\nRequest: ${extra?.trim() || "Help me with this email."}`;
  }
}
