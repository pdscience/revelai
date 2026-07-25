const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

export default async function(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { email, eventName, shareUrl, accessUrl } = await req.json()

    if (!email || !eventName) {
      return new Response(
        JSON.stringify({ error: "Missing email or eventName" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const resendKey = Deno.env.get("RESEND_API_KEY")
    if (!resendKey) {
      return new Response(
        JSON.stringify({ error: "Email service not configured (RESEND_API_KEY)" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const link = shareUrl || accessUrl || ""
    const fromEmail = Deno.env.get("EMAIL_FROM") || "RevelaI <noreply@revelai.com>"

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#0D0D0D;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <div style="max-width:480px;margin:0 auto;padding:40px 24px;">
          <div style="text-align:center;margin-bottom:32px;">
            <h1 style="font-size:28px;color:#E9A24B;margin:0 0 8px;font-family:Georgia,serif;">RevelaI</h1>
            <p style="font-size:12px;color:rgba(248,244,235,0.4);letter-spacing:2px;text-transform:uppercase;margin:0;">Câmera Digital Descartável</p>
          </div>
          
          <div style="background:linear-gradient(135deg,#1A1A1A,#141414);border:1px solid rgba(248,244,235,0.08);border-radius:20px;padding:32px 24px;margin-bottom:24px;">
            <h2 style="font-size:20px;color:#F8F4EB;margin:0 0 12px;font-family:Georgia,serif;">Seu evento está pronto!</h2>
            <p style="font-size:14px;color:rgba(248,244,235,0.6);margin:0 0 24px;line-height:1.6;">
              O evento <strong style="color:#E9A24B;">${eventName}</strong> foi criado com sucesso. 
              Compartilhe o link abaixo com seus convidados para que possam começar a fotografar.
            </p>
            
            ${link ? `
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(248,244,235,0.1);border-radius:12px;padding:16px;margin-bottom:24px;word-break:break-all;">
              <p style="font-size:11px;color:rgba(248,244,235,0.4);margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Link de acesso</p>
              <a href="${link}" style="font-size:14px;color:#E9A24B;text-decoration:none;">${link}</a>
            </div>
            <div style="text-align:center;">
              <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#E9A24B,#FF7A2E);color:#0D0D0D;font-weight:600;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
                Acessar Evento →
              </a>
            </div>
            ` : ''}
          </div>
          
          <div style="text-align:center;">
            <p style="font-size:12px;color:rgba(248,244,235,0.3);margin:0;">
              Este e-mail foi enviado porque você criou um evento no RevelaI.
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: `RevelaI — Link do evento "${eventName}"`,
        html,
      }),
    })

    const result = await resendResponse.json()

    if (result.error) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ ok: true, id: result.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
}
