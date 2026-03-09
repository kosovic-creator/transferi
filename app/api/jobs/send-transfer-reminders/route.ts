import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function isAuthorized(request: Request, cronSecret: string): boolean {
    const authorization = request.headers.get("authorization")
    if (authorization === `Bearer ${cronSecret}`) {
        return true
    }

    const url = new URL(request.url)
    const querySecret = url.searchParams.get("secret")
    return querySecret === cronSecret
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET nije postavljen." }, { status: 500 })
  }

    if (!isAuthorized(request, cronSecret)) {
    return NextResponse.json({ error: "Nedozvoljen pristup." }, { status: 401 })
  }

  return NextResponse.json({
    ok: true,
    pushEnabled: false,
    message: "Push podsjetnici su iskljuceni.",
  })
}

export async function POST(request: Request) {
  return GET(request)
}
