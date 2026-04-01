export interface SubscribeRequest {
  email: string;
}

export interface SubscribeResult {
  status: number;
  body: { success: boolean; message?: string; error?: string };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  return EMAIL_RE.test(trimmed) && trimmed.length <= 320;
}

export function parseSubscribeBody(raw: unknown): SubscribeRequest | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.email !== 'string') return null;
  const normalized = obj.email.trim().toLowerCase();
  if (!validateEmail(normalized)) return null;
  return { email: normalized };
}

export async function handleSubscribe(
  body: unknown,
  insertEmail: (email: string) => Promise<'ok' | 'duplicate' | 'error'>,
): Promise<SubscribeResult> {
  const parsed = parseSubscribeBody(body);
  if (!parsed) {
    return {
      status: 400,
      body: { success: false, error: 'Please provide a valid email address.' },
    };
  }

  const result = await insertEmail(parsed.email);

  switch (result) {
    case 'ok':
      return {
        status: 200,
        body: { success: true, message: "Thanks! We'll keep you posted." },
      };
    case 'duplicate':
      return {
        status: 409,
        body: { success: false, error: "You're already on the list!" },
      };
    case 'error':
      return {
        status: 500,
        body: { success: false, error: 'Something went wrong. Try again later.' },
      };
  }
}
