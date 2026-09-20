// お問い合わせフォーム送信を受け取り、Resend で運営者宛にメールを転送する
// 公開エンドポイント（publishable key で呼び出し）— RESEND_API_KEY はここでのみ参照する
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const CONTACT_RECEIVE_EMAIL = Deno.env.get("CONTACT_RECEIVE_EMAIL");
const FROM_ADDRESS = "お問い合わせフォーム <onboarding@resend.dev>";

const MAX_LEN = { name: 100, email: 254, message: 4000 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default {
  fetch: withSupabase({ auth: ["publishable"] }, async (req, ctx) => {
    const origin = req.headers.get("origin");

    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders(origin) });
    }

    if (!RESEND_API_KEY || !CONTACT_RECEIVE_EMAIL) {
      return Response.json(
        { error: "server_misconfigured" },
        { status: 500, headers: corsHeaders(origin) },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "invalid_json" }, { status: 400, headers: corsHeaders(origin) });
    }

    const { name, email, message, website } = (body ?? {}) as Record<string, unknown>;

    // ハニーポット: 通常フォームには存在しない隠しフィールド。値が入っていればボット
    if (typeof website === "string" && website.trim() !== "") {
      return Response.json({ ok: true }, { headers: corsHeaders(origin) });
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string" ||
      name.trim().length === 0 ||
      message.trim().length === 0 ||
      name.length > MAX_LEN.name ||
      email.length > MAX_LEN.email ||
      message.length > MAX_LEN.message ||
      !EMAIL_RE.test(email)
    ) {
      return Response.json({ error: "invalid_input" }, { status: 400, headers: corsHeaders(origin) });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [CONTACT_RECEIVE_EMAIL],
        reply_to: email,
        subject: `【お問い合わせ】${name}様より`,
        html: `<p><strong>お名前:</strong> ${escapeHtml(name)}</p><p><strong>メール:</strong> ${escapeHtml(email)}</p><p><strong>内容:</strong></p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("resend_error", res.status, detail);
      return Response.json({ error: "send_failed" }, { status: 502, headers: corsHeaders(origin) });
    }

    return Response.json({ ok: true }, { headers: corsHeaders(origin) });
  }),
};

/* ローカル検証:

  1. `supabase start`
  2. curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/contact' \
       --header 'apiKey: <publishable key>' \
       --header 'Content-Type: application/json' \
       --data '{"name":"テスト","email":"test@example.com","message":"内容"}'

*/
