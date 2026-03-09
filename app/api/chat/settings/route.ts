import { NextResponse } from "next/server"

import { getChatEnabled, setChatEnabled } from "@/lib/chat-settings"

export async function GET() {
  const enabled = await getChatEnabled()
  return NextResponse.json({ enabled })
}

export async function POST(request: Request) {
  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Neispravan JSON payload." },
      { status: 400 }
    )
  }

  const enabled =
    typeof payload === "object" &&
    payload !== null &&
    "enabled" in payload &&
    typeof (payload as { enabled: unknown }).enabled === "boolean"
      ? (payload as { enabled: boolean }).enabled
      : null

  if (enabled === null) {
    return NextResponse.json(
      { error: "Polje 'enabled' mora biti boolean." },
      { status: 400 }
    )
  }

  const settings = await setChatEnabled(enabled)
  return NextResponse.json({ enabled: settings.enabled })
}
