/* Bdesh student-owned U.S. application preparation profile. Not affiliated with Common App. */
(() => {
  "use strict";
  const URL = "https://xeqixwmulwonvhifcmvn.supabase.co",
    KEY = "sb_publishable_2Jp14PFt4_mLDT4cpqLfUw_d-tDSnwj";
  const $ = (id) => document.getElementById(id),
    sb = window.supabase?.createClient(URL, KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  const sections = ["overview", "academics", "activities", "honors", "writing", "brag", "review"];
  let user = null,
    basic = {},
    portfolio = {},
    active = "",
    saving = false,
    queued = false,
    saveTimer = null,
    hydrating = false,
    navSaving = false;
  const blank = () => ({
    activities: [],
    honors: [],
    essays: [],
    academic_context: "",
    brag_sheet: "",
    future_goals: "",
    additional_notes: "",
  });
  function message(text, bad = false) {
    const el = $("save-status");
    el.textContent = text;
    el.style.color = bad ? "#b0564c" : "#c65a2e";
  }
  function showError(text) {
    $("signin-error").textContent = text;
    $("account-name").textContent = "Sign in required";
  }
  function el(tag, attrs = {}, text) {
    const x = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") x.className = v;
      else if (k === "type") x.type = v;
      else x.setAttribute(k, String(v));
    }
    if (text !== undefined) x.textContent = String(text);
    return x;
  }
  function val(form, name) {
    return form.elements.namedItem(name)?.value ?? "";
  }
  function number(v) {
    return v === "" ? null : Number(v);
  }
  function field(label, name, type = "text", opts = {}) {
    const wrap = el("label", { class: opts.wide ? "wide" : "" });
    wrap.append(document.createTextNode(label));
    let input;
    if (opts.choices) {
      input = el("select", { name });
      for (const [value, title] of opts.choices) {
        const o = el("option", { value }, title);
        input.append(o);
      }
    } else if (type === "textarea") {
      input = el("textarea", {
        name,
        rows: String(opts.rows || 3),
        maxlength: String(opts.max || 2500),
        placeholder: opts.placeholder || "",
      });
    } else {
      input = el("input", { name, type, placeholder: opts.placeholder || "" });
      if (opts.max) input.maxLength = opts.max;
      if (opts.min !== undefined) input.min = opts.min;
      if (opts.maxnum !== undefined) input.max = opts.maxnum;
    }
    wrap.append(input);
    if (opts.help) wrap.append(el("small", {}, opts.help));
    if (opts.max) {
      const count = el("small", { class: "char-count" }, "0 / " + opts.max);
      input.addEventListener("input", () => (count.textContent = input.value.length + " / " + opts.max));
      wrap.append(count);
    }
    return wrap;
  }
  function optionList(list) {
    return list.map(([v, t]) => [v, t]);
  }
  function nextSection(section) {
    const i = sections.indexOf(section);
    return sections[Math.min(i + 1, sections.length - 1)];
  }
  function showSection(section) {
    if (!sections.includes(section)) section = "overview";
    if (section === active && document.getElementById("panel-" + section)?.hidden === false) return;
    active = section;
    for (const id of sections) $("panel-" + id).hidden = id !== section;
    for (const button of document.querySelectorAll("[data-section]")) {
      button.classList.toggle("active", button.dataset.section === section);
      button.setAttribute("aria-current", button.dataset.section === section ? "step" : "false");
    }
    $("section-serial").textContent =
      "YOUR STUDENT FILE / " + String(sections.indexOf(section) + 1).padStart(2, "0");
    if (section === "review") renderReview();
    location.hash = section;
    window.scrollTo({ top: 0, behavior: "instant" });
    $("profile-main").focus({ preventScroll: true });
  }
  async function goToSection(section, button = null) {
    if (navSaving || !user) return;
    if (section === active) return;
    navSaving = true;
    if (button) button.disabled = true;
    try {
      if (active === "academics") {
        const ok = await saveBasic(false);
        if (!ok) return;
      } else if (["activities", "honors", "writing", "brag"].includes(active)) {
        const ok = await persistPortfolio();
        if (!ok) return;
      }
      showSection(section);
    } finally {
      navSaving = false;
      if (button) button.disabled = false;
    }
  }
  for (const button of document.querySelectorAll("[data-section]"))
    button.addEventListener("click", () => goToSection(button.dataset.section, button));
  for (const button of document.querySelectorAll("[data-go]"))
    button.addEventListener("click", () => goToSection(button.dataset.go, button));
  window.addEventListener("hashchange", () => {
    const section = location.hash.slice(1);
    if (section && section !== active) goToSection(section);
  });
  function academicPayload() {
    const f = $("academics-form");
    return {
      user_id: user.id,
      display_name: val(f, "display_name").trim() || null,
      school_name: val(f, "school_name").trim() || null,
      graduation_year: number(val(f, "graduation_year")),
      ssc_gpa: number(val(f, "ssc_gpa")),
      hsc_gpa: number(val(f, "hsc_gpa")),
      sat_total: number(val(f, "sat_total")),
      english_test: val(f, "english_test"),
      english_score: val(f, "english_score").trim() || null,
      intended_majors: val(f, "intended_majors").trim() || null,
      countries: val(f, "countries")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
        .slice(0, 15),
      funding_need: val(f, "funding_need"),
      updated_at: new Date().toISOString(),
    };
  }
  async function saveBasic(explicit = true) {
    if (!user || hydrating) return false;
    const button = explicit ? $("academics-form").querySelector('button[type="submit"]') : null;
    if (button) {
      button.disabled = true;
      button.textContent = "Saving…";
    }
    try {
      const payload = academicPayload();
      const { data, error } = await sb
        .from("student_admissions_profiles")
        .upsert(payload, { onConflict: "user_id" })
        .select()
        .single();
      if (error) throw error;
      basic = data;
      const ok = await persistPortfolio();
      if (!ok) return false;
      message("Education saved ✓");
      progress();
      if (button) {
        button.textContent = "Saved ✓";
        button.dataset.saved = "true";
      }
      if (explicit) {
        window.bdeshTrack?.("bdesh_profile_saved");
        showSection(nextSection("academics"));
      }
      return true;
    } catch (error) {
      message("Education save failed: " + (error?.message || String(error)), true);
      if (button) {
        button.textContent = "Retry saving";
        button.dataset.saved = "false";
      }
      return false;
    } finally {
      if (button) button.disabled = false;
    }
  }
  function fillBasic() {
    const f = $("academics-form");
    for (const name of [
      "display_name",
      "school_name",
      "graduation_year",
      "ssc_gpa",
      "hsc_gpa",
      "sat_total",
      "english_test",
      "english_score",
      "intended_majors",
      "funding_need",
    ]) {
      const v = basic[name];
      if (v !== undefined && v !== null && f.elements.namedItem(name))
        f.elements.namedItem(name).value = String(v);
    }
    f.elements.namedItem("countries").value = (basic.countries || []).join(", ");
    f.elements.namedItem("academic_context").value = portfolio.academic_context || "";
  }
  function collectCards(section) {
    return [...document.querySelectorAll("#" + section + "-list .entry-card")].map((card) => {
      const output = {};
      for (const input of card.querySelectorAll("[name]")) {
        if (input.type === "checkbox") {
          if (!output[input.name]) output[input.name] = [];
          if (input.checked) output[input.name].push(input.value);
        } else if (input.type === "number") {
          output[input.name] = input.value === "" ? null : Number(input.value);
        } else {
          output[input.name] = input.value;
        }
      }
      return output;
    });
  }
  function harvest() {
    portfolio.activities = collectCards("activity");
    portfolio.honors = collectCards("honor");
    portfolio.essays = collectCards("essay");
    portfolio.academic_context = val($("academics-form"), "academic_context");
    for (const k of ["brag_sheet", "future_goals", "additional_notes"]) portfolio[k] = val($("brag-form"), k);
  }
  function queueSave() {
    if (!user || hydrating) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => persistPortfolio(), 850);
    message("Unsaved changes…");
  }
  const portfolioByteLimits = [
    ["activities", 120000, "Your activities are too long to save — shorten an activity."],
    ["honors", 40000, "Your honors are too long to save — shorten an honor."],
    ["essays", 200000, "Your essays are too long to save — shorten one draft."],
  ];
  const portfolioEncoder = new TextEncoder();

  function portfolioSizeError(data) {
    for (const [field, limit, errorMessage] of portfolioByteLimits) {
      const bytes = portfolioEncoder.encode(JSON.stringify(data[field])).length;
      if (bytes > limit * 0.95) return errorMessage;
    }
    return null;
  }

  let portfolioWrite = Promise.resolve();
  async function persistPortfolio(button = null) {
    if (!user || hydrating) return false;
    clearTimeout(saveTimer);
    if (button) {
      button.disabled = true;
      button.textContent = "Saving…";
    }
    harvest();
    const payload = {
      user_id: user.id,
      activities: structuredClone(portfolio.activities),
      honors: structuredClone(portfolio.honors),
      essays: structuredClone(portfolio.essays),
      academic_context: portfolio.academic_context,
      brag_sheet: portfolio.brag_sheet,
      future_goals: portfolio.future_goals,
      additional_notes: portfolio.additional_notes,
      updated_at: new Date().toISOString(),
    };
    const sizeError = portfolioSizeError(payload);
    if (sizeError) {
      message(sizeError + " Your unsaved text is still here.", true);
      if (button) {
        button.textContent = "Retry saving";
        button.dataset.saved = "false";
        button.disabled = false;
      }
      return false;
    }
    message("Saving your profile…");
    const run = portfolioWrite
      .catch(() => {})
      .then(async () => {
        const { error } = await sb
          .from("student_profile_portfolios")
          .upsert(payload, { onConflict: "user_id" });
        if (error) throw error;
        progress();
        message("Saved to your private account ✓");
        return true;
      });
    portfolioWrite = run;
    try {
      await run;
      if (button) {
        button.textContent = "Saved ✓";
        button.dataset.saved = "true";
      }
      return true;
    } catch (error) {
      message("Save failed: " + (error?.message || String(error)), true);
      if (button) {
        button.textContent = "Retry saving";
        button.dataset.saved = "false";
      }
      return false;
    } finally {
      if (button) button.disabled = false;
    }
  }
  function activityForm(entry, index) {
    const card = el("article", { class: "entry-card" });
    card.dataset.activityIndex = index;
    const head = el("div", { class: "entry-head" });
    const info = el("div");
    info.append(
      el("h4", {}, "Activity " + (index + 1)),
      el("p", {}, "A concise Common App-ready entry and your fuller personal notes."),
    );
    head.append(info);
    const actions = el("div", { class: "entry-actions" });
    const copy = el("button", { type: "button" }, "Copy entry");
    copy.addEventListener("click", () => copyText(formatActivity(index)));
    const remove = el("button", { type: "button", class: "remove" }, "Remove");
    remove.onclick = () => {
      if (!confirm("Remove this activity from your Bdesh profile?")) return;
      const cards = collectCards("activity");
      cards.splice(index, 1);
      portfolio.activities = cards;
      renderActivities();
      queueSave();
    };
    actions.append(copy, remove);
    head.append(actions);
    card.append(head);
    const body = el("div", { class: "entry-body" }),
      grid = el("div", { class: "entry-grid" });
    const types = [
      ["", "Choose type"],
      ...[
        "Academic",
        "Art",
        "Athletics",
        "Career Oriented",
        "Community Service (Volunteer)",
        "Computer/Technology",
        "Cultural",
        "Debate/Speech",
        "Environmental",
        "Family Responsibilities",
        "Foreign Exchange",
        "Journalism/Publication",
        "Music",
        "Research",
        "Robotics",
        "School Spirit",
        "Science/Math",
        "Student Government/Politics",
        "Theater/Drama",
        "Work (Paid)",
        "Other",
      ].map((x) => [x, x]),
    ];
    const settings = [
      ["Activity type", "activity_type", "select", { choices: types }],
      [
        "Position / leadership (50 characters)",
        "position",
        "text",
        { max: 50, placeholder: "e.g. Founder and Club President" },
      ],
      [
        "Organization / activity name (100 characters)",
        "organization",
        "text",
        { max: 100, placeholder: "e.g. School science club" },
      ],
      [
        "Description of this activity (150 characters)",
        "description",
        "textarea",
        {
          max: 150,
          rows: 3,
          wide: true,
          placeholder: "What did you do? Focus on responsibilities and genuine impact.",
        },
      ],
      ["Hours per week", "hours_per_week", "number", { min: 0, maxnum: 168 }],
      ["Weeks per year", "weeks_per_year", "number", { min: 0, maxnum: 52 }],
      [
        "Participation timing",
        "timing",
        "select",
        {
          choices: [
            ["", "Choose timing"],
            ["School year", "During school year"],
            ["School break", "During school break"],
            ["All year", "All year"],
          ],
        },
      ],
      [
        "Do you intend to do this in college?",
        "continue_college",
        "select",
        {
          choices: [
            ["", "Not decided"],
            ["yes", "Yes"],
            ["no", "No"],
          ],
        },
      ],
      [
        "Full description / accomplishments (private)",
        "details",
        "textarea",
        {
          max: 2200,
          rows: 5,
          wide: true,
          placeholder:
            "Record what you actually did, measurable results where verifiable, stories, responsibilities, obstacles and what you learned.",
        },
      ],
      [
        "What I hope to do next (private)",
        "future",
        "textarea",
        {
          max: 1000,
          rows: 3,
          wide: true,
          placeholder: "Goals and planned activities that are not yet achievements.",
        },
      ],
    ];
    for (const [label, name, type, opts] of settings) {
      const f = field(label, name, type, opts);
      const input = f.querySelector("[name]");
      input.value = entry[name] ?? "";
      input.dispatchEvent(new Event("input"));
      if (["position", "organization", "description"].includes(name)) {
        const copyField = el(
          "button",
          { type: "button", class: "copy-field" },
          "Copy " +
            (name === "position" ? "role" : name === "organization" ? "organization" : "description") +
            " ↗",
        );
        copyField.addEventListener("click", () => copyText(input.value));
        f.append(copyField);
      }
      grid.append(f);
    }
    const grade = el("div", { class: "wide" });
    grade.append(el("div", { class: "field-label" }, "Grades during which you participated"));
    const checks = el("div", { class: "check-fields" });
    for (const g of ["9", "10", "11", "12", "PG"]) {
      const label = el("label");
      const cb = el("input", { type: "checkbox", name: "grades", value: g });
      cb.checked = (entry.grades || []).includes(g);
      label.append(cb, document.createTextNode("Grade " + g));
      checks.append(label);
    }
    grade.append(checks);
    grid.append(grade);
    body.append(grid);
    const foot = el("div", { class: "entry-bottom" });
    foot.append(
      el(
        "span",
        { class: "inline-note" },
        "Short fields are ready to copy. Detailed notes stay in your Bdesh file.",
      ),
    );
    const save = el("button", { type: "button", class: "primary-button" }, "Save activity");
    save.onclick = () => persistPortfolio(save);
    foot.append(save);
    body.append(foot);
    card.append(body);
    card.addEventListener("input", () => {
      save.textContent = "Save activity";
      save.dataset.saved = "false";
      queueSave();
    });
    card.addEventListener("change", () => {
      save.textContent = "Save activity";
      save.dataset.saved = "false";
      queueSave();
    });
    return card;
  }
  function honorForm(entry, index) {
    const card = el("article", { class: "entry-card" });
    const head = el("div", { class: "entry-head" });
    head.append(el("h4", {}, "Honor " + (index + 1)));
    const remove = el("button", { type: "button", class: "outline-button" }, "Remove");
    remove.onclick = () => {
      if (!confirm("Remove honor?")) return;
      const all = collectCards("honor");
      all.splice(index, 1);
      portfolio.honors = all;
      renderHonors();
      queueSave();
    };
    head.append(remove);
    card.append(head);
    const body = el("div", { class: "entry-body" }),
      grid = el("div", { class: "entry-grid" });
    const fields = [
      [
        "Honor title",
        "title",
        "text",
        { max: 150, wide: true, placeholder: "e.g. National Science Olympiad finalist" },
      ],
      [
        "Recognition level",
        "level",
        "select",
        {
          choices: [
            ["", "Select level"],
            ["school", "School"],
            ["regional", "State / regional"],
            ["national", "National"],
            ["international", "International"],
          ],
        },
      ],
      [
        "Grade received",
        "grade",
        "select",
        { choices: [["", "Choose grade"], ...["9", "10", "11", "12", "PG"].map((x) => [x, x])] },
      ],
      [
        "Context and details (private)",
        "details",
        "textarea",
        { max: 1200, wide: true, rows: 3, placeholder: "What was the competition? What did you do?" },
      ],
    ];
    for (const [label, name, type, opts] of fields) {
      const f = field(label, name, type, opts);
      f.querySelector("[name]").value = entry[name] ?? "";
      grid.append(f);
    }
    body.append(grid);
    const foot = el("div", { class: "entry-bottom" });
    const save = el("button", { type: "button", class: "primary-button" }, "Save honor");
    save.onclick = () => persistPortfolio(save);
    foot.append(save);
    body.append(foot);
    card.append(body);
    card.addEventListener("input", () => {
      save.textContent = "Save honor";
      save.dataset.saved = "false";
      queueSave();
    });
    card.addEventListener("change", () => {
      save.textContent = "Save honor";
      save.dataset.saved = "false";
      queueSave();
    });
    return card;
  }
  function essayForm(entry, index) {
    const card = el("article", { class: "entry-card" });
    const head = el("div", { class: "entry-head" });
    head.append(el("h4", {}, entry.title || "Draft " + (index + 1)));
    const actions = el("div", { class: "entry-actions" });
    const copy = el("button", { type: "button" }, "Copy essay");
    copy.onclick = () => copyText(card.querySelector('[name="body"]').value);
    const remove = el("button", { type: "button", class: "remove" }, "Remove");
    remove.onclick = () => {
      if (!confirm("Remove this essay draft?")) return;
      const all = collectCards("essay");
      all.splice(index, 1);
      portfolio.essays = all;
      renderEssays();
      queueSave();
    };
    actions.append(copy, remove);
    head.append(actions);
    card.append(head);
    const body = el("div", { class: "entry-body" }),
      grid = el("div", { class: "entry-grid" });
    const title = field("Draft title", "title", "text", {
      wide: true,
      max: 140,
      placeholder: "e.g. My personal statement — draft 1",
    });
    title.querySelector("input").value = entry.title || "";
    const prompt = field("Essay prompt or idea", "prompt", "textarea", {
      wide: true,
      max: 750,
      rows: 3,
      placeholder: "What question are you answering, or what is your idea?",
    });
    prompt.querySelector("textarea").value = entry.prompt || "";
    const writing = field("My essay draft", "body", "textarea", {
      wide: true,
      max: 6500,
      rows: 12,
      placeholder:
        "Write your own draft here. Early drafts can be longer than the final application response.",
    });
    writing.querySelector("textarea").value = entry.body || "";
    const wc = el("small", { class: "word-count" });
    const update = () => {
      const n = writing.querySelector("textarea").value.trim().split(/\s+/).filter(Boolean).length;
      wc.textContent = n + " words · Common App personal essay: 650-word maximum where required";
    };
    writing.querySelector("textarea").addEventListener("input", update);
    writing.append(wc);
    update();
    grid.append(title, prompt, writing);
    body.append(grid);
    const foot = el("div", { class: "entry-bottom" });
    foot.append(
      el("span", { class: "inline-note" }, "Make sure the final essay is your own authentic writing."),
    );
    const save = el("button", { type: "button", class: "primary-button" }, "Save draft");
    save.onclick = () => persistPortfolio(save);
    foot.append(save);
    body.append(foot);
    card.append(body);
    card.addEventListener("input", () => {
      save.textContent = "Save draft";
      save.dataset.saved = "false";
      queueSave();
    });
    card.addEventListener("change", () => {
      save.textContent = "Save draft";
      save.dataset.saved = "false";
      queueSave();
    });
    return card;
  }
  function empty(message, sub) {
    const box = el("div", { class: "entry-empty" });
    box.append(el("strong", {}, message), el("div", {}, sub));
    return box;
  }
  function updateCounts() {
    $("activity-count").textContent = portfolio.activities.length + " / 10";
    $("honor-count").textContent = portfolio.honors.length + " / 5";
    $("essay-count").textContent = portfolio.essays.length + " drafts";
    $("add-activity").disabled = portfolio.activities.length >= 10;
    $("add-honor").disabled = portfolio.honors.length >= 5;
    $("add-essay").disabled = portfolio.essays.length >= 6;
    const nav = $("profile-nav");
    const labels = nav.querySelectorAll("small");
    if (labels[0]) labels[0].textContent = portfolio.activities.length + " / 10";
    if (labels[1]) labels[1].textContent = portfolio.honors.length + " / 5";
  }
  function renderActivities() {
    const wrap = $("activity-list");
    wrap.replaceChildren();
    portfolio.activities.forEach((a, i) => wrap.append(activityForm(a, i)));
    if (!portfolio.activities.length)
      wrap.append(
        empty(
          "Your activities will appear here.",
          "Clubs, home responsibilities, work, projects, volunteering, sports and more.",
        ),
      );
    updateCounts();
  }
  function renderHonors() {
    const wrap = $("honor-list");
    wrap.replaceChildren();
    portfolio.honors.forEach((h, i) => wrap.append(honorForm(h, i)));
    if (!portfolio.honors.length)
      wrap.append(empty("No honors entered yet.", "Awards and academic recognition are optional."));
    updateCounts();
  }
  function renderEssays() {
    const wrap = $("essay-list");
    wrap.replaceChildren();
    portfolio.essays.forEach((e, i) => wrap.append(essayForm(e, i)));
    if (!portfolio.essays.length)
      wrap.append(
        empty("Begin with a story.", "Create a draft to collect essay ideas and revise them over time."),
      );
    updateCounts();
  }
  $("add-activity").addEventListener("click", () => {
    harvest();
    if (portfolio.activities.length >= 10) return;
    portfolio.activities.push({});
    renderActivities();
    queueSave();
    $("activity-list").lastElementChild?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $("add-honor").addEventListener("click", () => {
    harvest();
    if (portfolio.honors.length >= 5) return;
    portfolio.honors.push({});
    renderHonors();
    queueSave();
  });
  $("add-essay").addEventListener("click", () => {
    harvest();
    if (portfolio.essays.length >= 6) return;
    portfolio.essays.push({ title: "Draft " + (portfolio.essays.length + 1), prompt: "", body: "" });
    renderEssays();
    queueSave();
  });
  $("academics-form").addEventListener("submit", (e) => {
    e.preventDefault();
    saveBasic();
  });
  $("brag-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const button = e.currentTarget.querySelector('button[type="submit"]');
    const ok = await persistPortfolio(button);
    if (ok) showSection("review");
  });
  $("academics-form").addEventListener("input", () => {
    if (!hydrating && user) {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => saveBasic(false), 1400);
      message("Unsaved changes…");
      const btn = $("academics-form").querySelector('button[type="submit"]');
      btn.textContent = "Save education & testing";
      btn.dataset.saved = "false";
    }
  });
  $("brag-form").addEventListener("input", () => {
    const btn = $("brag-form").querySelector('button[type="submit"]');
    btn.textContent = "Save my story";
    btn.dataset.saved = "false";
    queueSave();
  });
  function formatActivity(i) {
    const a = collectCards("activity")[i] || {};
    return [
      "Activity " + (i + 1),
      "Activity type: " + (a.activity_type || ""),
      "Position/Leadership: " + (a.position || ""),
      "Organization name: " + (a.organization || ""),
      "Description: " + (a.description || ""),
      "Grades: " + (a.grades || []).join(", "),
      "Participation: " + (a.timing || ""),
      "Hours per week: " + (a.hours_per_week ?? ""),
      "Weeks per year: " + (a.weeks_per_year ?? ""),
      "Continue in college: " + (a.continue_college || ""),
    ].join("\n");
  }
  async function copyText(str) {
    try {
      await navigator.clipboard.writeText(str);
      message("Copied to clipboard ✓");
    } catch {
      message("Clipboard unavailable. Select and copy the text manually.", true);
    }
  }
  function profileText() {
    harvest();
    let lines = [
      "BDESH · PRIVATE STUDENT PROFILE",
      "For the student’s own review; not an official Common App submission.",
      "",
      "EDUCATION",
      "Preferred name: " + (basic.display_name || ""),
      "School: " + (basic.school_name || ""),
      "HSC year: " + (basic.graduation_year || ""),
      "SSC GPA: " + (basic.ssc_gpa ?? ""),
      "HSC GPA: " + (basic.hsc_gpa ?? ""),
      "SAT: " + (basic.sat_total ?? ""),
      "English test: " + (basic.english_test || "") + " " + (basic.english_score || ""),
      "Major interests: " + (basic.intended_majors || ""),
      "Countries: " + (basic.countries || []).join(", "),
      "Academic context: " + (portfolio.academic_context || ""),
      "",
      "ACTIVITIES",
    ];
    portfolio.activities.forEach((a, i) => {
      lines.push(
        "",
        i + 1 + ". " + (a.position || "") + " — " + (a.organization || ""),
        a.description || "",
        "Grades: " +
          (a.grades || []).join(", ") +
          "; Hours/week: " +
          (a.hours_per_week ?? "") +
          "; Weeks/year: " +
          (a.weeks_per_year ?? ""),
        "Details: " + (a.details || ""),
        "Future plans: " + (a.future || ""),
      );
    });
    lines.push("", "HONORS");
    portfolio.honors.forEach((h, i) =>
      lines.push(i + 1 + ". " + (h.title || "") + " (" + (h.level || "") + ") — " + (h.details || "")),
    );
    lines.push("", "ESSAY DRAFTS");
    portfolio.essays.forEach((e, i) =>
      lines.push(i + 1 + ". " + (e.title || ""), "Prompt: " + (e.prompt || ""), e.body || ""),
    );
    lines.push(
      "",
      "BRAG SHEET",
      portfolio.brag_sheet || "",
      "FUTURE GOALS",
      portfolio.future_goals || "",
      "ADDITIONAL NOTES",
      portfolio.additional_notes || "",
    );
    return lines.join("\n");
  }
  function renderReview() {
    harvest();
    const wrap = $("profile-summary");
    wrap.replaceChildren();
    const cards = [
      [
        "Academic snapshot",
        [
          basic.school_name || "School not entered",
          basic.ssc_gpa != null ? "SSC GPA " + basic.ssc_gpa : "SSC results not entered",
          basic.sat_total ? "SAT " + basic.sat_total : "SAT not entered",
          basic.intended_majors || "Academic interests not entered",
        ],
      ],
      [
        "Activities",
        portfolio.activities.map(
          (a, i) =>
            i +
            1 +
            ". " +
            (a.position || "Activity") +
            " — " +
            (a.organization || "Organization") +
            " · " +
            (a.description || ""),
        ),
      ],
      ["Honors", portfolio.honors.map((h) => h.title || "Untitled honor")],
      [
        "Essay drafts",
        portfolio.essays.map(
          (e) =>
            (e.title || "Untitled") +
            " — " +
            (e.body || "").trim().split(/\s+/).filter(Boolean).length +
            " words",
        ),
      ],
      [
        "Brag sheet and goals",
        [
          (portfolio.brag_sheet || "No accomplishments recorded yet").slice(0, 500),
          (portfolio.future_goals || "No future goals recorded yet").slice(0, 300),
        ],
      ],
    ];
    for (const [title, items] of cards) {
      const card = el("article", { class: "review-card" });
      card.append(el("h3", {}, title));
      const ul = el("ul");
      if (!items.length) items.push("Nothing entered yet");
      for (const text of items) ul.append(el("li", {}, text));
      card.append(ul);
      wrap.append(card);
    }
  }
  $("copy-summary").addEventListener("click", async () => {
    await persistPortfolio();
    await copyText(profileText());
  });
  $("print-profile").addEventListener("click", async () => {
    const button = $("print-profile");
    button.disabled = true;
    try {
      await persistPortfolio();
      const lines = profileText().split("\n");
      let frame = document.getElementById("bdesh-print-frame");
      if (frame) frame.remove();
      frame = document.createElement("iframe");
      frame.id = "bdesh-print-frame";
      frame.title = "Private profile PDF preview";
      frame.setAttribute("aria-hidden", "true");
      frame.style.cssText = "position:fixed;left:-10000px;top:0;width:800px;height:1100px;border:0";
      document.body.append(frame);
      const doc = frame.contentDocument;
      doc.open();
      doc.write(
        '<!doctype html><html><head><meta charset="utf-8"><title>Bdesh private student profile</title><style>@page{size:A4;margin:19mm}body{font:11pt/1.5 Georgia,serif;color:#625c58}h1{font-size:25pt;margin:0 0 5mm;color:#e66f38}h2{font:700 14pt Arial,sans-serif;border-bottom:1px solid #eed2c0;padding-bottom:2mm;margin:9mm 0 3mm;break-after:avoid}p{white-space:pre-wrap;overflow-wrap:anywhere;margin:0 0 2.5mm}small{font:9pt Arial,sans-serif;color:#756e69}.entry{break-inside:avoid}header{border-bottom:2px solid #e66f38;margin-bottom:8mm;padding-bottom:4mm}</style></head><body></body></html>',
      );
      doc.close();
      const body = doc.body;
      const header = doc.createElement("header");
      const h = doc.createElement("h1");
      h.textContent = "bdesh.  |  Student profile";
      const small = doc.createElement("small");
      small.textContent =
        "Private student-prepared notes. Not an official application or university submission.";
      header.append(h, small);
      body.append(header);
      const headings = new Set([
        "EDUCATION",
        "ACTIVITIES",
        "HONORS",
        "ESSAY DRAFTS",
        "BRAG SHEET",
        "FUTURE GOALS",
        "ADDITIONAL NOTES",
      ]);
      for (const [i, line] of lines.entries()) {
        if (i < 3 || !line.trim()) continue;
        const el = doc.createElement(headings.has(line) ? "h2" : "p");
        el.textContent = line;
        body.append(el);
      }
      const footer = doc.createElement("p");
      footer.textContent =
        "Generated locally from this student’s Bdesh profile. Review for accuracy before sharing.";
      footer.style.cssText = "font-size:9pt;color:#756e69;margin-top:10mm";
      body.append(footer);
      frame.contentWindow.focus();
      frame.contentWindow.print();
      message("Choose “Save as PDF” as the print destination. Your profile was prepared locally.");
    } catch (err) {
      message("Could not prepare PDF: " + (err?.message || err), true);
    } finally {
      button.disabled = false;
    }
  });

  function progress() {
    const form = $("academics-form");
    const complete = [
      Boolean(val(form, "school_name") || val(form, "ssc_gpa")),
      Boolean(val(form, "academic_context")),
      portfolio.activities.some((a) => a.position || a.organization || a.description),
      portfolio.honors.some((h) => h.title),
      portfolio.essays.some((e) => e.body),
      Boolean(portfolio.brag_sheet || portfolio.future_goals),
    ];
    const n = complete.filter(Boolean).length;
    $("completion-value").textContent = n + " / 6";
    $("completion-track").style.width = (n / 6) * 100 + "%";
  }
  $("sign-out").addEventListener("click", async () => {
    await sb.auth.signOut();
    location.href = "/";
  });
  $("profile-google-login").addEventListener("click", async () => {
    const btn = $("profile-google-login");
    btn.disabled = true;
    $("signin-error").textContent = "";
    try {
      if (!sb) throw Error("Login library unavailable");
      const { error } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: location.origin + "/profile.html" },
      });
      if (error) throw error;
    } catch (e) {
      showError(e.message);
      btn.disabled = false;
    }
  });
  async function init(session) {
    user = session.user;
    $("account-name").textContent = user.email || "Signed in";
    $("sign-out").hidden = false;
    $("sign-in-wall").hidden = true;
    $("profile-app").hidden = false;
    message("Loading your saved profile…");
    hydrating = true;
    const [baseResult, portfolioResult] = await Promise.all([
      sb.from("student_admissions_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      sb.from("student_profile_portfolios").select("*").eq("user_id", user.id).maybeSingle(),
    ]);
    basic = baseResult.data || {};
    portfolio = { ...blank(), ...(portfolioResult.data || {}) };
    if (!portfolioResult.data && basic.activities?.length) {
      portfolio.activities = basic.activities
        .slice(0, 10)
        .map((a) =>
          typeof a === "string"
            ? { activity_type: "Other", description: a.slice(0, 150), details: a }
            : { ...a },
        );
    }
    if (!portfolioResult.data && basic.awards?.length) {
      portfolio.honors = basic.awards
        .slice(0, 5)
        .map((a) => (typeof a === "string" ? { title: a.slice(0, 150) } : { ...a }));
    }
    fillBasic();
    for (const k of ["brag_sheet", "future_goals", "additional_notes"])
      $("brag-form").elements.namedItem(k).value = portfolio[k] || "";
    renderActivities();
    renderHonors();
    renderEssays();
    hydrating = false;
    progress();
    message(
      baseResult.error || portfolioResult.error
        ? "Some records could not load. Reload or try again."
        : "Profile ready · private cloud storage",
    );
    showSection(location.hash.slice(1) || "overview");
    if (!portfolioResult.data && (portfolio.activities.length || portfolio.honors.length)) queueSave();
  }
  if (!sb) {
    $("sign-in-wall").hidden = false;
    showError("Authentication library did not load. Reload this page.");
    return;
  }
  sb.auth
    .getSession()
    .then(({ data, error }) => {
      if (error || !data?.session) {
        $("sign-in-wall").hidden = false;
        $("account-name").textContent = "Not signed in";
        if (error) showError(error.message);
        return;
      }
      init(data.session).catch((e) => {
        $("sign-in-wall").hidden = false;
        showError(e.message);
      });
    })
    .catch((e) => {
      $("sign-in-wall").hidden = false;
      showError(e.message);
    });
})();
