import { handleSubscribe } from './_subscribe-logic.js';

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Rate limiting: check IP
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';

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
