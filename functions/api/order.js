// Cloudflare Pages Function — proxies order lookup to the upstream backend.
// File path: /functions/api/order.js
// Route:     POST /api/order   (token in JSON body, NOT in URL path)
//
// POST is used so the token never appears in CF Pages access logs or in any
// HTTP intermediary cache. The HTML page URL still contains the token by
// necessity (vexutopia.net/pay/{token}), but the API layer is kept clean.

export const onRequestPost = async (context) => {
  const { request, env } = context;

  // 1. Validate Origin header (defense at the edge)
  const origin = request.headers.get('Origin');
  const url = new URL(request.url);
  const allowedOrigin = `https://${url.host}`;
  if (origin && origin !== allowedOrigin) {
    return new Response('Forbidden', { status: 403 });
  }

  // 2. Parse JSON body
  let body;
  try {
    body = await request.json();
  } catch (_) {
    return new Response('Bad Request', { status: 400 });
  }
  const token = body && body.token;
  if (typeof token !== 'string' || token.length === 0 || token.length > 256) {
    return new Response('Bad Request', { status: 400 });
  }
  if (!/^[A-Za-z0-9_\-=]+$/.test(token)) {
    return new Response('Bad Request', { status: 400 });
  }

  // 3. Read upstream secrets from environment (set in Pages dashboard)
  const isSandbox = url.hostname === 'sandbox.luxfuntech.org';
  const upstreamUrl = isSandbox ? env.UPSTREAM_URL_SANDBOX : env.UPSTREAM_URL;
  const upstreamSecret = env.UPSTREAM_SECRET;
  if (!upstreamUrl || !upstreamSecret) {
    return new Response('Service unavailable', { status: 503 });
  }

  // 4. Forward to private upstream as POST with token in body
  let upstreamResp;
  try {
    upstreamResp = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${upstreamSecret}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
  } catch (_) {
    return new Response('Not Found', { status: 404 });
  }
  if (!upstreamResp.ok) {
    return new Response('Not Found', { status: 404 });
  }

  let data;
  try {
    data = await upstreamResp.json();
  } catch (_) {
    return new Response('Not Found', { status: 404 });
  }

  // 5. Strict whitelist — never spread the upstream object.
  const safe = {
    amount_owed: data.amount_owed,
    wallet_address: data.wallet_address,
    language_code: data.language_code,
    order_status: data.order_status,
  };

  return new Response(JSON.stringify(safe), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': allowedOrigin,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};

// Reject anything that isn't POST.
export const onRequest = async ({ request }) => {
  if (request.method === 'POST') return;
  return new Response('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST' },
  });
};
