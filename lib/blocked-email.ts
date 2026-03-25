import blockedEmailEndings from "@/lib/blocked-email-endings.json";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getBlockedEmailEndings() {
  return blockedEmailEndings;
}

export function isBlockedEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  return blockedEmailEndings.some((ending) => normalizedEmail.endsWith(ending.toLowerCase()));
}
