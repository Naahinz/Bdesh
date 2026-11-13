/* Bdesh feedback: durable Supabase inbox, no dependency on email delivery. */
(() => {
  "use strict";
  const form = document.getElementById("feedback-form");
  const status = document.getElementById("feedback-status");
  const submit = document.getElementById("feedback-submit");
  if (!form || !status || !submit) return;
  const { url, key } = window.BDESH_SUPABASE || {};
  const client = window.supabase?.createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  const protectedMode = window.BDESH_FEEDBACK_SECURITY?.enabled === true;
  const emailAddress = "eftekhernahin@gmail.com";
  const startedAt = Date.now();
  let lastSentAt = 0;
  const fallback = document.createElement("div");
  fallback.className = "feedback-fallback";
  fallback.hidden = true;
  fallback.style.cssText = "display:none;gap:10px;flex-wrap:wrap;align-items:center;margin-top:12px";
  const emailLink = document.createElement("a");
  emailLink.className = "action";
  emailLink.textContent = "Open email app";
  emailLink.style.cssText =
    "display:inline-flex;padding:10px 14px;border-radius:10px;min-height:40px;align-items:center;text-decoration:none";
  const copy = document.createElement("button");
  copy.className = "action";
  copy.type = "button";
  copy.textContent = "Copy message";
  copy.style.cssText = "padding:10px 14px;min-height:40px;border-radius:10px";
  fallback.append(emailLink, copy);
  status.insertAdjacentElement("afterend", fallback);
  const announce = (message, state) => {
    status.textContent = message;
    status.dataset.state = state;
  };
  const draft = () => {
    const data = new FormData(form);
    return (
      "Bdesh feedback: " +
      String(data.get("category") || "Other") +
      "\n\n" +
      String(data.get("message") || "") +
      "\n\nReply email: " +
      String(data.get("email") || "Not provided") +
      "\nPage: " +
      location.origin +
      location.pathname
    );
  };
  const showFallback = () => {
    emailLink.href =
      "mailto:" +
      emailAddress +
      "?subject=" +
      encodeURIComponent("Bdesh website feedback") +
      "&body=" +
      encodeURIComponent(draft());
    fallback.hidden = false;
    fallback.style.display = "flex";
  };
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(draft());
      copy.textContent = "Copied ✓";
    } catch {
      document.getElementById("feedback-message").focus();
      document.getElementById("feedback-message").select();
      copy.textContent = "Select and copy your message";
    }
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled || !form.reportValidity()) return;
    fallback.hidden = true;
    fallback.style.display = "none";
    const data = new FormData(form);
    const message = String(data.get("message") || "").trim();
    const category = String(data.get("category") || "Other feedback");
    const reply_email = String(data.get("email") || "").trim() || null;
    if (String(data.get("_honey") || "").trim()) {
      announce(
        "Submission rejected by spam protection. Please use the email link if this is a mistake.",
        "error",
      );
      showFallback();
      return;
    }
    if (message.length < 12 || message.length > 5000) {
      announce("Please enter 12–5000 characters.", "error");
      return;
    }
    if (Date.now() - startedAt < 1800) {
      announce("Please review your message and submit again.", "error");
      return;
    }
    if (lastSentAt && Date.now() - lastSentAt < 30000) {
      announce("Please allow 30 seconds between submissions.", "error");
      return;
    }
    if (!client) {
      announce("The feedback service is unavailable. Copy or email your message instead.", "error");
      showFallback();
      return;
    }
    submit.disabled = true;
    submit.textContent = "Saving feedback…";
    announce("Saving your feedback to Bdesh…", "pending");
    try {
      if (protectedMode) {
        // Never fall back to direct inserts after a failed security challenge.
        if (!window.bdeshProtectedFeedbackSubmit) throw { code: "challenge_not_ready" };
        const result = await window.bdeshProtectedFeedbackSubmit({ category, message, reply_email });
        if (!result.ok) throw { code: result.code || "verification_failed" };
      } else {
        // Legacy path preserved until the protected Edge Function and secret are verified.
        // Do not call .select(): anonymous users have INSERT but no SELECT privileges.
        const { error } = await client.from("beta_feedback").insert({
          category,
          message,
          reply_email,
          page_path: location.pathname,
        });
        if (error) throw error;
      }
      lastSentAt = Date.now();
      form.reset();
      announce("Feedback saved successfully to the Bdesh inbox. Thank you!", "success");
    } catch (error) {
      console.warn("Bdesh feedback save failed:", error?.code || "network error");
      announce(
        "Could not save feedback (" +
          (error?.code || "network error") +
          "). Your message is still here. Use the email or copy option below.",
        "error",
      );
      showFallback();
    } finally {
      submit.disabled = false;
      submit.textContent = "Send feedback";
    }
  });
})();
