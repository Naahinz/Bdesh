(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const status = $("admin-status"),
    area = $("admin-content"),
    btn = $("refresh-metrics");
  const { url: projectUrl, key } = window.BDESH_SUPABASE || {};
  const client = window.supabase?.createClient(projectUrl, key, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  const setStatus = (value, error = false) => {
    status.textContent = value;
    status.dataset.error = String(error);
  };
  const put = (id, v) => {
    $(id).textContent = Number(v || 0).toLocaleString();
  };
  const render = (payload) => {
    const m = payload.totals || {};
    put("metric-accounts", m.accounts);
    put("metric-active", m.signed_in_7d);
    put("metric-new", m.new_accounts_30d);
    put("metric-confirmed", m.confirmed_email_accounts);
    put("metric-apps", m.tracked_applications);
    put("metric-profiles", m.admissions_profiles);
    put("metric-portfolios", m.profile_portfolios);
    put("metric-tasks", m.completed_learning_tasks);
    put("metric-verified", m.verified_opportunities);
    $("metric-directory-total").textContent =
      "of " + Number(m.published_opportunities || 0).toLocaleString() + " published";
    $("directory-meter").style.width =
      (m.published_opportunities
        ? Math.min(100, (100 * m.verified_opportunities) / m.published_opportunities)
        : 0) + "%";
    $("metrics-updated").textContent = "Updated " + new Date(payload.generated_at).toLocaleString();
    const chart = $("signup-chart");
    chart.replaceChildren();
    const data = Array.isArray(payload.signup_series) ? payload.signup_series : [];
    const peak = Math.max(1, ...data.map((x) => Number(x.signups) || 0));
    for (const entry of data) {
      const cell = document.createElement("div");
      cell.className = "bar-group";
      const count = document.createElement("span");
      count.textContent = String(entry.signups);
      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.height = Math.max(3, Math.round((154 * Number(entry.signups || 0)) / peak)) + "px";
      const date = document.createElement("small");
      date.textContent = String(entry.day || "").slice(5);
      cell.title = entry.day + ": " + entry.signups + " new accounts";
      cell.append(count, bar, date);
      chart.append(cell);
    }
    area.hidden = false;
    if (payload.incomplete_auth_count)
      setStatus(
        "Statistics loaded, but the account directory is larger than the current report limit.",
        true,
      );
    else setStatus("Aggregate metrics loaded. No personal account details are shown.");
  };
  async function load() {
    if (!client) {
      setStatus("Account library unavailable. Refresh to try again.", true);
      return;
    }
    btn.disabled = true;
    setStatus("Checking secure access…");
    try {
      const { data: identity, error: authError } = await client.auth.getUser();
      if (authError || !identity?.user) {
        area.hidden = true;
        setStatus("Sign in to Bdesh first, then return to this page.", true);
        return;
      }
      const { data: sessionData } = await client.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        area.hidden = true;
        setStatus("Your session expired. Sign in again from Bdesh.", true);
        return;
      }
      const response = await fetch(projectUrl + "/functions/v1/admin-metrics", {
        headers: { apikey: key, Authorization: "Bearer " + token, Accept: "application/json" },
        cache: "no-store",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        area.hidden = true;
        setStatus(
          response.status === 403
            ? "This account is not authorized to view administration metrics."
            : payload.error || "Statistics are unavailable.",
          true,
        );
        return;
      }
      render(payload);
      await loadInbox();
    } catch (e) {
      area.hidden = true;
      setStatus("Could not load admin metrics. Check the network or try again.", true);
    } finally {
      btn.disabled = false;
    }
  }

  async function loadInbox() {
    const output = $("feedback-inbox-list"),
      note = $("feedback-inbox-status"),
      filter = $("feedback-status-filter");
    if (!output || !note || !client) return;
    const state = filter?.value || "new";
    note.textContent = "Loading saved feedback…";
    output.replaceChildren();
    // Always count the full saved inbox, not merely the first page displayed.
    const statuses = ["new", "reviewing", "resolved"];
    const counts = await Promise.all(
      statuses.map((st) =>
        client.from("beta_feedback").select("id", { count: "exact", head: true }).eq("status", st),
      ),
    );
    const countError = counts.find((r) => r.error)?.error;
    if (countError) {
      note.textContent = "Could not read feedback totals: " + countError.message;
      return;
    }
    statuses.forEach((st, i) => {
      $("feedback-metric-" + st).textContent = Number(counts[i].count || 0).toLocaleString();
    });
    let query = client
      .from("beta_feedback")
      .select("id,category,message,reply_email,page_path,status,created_at,reviewed_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (state !== "all") query = query.eq("status", state);
    const { data, error } = await query;
    if (error) {
      note.textContent = "Could not read inbox: " + error.message;
      return;
    }
    const total =
      state === "all"
        ? counts.reduce((sum, r) => sum + (r.count || 0), 0)
        : counts[statuses.indexOf(state)]?.count || 0;
    note.textContent =
      (data?.length || 0) +
      " of " +
      total +
      " " +
      (state === "all" ? "total" : state.replace("_", " ")) +
      " submissions shown (newest first)";
    if (!data?.length) {
      const empty = document.createElement("p");
      empty.textContent = "There are no feedback entries matching this filter.";
      output.append(empty);
      return;
    }
    for (const item of data) {
      const article = document.createElement("article");
      article.style.cssText =
        "background:rgba(255,255,255,.74);border:1px solid rgba(173,188,200,.43);border-radius:15px;padding:18px;overflow-wrap:anywhere";
      const title = document.createElement("h3");
      title.textContent = item.category;
      const date = document.createElement("small");
      date.textContent =
        new Date(item.created_at).toLocaleString() + " · " + (item.page_path || "/feedback.html");
      const message = document.createElement("p");
      message.textContent = item.message;
      message.style.cssText = "white-space:pre-wrap;line-height:1.65";
      article.append(title, date, message);
      if (item.reply_email) {
        const contact = document.createElement("p");
        const a = document.createElement("a");
        a.href = "mailto:" + encodeURIComponent(item.reply_email);
        a.textContent = "Reply to " + item.reply_email;
        a.rel = "noopener noreferrer";
        contact.append(a);
        article.append(contact);
      }
      const row = document.createElement("div");
      row.style.cssText = "display:flex;gap:10px;align-items:center;flex-wrap:wrap";
      const label = document.createElement("label");
      label.textContent = "Review status ";
      const select = document.createElement("select");
      select.setAttribute("aria-label", "Review status of " + item.category);
      for (const [v, text] of [
        ["new", "New"],
        ["reviewing", "Reviewing"],
        ["resolved", "Resolved"],
      ]) {
        const option = document.createElement("option");
        option.value = v;
        option.textContent = text;
        select.append(option);
      }
      select.value = item.status;
      const saved = document.createElement("small");
      saved.setAttribute("role", "status");
      select.addEventListener("change", async () => {
        const previous = item.status,
          next = select.value;
        select.disabled = true;
        saved.textContent = "Saving…";
        const { data: updated, error: updateError } = await client
          .from("beta_feedback")
          .update({ status: next, reviewed_at: new Date().toISOString() })
          .eq("id", item.id)
          .select("id")
          .maybeSingle();
        if (updateError || !updated) {
          select.value = previous;
          saved.textContent = "Update failed: " + (updateError?.message || "No matching record");
        } else {
          item.status = next;
          saved.textContent = "Saved ✓";
          await loadInbox();
        }
        select.disabled = false;
      });
      label.append(select);
      row.append(label, saved);
      article.append(row);
      output.append(article);
    }
  }
  $("refresh-feedback")?.addEventListener("click", () => loadInbox());
  $("feedback-status-filter")?.addEventListener("change", () => loadInbox());
  btn.addEventListener("click", load);
  load();
})();
