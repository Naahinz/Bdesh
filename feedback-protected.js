/* Protected feedback path is staged and inactive until the Turnstile
   configuration is explicitly enabled. Never silently use direct DB fallback
   when verification fails. */
(() => {
  "use strict";
  const cfg = window.BDESH_FEEDBACK_SECURITY || {};
  const enabled = cfg.enabled === true;
  const siteKey = String(cfg.siteKey || "");
  const container = document.getElementById("feedback-challenge");
  let widgetId = null,
    challengeReady = false;
  window.bdeshProtectedFeedbackReady = () => enabled && challengeReady;
  window.bdeshProtectedFeedbackSubmit = async (payload) => {
    if (!enabled || !challengeReady || !window.turnstile || widgetId === null)
      return { ok: false, code: "challenge_not_ready" };
    const token = window.turnstile.getResponse(widgetId);
    if (!token) return { ok: false, code: "complete_security_check" };
    try {
      const response = await fetch(window.BDESH_SUPABASE.url + "/functions/v1/submit-feedback", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: payload.category,
          message: payload.message,
          reply_email: payload.reply_email,
          page_path: "/feedback.html",
          turnstile_token: token,
        }),
      });
      const data = await response.json().catch(() => ({}));
      return { ok: response.ok && data.code === "saved", code: data.code || "unexpected_response" };
    } catch (error) {
      return { ok: false, code: "network_error" };
    } finally {
      // Turnstile tokens are single-use. Rechallenge on every submission attempt.
      if (widgetId !== null) window.turnstile?.reset(widgetId);
    }
  };
  if (!enabled) return;
  if (!container || !/^[A-Za-z0-9_-]{10,}$/.test(siteKey)) {
    console.error("Bdesh feedback protection is enabled but its public sitekey is missing.");
    return;
  }
  container.hidden = false;
  const script = document.createElement("script");
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  script.async = true;
  script.onload = () => {
    if (!window.turnstile) return;
    widgetId = window.turnstile.render(container, {
      sitekey: siteKey,
      action: "bdesh_feedback",
      theme: "light",
      callback: () => {
        challengeReady = true;
      },
      "expired-callback": () => {
        challengeReady = false;
      },
      "error-callback": () => {
        challengeReady = false;
      },
    });
    challengeReady = widgetId !== undefined && widgetId !== null;
  };
  script.onerror = () => {
    challengeReady = false;
    console.warn("Bdesh: security verification could not load.");
  };
  document.head.append(script);
})();
