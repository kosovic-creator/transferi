import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

type UnsubscribeRequest = {
  endpoint?: string
}

export async function POST(request: Request) {
  const body = (await request.json()) as UnsubscribeRequest
  const endpoint = body.endpoint

  if (!endpoint) {
    return NextResponse.json({ error: "Polje endpoint je obavezno." }, { status: 400 })
  }

  await prisma.pushSubscription.deleteMany({
    where: { endpoint },
  })

  return NextResponse.json({ ok: true })
}
