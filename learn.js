/* Bdesh Start Here. Educational material; no AI or admissions guarantees. */
(() => {
  "use strict";
  const lessons = [
    {
      id: "welcome",
      label: "The big picture",
      time: 5,
      title: "You can begin from zero.",
      lead: "You do not need to understand admissions yet. This guide starts with the question every beginner asks: how does a student from Bangladesh actually apply abroad?",
      sections: [
        [
          "The journey in one sentence",
          "You prepare your academic and personal record, research universities that can fund you, submit an admission application and any separate financial aid forms, then follow each college’s instructions until you receive a decision.",
        ],
        [
          "What is an application?",
          "Think of it as a portrait of your education and life. A college usually asks who you are, where you studied, how you performed, what you did outside class, why you want to study, and what teachers have observed about you. Some ask for extra essays, interviews, portfolios, tests or financial documents.",
        ],
        [
          "Two decisions, not one",
          "Admission means a university is willing to offer you a place. Funding means you can afford to attend. Those are connected but not identical. A college may admit you without offering enough money.",
        ],
        [
          "Your first task",
          "Do not rush to create a giant college list. Learn the vocabulary and the application components first. Then you can research intelligently.",
        ],
      ],
      takeaway: "Admission and affordability are two separate questions.",
      quiz: {
        q: "If a college admits you, does that automatically mean it will cover all your costs?",
        options: [
          "Yes, admission means full funding.",
          "No. Financial aid is a separate consideration.",
          "Only if you submitted an SAT.",
        ],
        correct: 1,
        why: "Correct. A full-ride applicant needs to understand both the admission requirements and the funding process.",
      },
    },
    {
      id: "funding",
      label: "What is a full ride?",
      time: 6,
      title: "A scholarship is not always a full ride.",
      lead: "The words full scholarship, full tuition and full ride are often used loosely. They can mean very different things for your family.",
      sections: [
        [
          "Full tuition vs. full ride",
          "A full-tuition award pays tuition but may leave accommodation, meals, insurance, books, travel and personal expenses unpaid. A full ride is generally understood to cover major tuition and living expenses, but coverage differs by offer. Always inspect the actual award letter.",
        ],
        [
          "Need-based and merit aid",
          "Need-based aid considers the student’s financial circumstances under the university’s policy. Merit aid rewards qualifications or achievements under a scholarship’s rules. Some students receive a combination. These are not universal systems across countries.",
        ],
        [
          "Cost of attendance",
          "Add tuition, university fees, housing, meals, health insurance, books, transportation, travel and personal costs. Subtract grants and scholarships. If there is a remaining amount, it is a funding gap—even if the offer advertises a large scholarship.",
        ],
        [
          "The international-student catch",
          "Policies vary widely. Some institutions fund admitted international students generously; others provide limited funding or none. A university accepting Bangladeshi applicants does not necessarily make full funding available.",
        ],
      ],
      takeaway: "Always calculate the remaining amount your family would have to pay.",
      quiz: {
        q: "A scholarship pays 100% of tuition but none of your living expenses. Is it necessarily a full ride?",
        options: ["Yes.", "No, it could be full tuition only.", "It depends on your SAT score."],
        correct: 1,
        why: "Exactly. Full tuition does not automatically cover living and other costs.",
      },
    },
    {
      id: "application",
      label: "Inside an application",
      time: 7,
      title: "What are you actually submitting?",
      lead: "Imagine opening a university application portal. Instead of one magical form, you will find several connected sections.",
      sections: [
        [
          "Identity and educational history",
          "Your name and contact details, current school, academic history, intended program or major, and sometimes information about your household. Do not submit incorrect information to make yourself look more impressive.",
        ],
        [
          "Academic documents",
          "Transcripts or grade reports, school profile or grading explanation, SSC/HSC results or predicted grades where applicable. The school or counselor may submit some of these directly.",
        ],
        [
          "Your own voice",
          "A personal statement or longer essay can give context beyond numerical grades. Individual colleges may ask why you chose them, what you hope to study, or other supplemental questions.",
        ],
        [
          "Evidence from other people",
          "Teacher recommendations, school reports, and sometimes a counselor recommendation help colleges understand how you learn and contribute.",
        ],
        [
          "Supporting steps",
          "Some colleges ask for standardized test scores, English-language evidence, a portfolio, an interview, or separate scholarship applications. Many institutions use their own portals rather than Common App.",
        ],
      ],
      takeaway: "An application is a collection of sections and supporting materials—not just GPA and SAT.",
      quiz: {
        q: "Which is the most complete picture of a typical university application?",
        options: [
          "Only grades and test scores.",
          "Grades, background, activities, essays, recommendations and sometimes additional items.",
          "Only a scholarship request letter.",
        ],
        correct: 1,
        why: "Correct. Requirements differ, but applications usually combine several kinds of information.",
      },
    },
    {
      id: "academics",
      label: "Grades and academics",
      time: 6,
      title: "Your academic record is the foundation.",
      lead: "Universities want to know whether you are ready for demanding university-level work.",
      sections: [
        [
          "What matters from Bangladesh",
          "SSC and HSC grades, subject performance, available transcripts and the context of the NCTB curriculum may matter. A college might ask about coursework or predicted final results if you have not finished HSC.",
        ],
        [
          "There is no universal magic GPA",
          "Excellent grades can make an application stronger, but there is no single SSC/HSC cutoff that guarantees a full ride across all universities. A program or scholarship may set explicit minimums, so always check the source.",
        ],
        [
          "Context and improvement",
          "Your school environment, available courses, academic trend and circumstances can help explain your record where an application allows context. Do not invent adversity or assume an explanation erases academic expectations.",
        ],
        [
          "What to do now",
          "Take your current coursework seriously, keep accurate documents, clarify your school’s transcript process and note important examination dates.",
        ],
      ],
      takeaway: "Strong academics open doors, but admission and funding still require a wider application.",
      quiz: {
        q: "Which statement about grades is most accurate?",
        options: [
          "5.00 GPA guarantees a full ride.",
          "Academic performance matters, but each institution sets its own expectations.",
          "Grades are irrelevant if you volunteer.",
        ],
        correct: 1,
        why: "Right. Academic requirements and selection priorities vary.",
      },
    },
    {
      id: "tests",
      label: "SAT and English tests",
      time: 7,
      title: "Which exams do you actually need?",
      lead: "Tests are tools, not automatic tickets to a scholarship. The right testing plan depends on where you apply.",
      sections: [
        [
          "SAT / ACT",
          "Some universities require SAT or ACT, some allow applicants to choose whether to submit them, and some do not consider them. Test policies can change between application cycles. Scholarships may have their own testing conditions.",
        ],
        [
          "English proficiency",
          "IELTS, TOEFL or Duolingo English Test may demonstrate English proficiency. A university can waive a test under specific conditions, or it may accept only certain exams. SAT reading is not automatically a substitute.",
        ],
        [
          "Should you retake a test?",
          "Consider official requirements, your available preparation time, fees and whether a higher score will meaningfully help at the institutions on your list. Do not assume every student needs an extraordinarily high SAT.",
        ],
        [
          "Practical first step",
          "Create a simple table of each college’s current test policy, accepted tests, minimums if specified, waiver rules, score submission method and last accepted test date.",
        ],
      ],
      takeaway: "Check policies school by school before deciding whether a test is necessary.",
      quiz: {
        q: "A college is test-optional. What does that generally mean?",
        options: [
          "Nobody may send a test score.",
          "Applicants may generally choose whether to submit an eligible score.",
          "It automatically waives English testing.",
        ],
        correct: 1,
        why: "Correct. English-proficiency requirements are usually a separate policy.",
      },
    },
    {
      id: "activities",
      label: "ECAs, work and impact",
      time: 7,
      title: "What you do matters more than a fancy title.",
      lead: "Extracurricular activities (ECAs) show how you spend your time, contribute, solve problems and follow your interests.",
      sections: [
        [
          "What counts",
          "School clubs, Olympiads, coding projects, sports, art, journalism, volunteering, tutoring, part-time employment, family responsibilities, community organizing and independent learning can all be meaningful, depending on the application.",
        ],
        [
          "Depth over collecting certificates",
          "A sustained contribution with real responsibility can tell a better story than many superficial memberships. Explain what you did, how often, why it mattered and what changed as a result.",
        ],
        [
          "Impact without exaggeration",
          "Use accurate numbers only when you can substantiate them. Describe a modest but real initiative honestly rather than making up international impact.",
        ],
        [
          "Start an activities inventory",
          "For each activity, record its name, your role, dates, hours or frequency when known, specific contributions and results. Bdesh’s student profile can store a concise version of this information.",
        ],
      ],
      takeaway:
        "You do not need twenty clubs or an international medal to start building a meaningful profile.",
      quiz: {
        q: "Which activity description is stronger?",
        options: [
          "President of everything, changed the world.",
          "Organized weekly tutoring for six younger students over eight months.",
          "Joined fifteen clubs but did not participate.",
        ],
        correct: 1,
        why: "Specific, truthful descriptions communicate contribution more effectively.",
      },
    },
    {
      id: "writing",
      label: "Essays and personal story",
      time: 7,
      title: "An essay lets a real person appear on the page.",
      lead: "Your grades describe performance. Essays can show how you think, what you notice and why an experience matters.",
      sections: [
        [
          "Personal statement",
          "Some application systems offer a longer personal essay. The goal is not to repeat your entire résumé; it is to reveal something meaningful about your perspective, decisions or development.",
        ],
        [
          "Supplemental essays",
          "Individual colleges may ask about academic interests, community, specific programs or other topics. A good answer addresses the actual prompt and uses real details.",
        ],
        [
          "What makes writing strong",
          "Specific moments, clear thinking, honest reflection and careful revision. Strong essays do not require dramatic trauma, decorative vocabulary or a perfect success story.",
        ],
        [
          "How to begin",
          "Collect small stories: a difficult choice, something you built, a conversation that changed your thinking, a responsibility you took seriously. Draft before you worry about perfect wording.",
        ],
      ],
      takeaway: "Your essay should sound like a thoughtful version of you, not a marketing brochure.",
      quiz: {
        q: "What is the best use of a personal essay?",
        options: [
          "Repeating every award from your activities section.",
          "Showing a real experience and what it reveals about you.",
          "Inventing a dramatic hardship.",
        ],
        correct: 1,
        why: "Yes. Thoughtful reflection and authentic details are more useful than an inflated résumé.",
      },
    },
    {
      id: "recs",
      label: "Letters of recommendation",
      time: 6,
      title: "Let your teachers show another side of you.",
      lead: "Letters of recommendation (LORs) give universities an outside perspective on how you learn and behave.",
      sections: [
        [
          "Who writes them?",
          "Depending on the university, one or more subject teachers, a counselor or a school official may be asked to submit recommendations. Check the specific college’s requirements.",
        ],
        [
          "What makes a useful letter",
          "A recommender who knows your work can give examples of curiosity, perseverance, classroom participation, growth, or support for others. A prestigious title alone does not guarantee a strong letter.",
        ],
        [
          "How to ask",
          "Ask respectfully and early, explain your university plans, give an accurate summary of your coursework and projects, and provide deadlines. Follow your school’s procedures.",
        ],
        [
          "Confidentiality and ethics",
          "Never impersonate a teacher or submit fabricated recommendations. Some systems ask you to choose whether to waive access to confidential letters. Understand that choice before making it.",
        ],
      ],
      takeaway: "Choose recommenders for how well they know you, and give them enough time.",
      quiz: {
        q: "Who is usually the better recommender?",
        options: [
          "A famous stranger who barely knows you.",
          "A teacher who can discuss your work with specific examples.",
          "Someone willing to invent achievements.",
        ],
        correct: 1,
        why: "Specific firsthand knowledge is valuable.",
      },
    },
    {
      id: "aid",
      label: "Aid forms and documents",
      time: 8,
      title: "Funding can have its own application.",
      lead: "This is one of the most important lessons for a student who cannot afford to attend without aid.",
      sections: [
        [
          "Admissions vs. financial aid",
          "A university may require its admission application and its financial aid forms on separate deadlines. Submitting the admission application does not automatically submit your funding request.",
        ],
        [
          "Forms you may encounter",
          "Depending on the institution: CSS Profile, ISFAA, a university-specific international aid form or a separate scholarship application. Do not assume all universities use the same documents.",
        ],
        [
          "Possible supporting evidence",
          "Income explanations, employment documents, tax records or non-filer statements may be requested. Requirements vary. Bdesh does not need your parents’ documents to teach you the process.",
        ],
        [
          "Why accuracy matters",
          "Report family finances truthfully and use official definitions. If something in a form does not fit Bangladeshi documentation, ask the institution’s financial aid office for instructions.",
        ],
        [
          "A crucial planning habit",
          "Track the admission deadline, the aid deadline, potential waiver requirements and the portal confirmation separately for each school.",
        ],
      ],
      takeaway: "Missing a financial aid deadline can matter even if the admission application was on time.",
      quiz: {
        q: "You submitted your admission application. Are your financial aid forms necessarily complete?",
        options: [
          "Yes, always.",
          "No. They may have separate forms, portals and deadlines.",
          "Only if your GPA is high.",
        ],
        correct: 1,
        why: "Exactly. Track financial aid requirements independently.",
      },
    },
    {
      id: "research",
      label: "Finding colleges",
      time: 7,
      title: "Research universities, not just rankings.",
      lead: "Your college list needs more than prestigious names. It needs institutions that you can actually apply to and potentially afford.",
      sections: [
        [
          "Academic fit",
          "Does the university offer fields you want to study? Does it accept your educational qualification, and does it have any specific academic prerequisites?",
        ],
        [
          "Financial fit",
          "Is meaningful funding available to international applicants? Is it need-based, merit-based or tied to a special scholarship? What costs could remain?",
        ],
        [
          "Admissions fit",
          "Understand selectivity without pretending to predict your personal chance. A highly selective school is rarely a dependable financial backup, even for strong students.",
        ],
        [
          "Application fit",
          "Check whether the institution uses Common App, another platform, or its own portal. Review essays, interviews, recommendations, standardized tests and deadlines.",
        ],
        [
          "Save your evidence",
          "Bookmark the official admissions page and financial aid page. Record when you checked the policy, because requirements change.",
        ],
      ],
      takeaway: "A useful shortlist balances academic fit, eligibility, funding, and realistic workload.",
      quiz: {
        q: "What should you confirm before placing a university on a full-ride shortlist?",
        options: [
          "Only its global ranking.",
          "Its admission requirements and actual funding policy for international students.",
          "Whether friends have heard of it.",
        ],
        correct: 1,
        why: "Correct. Rankings alone cannot tell you whether attending is financially possible.",
      },
    },
    {
      id: "timeline",
      label: "Deadlines and submission",
      time: 7,
      title: "An application has more than one deadline.",
      lead: "Now that you know the components, the process can be turned into an organized sequence of tasks.",
      sections: [
        [
          "Start early where possible",
          "Prepare academics, activities and English-language proficiency before application season. During the application period, draft essays, request letters and finalize your college shortlist.",
        ],
        [
          "Application rounds",
          "Some universities offer Early Decision, Early Action, Regular Decision or rolling admission; others use entirely different cycles. Early Decision may be binding, subject to its terms. Do not choose a round without understanding its rules.",
        ],
        [
          "Keep separate deadlines",
          "Applications, financial aid forms, scholarships, recommendations, test scores and portfolio submissions can close on different dates and time zones.",
        ],
        [
          "After you click submit",
          "Check your applicant portal, ensure required documents were received, monitor requests for missing information, and compare complete funding packages if admitted.",
        ],
        [
          "Organize in Bdesh",
          "Use the application tracker for each university, including admission and aid deadlines and a short checklist of remaining steps.",
        ],
      ],
      takeaway: "Submitting is not the end; you still need to monitor portals and decisions.",
      quiz: {
        q: "What is the safest way to manage deadlines?",
        options: [
          "Remember one deadline for every college.",
          "Track admission, aid, scholarship and supporting-material deadlines separately.",
          "Wait for universities to remind you.",
        ],
        correct: 1,
        why: "Yes. Different requirements can have different deadlines.",
      },
    },
    {
      id: "finish",
      label: "Your next move",
      time: 5,
      title: "You now know what the journey looks like.",
      lead: "You have reached the end of the foundations. The next step is not to memorize everything—it is to apply what you learned to your own situation.",
      sections: [
        [
          "First: build your profile",
          "Record your current academic stage, available SSC/HSC results, test plans, meaningful activities, honors, interests, countries and broad funding needs. You can leave unknown fields blank.",
        ],
        [
          "Second: make a readiness plan",
          "Check the milestones in your Bdesh workspace. Focus on what matters now for your stage, rather than trying to complete everything in a week.",
        ],
        [
          "Third: begin careful research",
          "Visit official university and scholarship pages. Investigate real funding eligibility, test requirements, deadlines and costs.",
        ],
        [
          "Fourth: build your application board",
          "Only after researching, add universities to your tracker and fill in verified admission and aid deadlines. Your checklist will become your next-action plan.",
        ],
        [
          "And remember",
          "A full ride is competitive. Bdesh can organize your work and teach the process; it cannot guarantee admission, scholarships or outcomes.",
        ],
      ],
      takeaway: "Learn → build your profile → research → apply and track. You have a plan.",
      quiz: {
        q: "After finishing Start Here, what is the most useful next step?",
        options: [
          "Apply to every famous university immediately.",
          "Build an accurate student profile and readiness plan.",
          "Assume you already qualify for a full ride.",
        ],
        correct: 1,
        why: "Exactly. Turn what you have learned into an honest, organized next-step plan.",
      },
    },
  ];
  const us = window.BDESH_US_COURSE;
  if (us) {
    lessons[0] = us.welcome;
    lessons.splice(3, 0, us.platform, us.holistic, us.sat);
    for (const lesson of lessons) {
      if (!["welcome", "platform", "holistic", "sat101"].includes(lesson.id))
        lesson.lead +=
          " This chapter explains U.S. undergraduate admissions; specific colleges set their own rules.";
    }
  }
  if (window.BDESH_US_DETAILS) {
    for (const lesson of lessons) {
      const details = window.BDESH_US_DETAILS[lesson.id];
      if (details) lesson.sections.push(...details);
    }
  }
  const $ = (id) => document.getElementById(id);
  // Anonymous reading data is retained separately from authenticated students.
  // No anonymous/previous-account progress is copied to a new account.
  const storageKeyFor = (id) => (id ? "bdesh-learning-v1-user-" + id : "bdesh-learning-v1");
  const readState = (id) => {
    try {
      const raw = JSON.parse(localStorage.getItem(storageKeyFor(id)) || "{}");
      return {
        done: new Set(Array.isArray(raw.done) ? raw.done.filter((x) => lessons.some((l) => l.id === x)) : []),
        current: lessons.some((l) => l.id === raw.current) ? raw.current : lessons[0].id,
      };
    } catch {
      return { done: new Set(), current: lessons[0].id };
    }
  };
  const state = readState(null);
  let current = lessons.findIndex((l) => l.id === state.current),
    answered = false,
    cloudUser = null;
  const sb = window.supabase?.createClient(
    window.BDESH_SUPABASE?.url,
    window.BDESH_SUPABASE?.key,
  );
  function persist() {
    localStorage.setItem(
      storageKeyFor(cloudUser?.id || null),
      JSON.stringify({ done: [...state.done], current: lessons[current].id }),
    );
  }
  function create(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function updateProgress() {
    const count = state.done.size;
    $("overall-progress").textContent = count + " / " + lessons.length;
    $("overall-bar").style.width = (count / lessons.length) * 100 + "%";
    $("reading-progress-bar").style.width = ((current + 1) / lessons.length) * 100 + "%";
  }
  function renderNav() {
    const nav = $("lesson-nav");
    nav.replaceChildren();
    lessons.forEach((lesson, i) => {
      const button = create(
        "button",
        "lesson-link" + (current === i ? " active" : "") + (state.done.has(lesson.id) ? " completed" : ""),
      );
      button.type = "button";
      button.setAttribute("aria-current", current === i ? "step" : "false");
      const number = create("span", "lesson-number", String(i + 1).padStart(2, "0"));
      const name = create("span", "lesson-name", lesson.label);
      const done = create("span", "lesson-done", state.done.has(lesson.id) ? "✓" : current === i ? "•" : "");
      button.append(number, name, done);
      button.onclick = () => go(i);
      nav.append(button);
    });
  }
  function render() {
    const lesson = lessons[current],
      wrap = $("lesson-content");
    wrap.replaceChildren();
    answered = false;
    $("chapter-id").textContent = "CHAPTER " + String(current + 1).padStart(2, "0") + " OF " + lessons.length;
    $("reading-time").textContent = lesson.time + " MIN READ";
    window.bdeshTrack?.("bdesh_lesson_viewed", { chapter_index: current + 1 });
    const small = create(
      "div",
      "lesson-eyebrow",
      "THE BDESH FIELD GUIDE / " + String(current + 1).padStart(2, "0"),
    );
    const title = create("h1", "", lesson.title),
      lead = create("p", "lesson-lead", lesson.lead);
    wrap.append(small, title, lead);
    if (current === 0) {
      const illustration = create("div", "journey-illustration");
      illustration.innerHTML =
        "<span>PREPARE</span><i>→</i><span>PROFILE</span><i>→</i><span>RESEARCH</span><i>→</i><span>APPLY</span>";
      wrap.append(illustration);
    }
    if (current === 2 || lesson.id === "platform") {
      const example = create("div", "application-example");
      example.innerHTML =
        '<div class="example-top"><span>ILLUSTRATIVE APPLICATION OVERVIEW</span><span>NOT AN ACTUAL UNIVERSITY FORM</span></div><div class="example-row"><b>01</b><span>Personal & family information</span><em>About you</em></div><div class="example-row"><b>02</b><span>Education and school record</span><em>Academic</em></div><div class="example-row"><b>03</b><span>Tests, activities and awards</span><em>Your work</em></div><div class="example-row"><b>04</b><span>Essays and recommendations</span><em>Your voice</em></div><div class="example-row"><b>05</b><span>Financial aid requirements</span><em>Funding</em></div>';
      wrap.append(example);
    }
    lesson.sections.forEach(([heading, paragraph], i) => {
      const section = create("section", "reading-section");
      const badge = create("span", "reading-section-num", String(i + 1).padStart(2, "0"));
      const headingEl = create("h2", "", heading);
      const text = create("p", "", paragraph);
      section.append(badge, headingEl, text);
      wrap.append(section);
    });
    const takeaway = create("div", "takeaway");
    takeaway.append(
      create("span", "takeaway-label", "THE IDEA TO REMEMBER"),
      create("p", "", lesson.takeaway),
    );
    wrap.append(takeaway);
    const check = lesson.quiz;
    $("check-question").textContent = check.q;
    const choices = $("check-options");
    choices.replaceChildren();
    $("check-feedback").textContent = "";
    $("knowledge-check").hidden = false;
    check.options.forEach((option, i) => {
      const button = create("button", "check-option", option);
      button.type = "button";
      button.onclick = () => answer(i);
      choices.append(button);
    });
    $("mark-read").textContent = state.done.has(lesson.id) ? "✓ Understood" : "Mark as understood ✓";
    $("prev-lesson").disabled = current === 0;
    $("next-lesson").textContent =
      current === lessons.length - 1 ? "Step 2: Build my profile ↗" : "Next lesson →";
    renderNav();
    updateProgress();
    persist();
  }
  function answer(index) {
    if (answered) return;
    const quiz = lessons[current].quiz,
      buttons = [...$("check-options").children],
      correct = index === quiz.correct;
    buttons.forEach((b, i) => {
      b.disabled = true;
      if (i === quiz.correct) b.classList.add("correct");
      else if (i === index) b.classList.add("incorrect");
    });
    $("check-feedback").textContent = (correct ? "Exactly. " : "Not quite. ") + quiz.why;
    answered = true;
  }
  async function setDone() {
    const id = lessons[current].id;
    state.done.add(id);
    updateProgress();
    persist();
    renderNav();
    $("mark-read").textContent = "✓ Understood";
    if (cloudUser && sb) {
      const { error } = await sb
        .from("student_readiness")
        .upsert(
          {
            user_id: cloudUser.id,
            milestone_id: "lesson-" + id,
            state: "done",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,milestone_id" },
        );
      if (error) {
        console.warn("Bdesh lesson sync:", error.message);
        throw error;
      }
    }
    window.bdeshTrack?.("bdesh_lesson_completed", { chapter_index: current + 1 });
  }
  function go(i) {
    current = Math.max(0, Math.min(lessons.length - 1, i));
    render();
    window.scrollTo({ top: 0, behavior: "instant" });
    $("main-content").focus({ preventScroll: true });
  }
  // The final lesson is the handoff to Step 2. Wait for cloud progress to save
  // before navigating, otherwise the browser may cancel the pending request.
  let transitioning = false;
  async function completeAndContinue() {
    if (transitioning) return;
    transitioning = true;
    const next = $("next-lesson"),
      mark = $("mark-read");
    next.disabled = true;
    mark.disabled = true;
    next.textContent = "Saving your progress…";
    try {
      await setDone();
      location.assign("/profile.html#overview");
    } catch (error) {
      console.error("Bdesh learning completion:", error);
      transitioning = false;
      next.disabled = false;
      mark.disabled = false;
      next.textContent = "Continue to Step 2 →";
      $("check-feedback").textContent =
        "Could not sync progress. Your reading progress is saved in this browser; you can still continue.";
      const fallback = document.createElement("a");
      fallback.href = "/profile.html#overview";
      fallback.textContent = "Open Step 2: My profile ↗";
      fallback.className = "primary-button";
      fallback.style.display = "inline-block";
      $("check-feedback").append(document.createElement("br"), fallback);
    }
  }
  $("mark-read").addEventListener("click", () => {
    if (current === lessons.length - 1) {
      completeAndContinue();
      return;
    }
    setDone().catch((error) => {
      console.warn("Bdesh lesson progress sync:", error);
      $("check-feedback").textContent =
        "This lesson was marked understood in this browser, but could not sync to your account. Check your connection and try again.";
    });
  });
  $("prev-lesson").addEventListener("click", () => go(current - 1));
  $("next-lesson").addEventListener("click", () => {
    if (current === lessons.length - 1) {
      completeAndContinue();
      return;
    }
    go(current + 1);
  });
  async function cloudSync() {
    if (!sb) return;
    const { data, error } = await sb.auth.getUser();
    if (error || !data?.user) return;
    const incoming = data.user;
    if (cloudUser?.id !== incoming.id) {
      cloudUser = incoming;
      const scoped = readState(incoming.id);
      state.done = scoped.done;
      state.current = scoped.current;
      current = lessons.findIndex((l) => l.id === scoped.current);
      render();
    }
    const { data: rows, error: fetchError } = await sb
      .from("student_readiness")
      .select("milestone_id,state")
      .eq("user_id", cloudUser.id)
      .like("milestone_id", "lesson-%");
    if (fetchError) return;
    let changed = false;
    for (const row of rows || []) {
      const id = row.milestone_id.slice(7);
      if (row.state === "done" && !state.done.has(id) && lessons.some((l) => l.id === id)) {
        state.done.add(id);
        changed = true;
      }
    }
    if (changed) {
      persist();
      render();
    }
    const missing = [...state.done].filter(
      (id) => !(rows || []).some((x) => x.milestone_id === "lesson-" + id && x.state === "done"),
    );
    if (missing.length)
      await sb.from("student_readiness").upsert(
        missing.map((id) => ({
          user_id: cloudUser.id,
          milestone_id: "lesson-" + id,
          state: "done",
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "user_id,milestone_id" },
      );
  }
  render();
  cloudSync().catch(() => {});
  // Signing out on another tab returns to anonymous reading data without
  // displaying the previous student's locally cached lesson completion.
  if (sb)
    sb.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        cloudUser = null;
        const anonymous = readState(null);
        state.done = anonymous.done;
        state.current = anonymous.current;
        current = lessons.findIndex((l) => l.id === state.current);
        render();
      } else if (event === "SIGNED_IN" && session?.user?.id !== cloudUser?.id) {
        setTimeout(() => cloudSync().catch(() => {}), 0);
      }
    });
})();
