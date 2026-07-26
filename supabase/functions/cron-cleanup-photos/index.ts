const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const INSFORGE_BASE = Deno.env.get("INSFORGE_BASE_URL")
const API_KEY = Deno.env.get("API_KEY")

export default async function(_req: Request) {
  if (_req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const response = await fetch(`${INSFORGE_BASE}/api/database/rpc/cleanup_old_photos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ days_to_keep: 10 }),
    })

    const text = await response.text()
    let data
    try { data = JSON.parse(text) } catch { data = { raw: text } }

    if (!response.ok) {
      throw new Error(data.message || data.error || `RPC failed: ${response.status}`)
    }

    return new Response(
      JSON.stringify({ ok: true, result: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err: any) {
    console.error("cron-cleanup-photos error:", err.message)
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
}
