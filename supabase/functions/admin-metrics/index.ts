/**
 * Bdesh aggregate admin metrics. NEVER expose the Supabase service key in the site.
 * Owner entitlement is checked server-side against Supabase Auth app_metadata.
 * No personally identifiable student records leave this endpoint.
 */
import { createClient } from "npm:@supabase/supabase-js@2.75.0";

const projectUrl = Deno.env.get("SUPABASE_URL") ?? "";
const secrets = Deno.env.get("SUPABASE_SECRET_KEYS");
const secretKey = secrets ? JSON.parse(secrets).default : Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const allowedOrigin = "https://bdesh.pages.dev";

function response(req: Request, payload: unknown, status = 200) {
  const origin = req.headers.get("origin");
  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Vary": "Origin",
  };
  if (origin === allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
    headers["Access-Control-Allow-Headers"] = "authorization,apikey,content-type,x-client-info";
    headers["Access-Control-Allow-Methods"] = "GET,OPTIONS";
  }
  return new Response(JSON.stringify(payload), { status, headers });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return response(req, { ok: true });
  if (req.method !== "GET") return response(req, { error: "Method not allowed" }, 405);
  if (!projectUrl || !secretKey) return response(req, { error: "Service not configured" }, 503);
  const token = /^Bearer (.+)$/i.exec(req.headers.get("authorization") ?? "")?.[1];
  if (!token) return response(req, { error: "Sign in required" }, 401);

  try {
    // getUser(token) requests the current Auth user from Supabase, avoiding trust
    // in user-controlled metadata or an unverified browser-supplied role.
    const admin = createClient(projectUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: verified, error: userError } = await admin.auth.getUser(token);
    if (userError || !verified.user) return response(req, { error: "Invalid session" }, 401);
    if (verified.user.app_metadata?.bdesh_analytics_admin !== true) {
      return response(req, { error: "Administrator access required" }, 403);
    }

    // Paginated auth listing is processed in memory ONLY to return totals.
    // Neither email addresses nor individual user details are returned.
    let page = 1, total = 0, confirmed = 0, recent = 0, last30 = 0, truncated = false;
    const signupDays: Record<string, number> = {};
    const now = Date.now();
    const weekAgo = now - 7 * 86400000;
    const monthAgo = now - 30 * 86400000;
    for (; page <= 40; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 500 });
      if (error) throw error;
      const users = data?.users ?? [];
      for (const u of users) {
        total++;
        if (u.email_confirmed_at || u.confirmed_at) confirmed++;
        if (u.last_sign_in_at && Date.parse(u.last_sign_in_at) >= weekAgo) recent++;
        const created = Date.parse(u.created_at);
        if (created >= monthAgo) last30++;
        const day = new Date(created).toISOString().slice(0,10);
        if (created >= now - 13 * 86400000) signupDays[day] = (signupDays[day] || 0) + 1;
      }
      if (users.length < 500) break;
    }
    if (page > 40) truncated = true;

    const count = async (table: string, filters?: [string, unknown]) => {
      let query = admin.from(table).select("*", { count: "exact", head: true });
      if (filters) query = query.eq(filters[0], filters[1]);
      const { count, error } = await query;
      if (error) throw error;
      return count ?? 0;
    };
    const [applications, profiles, portfolios, completedTasks, publishedColleges, unverifiedColleges] =
      await Promise.all([
        count("student_applications"),
        count("student_admissions_profiles"),
        count("student_profile_portfolios"),
        count("student_progress", ["is_complete", true]),
        count("opportunities", ["published", true]),
        count("opportunities", ["verified_at", null]),
      ]);
    // Split published directory into fully verified vs partially/unreviewed.
    const { count: fullyVerified, error: verifiedError } = await admin
      .from("opportunities").select("*", { count: "exact", head: true })
      .eq("published", true).not("verified_at", "is", null);
    if (verifiedError) throw verifiedError;
    const signupSeries = [];
    for (let i = 13; i >= 0; i--) {
      const day = new Date(now - i * 86400000).toISOString().slice(0,10);
      signupSeries.push({ day, signups: signupDays[day] || 0 });
    }
    return response(req, {
      generated_at: new Date().toISOString(),
      totals: {
        accounts: total,
        confirmed_email_accounts: confirmed,
        signed_in_7d: recent,
        new_accounts_30d: last30,
        tracked_applications: applications,
        admissions_profiles: profiles,
        profile_portfolios: portfolios,
        completed_learning_tasks: completedTasks,
        published_opportunities: publishedColleges,
        verified_opportunities: fullyVerified ?? 0,
        unverified_opportunities: unverifiedColleges,
      },
      signup_series: signupSeries,
      incomplete_auth_count: truncated,
    });
  } catch (error) {
    // Avoid returning service details or sensitive information to the browser.
    console.error("admin-metrics failed", error instanceof Error ? error.message : "unknown error");
    return response(req, { error: "Unable to load statistics" }, 500);
  }
});
