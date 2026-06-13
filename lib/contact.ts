// Contact form delivery is client-side only — the site sends no email from the
// server. `contact@erenisiklab.com` is a Cloudflare Email Routing alias that
// forwards to the owner's inbox; the form simply opens the visitor's own mail
// client pre-filled via a `mailto:` link. No provider, API key, or recipient
// secret is involved.

export type ContactDraft = {
  name: string;
  email: string;
  message: string;
};

export function buildContactMailto(toEmail: string, draft: ContactDraft): string {
  const name = draft.name.trim();
  const email = draft.email.trim();
  const message = draft.message.trim();

  const subject = name ? `Portfolio inquiry from ${name}` : "Portfolio inquiry";
  const sender = [name, email && `<${email}>`].filter(Boolean).join(" ");
  const body = sender ? `${message}\n\nFrom: ${sender}` : message;

  return `mailto:${toEmail}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}
