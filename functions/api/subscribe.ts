import { handleSubscribe } from './_subscribe-logic.js';

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';

  // IP-based rate limiting via D1 (5 requests per IP per 10 minutes)
  const rateLimited = await isRateLimited(env.DB, ip);
  if (rateLimited) {
    return Response.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: 'Invalid JSON.' },
      { status: 400 },
    );
  }

  const result = await handleSubscribe(body, async (email: string) => {
    try {
      await env.DB.prepare(
        'INSERT INTO subscribers (email) VALUES (?)',
      )
        .bind(email)
        .run();
      return 'ok';
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        err.message.includes('UNIQUE constraint failed')
      ) {
        return 'duplicate';
      }
      console.error(`Subscribe error [${ip}]:`, err);
      return 'error';
    }
  });

  return Response.json(result.body, { status: result.status });
};

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SEC = 600; // 10 minutes

async function isRateLimited(db: D1Database, ip: string): Promise<boolean> {
  try {
    // Record this request
    await db.prepare(
      'INSERT INTO rate_limits (ip, requested_at) VALUES (?, datetime(\'now\'))',
    ).bind(ip).run();

    // Count recent requests from this IP
    const result = await db.prepare(
      'SELECT COUNT(*) as cnt FROM rate_limits WHERE ip = ? AND requested_at > datetime(\'now\', ?)',
    ).bind(ip, `-${RATE_LIMIT_WINDOW_SEC} seconds`).first<{ cnt: number }>();

    return (result?.cnt ?? 0) > RATE_LIMIT_MAX;
  } catch {
    // If rate limiting fails, allow the request
    return false;
  }
}
