import { ALL_DOMAINS, PROVIDERS, UNIFIED_GUID, getProvider } from "@/data/catalog";

export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;");
}

export function normalizeBase(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  let url: URL;
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

export type ManifestTarget = {
  id: string;
  fileName: string;
  title: string;
  blurb: string;
};

export function manifestTargets(): ManifestTarget[] {
  return [
    {
      id: "all",
      fileName: "manifest-all-models.xml",
      title: "All models",
      blurb: "One ribbon button. Pick OpenAI, Gemini, Claude, Grok, and the rest inside the pane.",
    },
    ...PROVIDERS.map((provider) => ({
      id: provider.id,
      fileName: `manifest-${provider.id}.xml`,
      title: provider.displayName,
      blurb: provider.blurb,
    })),
  ];
}

function icon(base: string, id: string, size: 16 | 32 | 64 | 80): string {
  return xmlEscape(`${base}/addin/icons/${id}-${size}.png`);
}

export function buildManifest(providerId: string, baseInput: string): string {
  const base = normalizeBase(baseInput);
  if (!base) throw new Error("Enter an https address (http://localhost is allowed for a local sideload).");

  const provider = providerId === "all" ? undefined : getProvider(providerId);
  if (providerId !== "all" && !provider) throw new Error("Unknown provider.");

  const id = provider?.id ?? "all";
  const guid = provider?.guid ?? UNIFIED_GUID;
  const displayName = provider?.displayName ?? "Quill Desk";
  const description =
    provider?.description ??
    "Summarize emails and draft replies with OpenAI, Gemini, Claude, Grok, Qwen, DeepSeek, Copilot, and other models. Bring your own API keys.";
  const button = provider?.buttonLabel ?? "Quill Desk";
  const tooltip =
    provider?.tooltip ?? "Summarize the open email or draft a reply with the model you choose";
  const group = provider ? provider.name : "Quill Desk";
  const domains = provider ? provider.domains : ALL_DOMAINS;
  const taskpane = provider
    ? `${base}/addin/taskpane.html?provider=${provider.id}`
    : `${base}/addin/taskpane.html`;
  const taskpaneXml = xmlEscape(taskpane);
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

export function installNotes(base: string): string {
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
