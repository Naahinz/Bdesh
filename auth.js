/* Bdesh homepage sign-in. Google OAuth only; student data lives on the workspace and profile pages. */
(() => {
  "use strict";
  const config = window.BDESH_SUPABASE || {};
  const client = globalThis.supabase?.createClient(config.url, config.key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  if (client) globalThis.bdeshSupabase = client;
  const el = (id) => document.getElementById(id);
  const panel = el("auth-panel"),
    msg = el("auth-message"),
    toggle = el("account-toggle");
  if (!client) {
    toggle.textContent = "Account service unavailable";
    toggle.addEventListener("click", () => {
      panel.hidden = false;
      msg.textContent = "The account library did not load. Please refresh the page and try again.";
    });
    return;
  }
  let user = null;
  toggle.textContent = "Checking session…";
  toggle.disabled = true;
  const notify = (text, error = false) => {
    msg.textContent = text;
    msg.classList.toggle("error", error);
  };
  const open = () => {
    panel.hidden = false;
    el("google-signin").focus();
  };
  const params = new URLSearchParams(location.search);
  const requestedNext = params.get("next");
  const returnPath =
    requestedNext === "/workspace.html" || requestedNext === "/workspace.html#profile"
      ? "/workspace.html"
      : null;
  if (params.get("signin") === "1") open();
  el("auth-close").addEventListener("click", () => {
    panel.hidden = true;
    notify("");
  });
  // Tells homepage-journey.js which account (if any) is signed in.
  const announce = () =>
    document.dispatchEvent(
      new CustomEvent("bdesh:auth-change", {
        detail: { user: user ? { id: user.id, email: user.email || "" } : null },
      }),
    );
  let currentId; // undefined until the first auth event, so a signed-out start still updates the button
  function setUser(next) {
    toggle.disabled = false;
    if ((next?.id ?? null) === currentId) return;
    currentId = next?.id ?? null;
    user = next || null;
    toggle.textContent = user ? "Sign out (" + (user.email || "account") + ")" : "Beta sign in";
    announce();
    if (user && returnPath && location.pathname !== returnPath) location.assign(returnPath);
  }
  toggle.addEventListener("click", async () => {
    if (!user) return open();
    const { error } = await client.auth.signOut();
    if (error) return notify(error.message, true);
    setUser(null);
    open();
    notify("Signed out.");
  });
  el("google-signin").addEventListener("click", async () => {
    const button = el("google-signin");
    button.disabled = true;
    notify("Redirecting to Google…");
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: location.origin + (returnPath || location.pathname) },
      });
      if (error) throw error;
    } catch (e) {
      notify("Google sign-in is not ready: " + (e?.message || "Please try again."), true);
      button.disabled = false;
    }
  });
  client.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      open();
      notify(
        "Email-password recovery is paused during the Google-only beta. Please sign in with Google instead.",
        true,
      );
    }
    setUser(session?.user || null);
  });
})();
