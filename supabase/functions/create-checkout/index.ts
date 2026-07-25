const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

export default async function(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { priceCents, planName, successUrl, cancelUrl, eventoId, customerEmail } = await req.json()

    if (!priceCents || !successUrl || !cancelUrl || !eventoId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const sessionBody = new URLSearchParams()
    sessionBody.append("mode", "payment")
    sessionBody.append("payment_method_types[]", "card")
    sessionBody.append("line_items[0][price_data][currency]", "brl")
    sessionBody.append("line_items[0][price_data][product_data][name]", planName || "Evento RevelaI")
    sessionBody.append("line_items[0][price_data][unit_amount]", priceCents.toString())
    sessionBody.append("line_items[0][quantity]", "1")
    sessionBody.append("success_url", successUrl)
    sessionBody.append("cancel_url", cancelUrl)
    sessionBody.append("metadata[evento_id]", eventoId)
    if (customerEmail) {
      sessionBody.append("customer_email", customerEmail)
    }

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: sessionBody.toString(),
    })

    const session = await stripeResponse.json()

    if (session.error) {
      return new Response(
        JSON.stringify({ error: session.error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
}
