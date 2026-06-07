import type { UpdateLeadFieldsInput } from './auditStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim().slice(0, max);
  return trimmed || undefined;
}

/**
 * Sanitize the arguments the model passes to the `save_lead` tool into the
 * subset of fields we persist. The model's tool args are untrusted input —
 * unknown keys are dropped, strings are trimmed/capped, and a malformed email
 * is discarded rather than stored. Mirrors the validation in
 * /api/audit/save-lead so chat-captured and form-captured leads are equivalent.
 */
export function extractLeadFields(args: unknown): UpdateLeadFieldsInput {
  if (!args || typeof args !== 'object') {
    return {};
  }
  const raw = args as Record<string, unknown>;
  const email = str(raw.email, 200)?.toLowerCase();
  const fields: UpdateLeadFieldsInput = {
    name: str(raw.name, 200),
    email: email && EMAIL_REGEX.test(email) ? email : undefined,
    company: str(raw.company, 200),
    companyUrl: str(raw.companyUrl, 500),
    industry: str(raw.industry, 100),
    city: str(raw.city, 100),
    bookedCall: typeof raw.bookedCall === 'boolean' ? raw.bookedCall : undefined,
  };
  // Strip undefined keys so callers can test "did we capture anything?".
  (Object.keys(fields) as Array<keyof UpdateLeadFieldsInput>).forEach((key) => {
    if (fields[key] === undefined) {
      delete fields[key];
    }
  });
  return fields;
}
