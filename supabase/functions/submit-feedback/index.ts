// Bdesh staged feedback endpoint.
// Public invocation is intentional: Turnstile Siteverify, strict origin, and
// server-only service-role RPC enforce submission. Without a configured secret
// it fails closed. Never put the Turnstile secret in GitHub or browser assets.
const allowedOrigin = "https://bdesh.pages.dev";
const responseHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Cache-Control": "no-store",
  "Vary": "Origin",
};
const answer = (status: number, code: string) =>
  new Response(JSON.stringify({ ok: status === 200, code }), {
    status, headers: responseHeaders,
  });
const categories = new Set([
  "Bug or broken feature",
  "Incorrect university information",
  "Suggestion or new idea",
  "Other feedback",
]);
const encoder = new TextEncoder();
async function hashVisitor(ip: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" },
    false, ["sign"],
  );
  const digest = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(ip)),
  );
  return Array.from(digest, (n) => n.toString(16).padStart(2, "0")).join("");
}
Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin");
  if (origin !== allowedOrigin) return answer(403, "invalid_origin");
  if (request.method === "OPTIONS") return new Response(null, {
    status: 204, headers: responseHeaders,
  });
  if (request.method !== "POST") return answer(405, "method_not_allowed");
  const secret = Deno.env.get("BDESH_TURNSTILE_SECRET");
  // Prefer a current server-only secret key; legacy service-role JWT is a fallback.
  const availableSecrets = Deno.env.get("SUPABASE_SECRET_KEYS");
  let modernKey = "";
  try {
    const parsed = JSON.parse(availableSecrets || "{}");
    if (typeof parsed.default === "string") modernKey = parsed.default;
  } catch { /* No modern secret key available yet. */ }
  const serverKey = modernKey || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!secret || !serverKey || !supabaseUrl) {
    return answer(503, "server_not_configured");
  }
  const len = Number(request.headers.get("content-length") || "0");
  if (len > 16000) return answer(413, "payload_too_large");
  let payload: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 12000) return answer(413, "payload_too_large");
    payload = JSON.parse(raw);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return answer(400, "invalid_payload");
    }
  } catch {
    return answer(400, "invalid_json");
  }
  const category = payload.category;
  const message = payload.message;
  const email = payload.reply_email;
  const token = payload.turnstile_token;
  if (
    typeof category !== "string" || !categories.has(category) ||
    typeof message !== "string" || message.trim().length < 12 ||
    message.trim().length > 5000 ||
    (email !== null && email !== undefined &&
      (typeof email !== "string" || email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) ||
    typeof token !== "string" || token.length < 5 || token.length > 2048 ||
    payload.page_path !== "/feedback.html"
  ) return answer(400, "invalid_payload");
  const clientIp = request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim();
  if (!clientIp || clientIp.length > 100) {
    return answer(503, "client_address_unavailable");
  }
  try {
    const verifyAbort = AbortSignal.timeout(9000);
    const siteverify = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          response: token,
        }),
        signal: verifyAbort,
      },
    );
    if (!siteverify.ok) return answer(503, "challenge_service_unavailable");
    const check = await siteverify.json();
    if (
      check?.success !== true ||
      check?.hostname !== "bdesh.pages.dev" ||
      check?.action !== "bdesh_feedback"
    ) return answer(400, "verification_failed");
    // No raw IP stored. HMAC is stable only for the configured secret.
    // Headers are gateway-provided best-effort rate-limit signals;
    // the validated one-time challenge is the primary bot defense.
    const clientHash = await hashVisitor(clientIp, secret);
    const db = await fetch(
      supabaseUrl + "/rest/v1/rpc/submit_verified_beta_feedback",
      {
        method: "POST",
        headers: {
          apikey: serverKey,
          ...(serverKey.startsWith("sb_secret_") ? {} : { Authorization: "Bearer " + serverKey }),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          p_category: category,
          p_message: message.trim(),
          p_reply_email: email ?? null,
          p_page_path: "/feedback.html",
          p_client_hash: clientHash,
        }),
      },
    );
    if (!db.ok) return answer(503, "database_unavailable");
    const result = await db.json();
    if (result === "rate_limited") return answer(429, "rate_limited");
    if (result === "invalid") return answer(400, "invalid_payload");
    if (result !== "saved") return answer(503, "unexpected_save_result");
    return answer(200, "saved");
  } catch {
    return answer(503, "service_unavailable");
  }
});
