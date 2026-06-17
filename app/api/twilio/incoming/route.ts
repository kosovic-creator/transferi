import twilio from "twilio"

export async function POST(request: Request) {
    const text = await request.text()
    const params = new URLSearchParams(text)

    const from = params.get("From") ?? ""
    const to = params.get("To") ?? ""
    const body = params.get("Body") ?? ""
    const numMedia = params.get("NumMedia") ?? "0"

    console.log("[twilio/incoming] received", { from, to, body, numMedia })

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const twilioFrom = process.env.TWILIO_FROM_NUMBER
    const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? process.env.SUPPORT_PHONE

    // Validate Twilio signature
    const signature = request.headers.get("x-twilio-signature") ?? ""
    if (!authToken) {
        console.warn("[twilio/incoming] TWILIO_AUTH_TOKEN nije postavljen; preskačem validaciju")
    } else {
        const url = request.url
        const paramsObj: Record<string, string> = {}
        for (const [k, v] of params.entries()) {
            paramsObj[k] = v
        }

        try {
            const isValid = (twilio as any).validateRequest
                ? (twilio as any).validateRequest(authToken, signature, url, paramsObj)
                : false

            if (!isValid) {
                console.warn("[twilio/incoming] invalid Twilio signature; rejecting request")
                return new Response("Invalid Twilio signature", { status: 403 })
            }
        } catch (err) {
            console.error("[twilio/incoming] signature validation failed", err)
            return new Response("Signature validation error", { status: 500 })
        }
    }

    if (accountSid && authToken && twilioFrom && supportPhone) {
        try {
            const client = twilio(accountSid, authToken)
            // Keep forwarded body short to avoid segment issues
            const forwardBody = `SMS od ${from}: ${body}`.slice(0, 300)
            await client.messages.create({ to: supportPhone, from: twilioFrom, body: forwardBody })
            console.log("[twilio/incoming] forwarded to", supportPhone)
        } catch (err) {
            console.error("[twilio/incoming] forward failed", err)
        }
    } else {
        console.log('[twilio/incoming] Twilio or support phone not configured — skipping forward')
    }

    // Respond with empty TwiML so Twilio doesn't return its default message
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`
    return new Response(twiml, { status: 200, headers: { "Content-Type": "text/xml" } })
}

export async function GET() {
    return new Response("Twilio incoming endpoint", { status: 200 })
}
