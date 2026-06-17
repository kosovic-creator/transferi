import twilio from "twilio"

export async function GET() {
    if (process.env.NODE_ENV === "production") {
        return new Response(JSON.stringify({ error: "Forbidden in production" }), { status: 403 })
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    if (!accountSid || !authToken) {
        return new Response(JSON.stringify({ error: "Twilio credentials not configured" }), { status: 500 })
    }

    try {
        const client = twilio(accountSid, authToken)
        const messages = await client.messages.list({ limit: 10 })

        const out = messages.map((m) => ({
            sid: m.sid,
            dateCreated: m.dateCreated,
            from: m.from,
            to: m.to,
            status: m.status,
            errorCode: m.errorCode,
            errorMessage: m.errorMessage,
            body: m.body,
        }))

        return new Response(JSON.stringify({ messages: out }, null, 2), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        })
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
    }
}
