(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const status = $("editor-status");
  const client = window.supabase?.createClient(
    window.BDESH_SUPABASE?.url,
    window.BDESH_SUPABASE?.key,
  );
  let rows = [],
    selected = null;
  const form = $("editor-form");
  const safeUrl = (v) => {
    try {
      const url = new URL(v);
      return ["https:", "http:"].includes(url.protocol);
    } catch {
      return false;
    }
  };
  function setStatus(message) {
    status.textContent = message;
  }
  async function loadHistory(id) {
    const dest = $("editor-history");
    dest.textContent = "Loading history…";
    const { data, error } = await client
      .from("opportunity_change_log")
      .select("id,changed_at,changed_by,prior,updated")
      .eq("opportunity_id", id)
      .order("changed_at", { ascending: false })
      .limit(15);
    if (selected?.id !== id) return;
    dest.replaceChildren();
    if (error) {
      dest.textContent = "History unavailable: " + error.message;
      return;
    }
    if (!data?.length) {
      dest.textContent = "No edits recorded since history tracking was enabled.";
      return;
    }
    for (const change of data) {
      const item = document.createElement("details");
      const title = document.createElement("summary");
      title.textContent = new Date(change.changed_at).toLocaleString() + " · Saved change";
      const body = document.createElement("p");
      const keys = Object.keys(change.updated || {}).filter(
        (k) => JSON.stringify(change.prior?.[k]) !== JSON.stringify(change.updated?.[k]),
      );
      body.textContent = "Fields changed: " + (keys.join(", ") || "No field differences");
      item.append(title, body);
      dest.append(item);
    }
  }
  function draw() {
    const list = $("editor-list");
    list.replaceChildren();
    const q = $("editor-search").value.trim().toLowerCase();
    const filter = $("editor-review-filter").value;
    const matches = rows.filter(
      (x) =>
        x.title.toLowerCase().includes(q) &&
        (filter === "all" ||
          (filter === "unverified" && !x.verified_at) ||
          (filter === "verified" && Boolean(x.verified_at)) ||
          (filter === "draft" && !x.published)),
    );
    $("editor-count").textContent =
      matches.length +
      " of " +
      rows.length +
      " colleges · " +
      rows.filter((x) => x.verified_at).length +
      " with recorded review dates";
    for (const entry of matches) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = entry.title + (entry.verified_at ? " · reviewed" : " · needs review");
      button.setAttribute("aria-current", String(selected?.id === entry.id));
      button.addEventListener("click", () => {
        selected = entry;
        form.hidden = false;
        for (const key of [
          "title",
          "country",
          "official_url",
          "funding_notes",
          "eligibility_notes",
          "deadline_notes",
          "verified_at",
          "source_notes",
          "source_checked_at",
        ])
          form.elements[key].value = entry[key] || "";
        form.elements.published.checked = entry.published;
        $("editor-title").textContent = entry.title;
        $("editor-feedback").textContent = "";
        draw();
        loadHistory(entry.id);
      });
      list.append(button);
    }
  }
  async function start() {
    if (!client) {
      setStatus("Supabase library unavailable. Refresh the page.");
      return;
    }
    const {
      data: { user },
      error,
    } = await client.auth.getUser();
    if (error || !user) {
      setStatus("Sign in from the main Bdesh website first.");
      return;
    }
    if (user.app_metadata?.bdesh_role !== "editor") {
      setStatus("Access restricted. This Google account has not been authorized as a Bdesh editor.");
      return;
    }
    const res = await client
      .from("opportunities")
      .select(
        "id,title,country,official_url,funding_notes,eligibility_notes,deadline_notes,verified_at,published,source_notes,source_checked_at",
      )
      .order("title");
    if (res.error) {
      setStatus("Could not load editorial records: " + res.error.message);
      return;
    }
    rows = res.data || [];
    $("editor").hidden = false;
    setStatus(
      rows.length +
        " college records available for editorial review. Verify policies against official sources before marking a record reviewed.",
    );
    draw();
  }
  $("editor-search").addEventListener("input", draw);
  $("editor-review-filter").addEventListener("change", draw);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!selected) return;
    const payload = {};
    for (const key of [
      "title",
      "country",
      "official_url",
      "funding_notes",
      "eligibility_notes",
      "deadline_notes",
      "source_notes",
    ])
      payload[key] = form.elements[key].value.trim();
    if (!safeUrl(payload.official_url)) {
      $("editor-feedback").textContent = "Enter a valid HTTP or HTTPS official URL.";
      return;
    }
    if (/mail\.google\.com|gmail\.com|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(payload.source_notes)) {
      $("editor-feedback").textContent =
        "Do not publish private email addresses, Gmail message links, or internal correspondence. Keep public source notes limited to official institution links and summaries.";
      return;
    }
    payload.published = form.elements.published.checked;
    payload.verified_at = form.elements.verified_at.value || null;
    payload.source_checked_at = form.elements.source_checked_at.value || null;
    if (payload.verified_at && (!payload.source_notes || !payload.source_checked_at)) {
      $("editor-feedback").textContent =
        "Add official source evidence and the source-check date before marking this record verified.";
      return;
    }
    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    $("editor-feedback").textContent = "Saving…";
    const { data, error } = await client
      .from("opportunities")
      .update(payload)
      .eq("id", selected.id)
      .select(
        "id,title,country,official_url,funding_notes,eligibility_notes,deadline_notes,verified_at,published,source_notes,source_checked_at",
      )
      .single();
    button.disabled = false;
    if (error) {
      $("editor-feedback").textContent = "Save failed: " + error.message;
      return;
    }
    rows = rows.map((x) => (x.id === data.id ? data : x));
    selected = data;
    draw();
    loadHistory(selected.id);
    $("editor-feedback").textContent = "Saved to the shared directory.";
  });
  start();
})();
