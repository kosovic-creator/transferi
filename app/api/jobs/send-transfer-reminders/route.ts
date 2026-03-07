import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { sendWebPush } from "@/lib/web-push"

export const dynamic = "force-dynamic"

function relacijaToLabel(relacija: "APARTMAN_AERODROM" | "AERODROM_APARTMAN"): string {
  if (relacija === "APARTMAN_AERODROM") {
    return "apartman-aerodrom"
  }

  return "aerodrom-apartman"
}

function isPushSubscriptionExpired(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  const withStatus = error as Error & { statusCode?: number }
  return withStatus.statusCode === 404 || withStatus.statusCode === 410
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET nije postavljen." }, { status: 500 })
  }

  const authorization = request.headers.get("authorization")

  if (authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Nedozvoljen pristup." }, { status: 401 })
  }

  const now = new Date()
  const dueTransfers = await prisma.transfer.findMany({
    where: {
      alarmEnabled: true,
      alarmSentAt: null,
      datumVrijemeUtc: {
        lte: now,
      },
    },
    orderBy: [{ datumVrijemeUtc: "asc" }, { id: "asc" }],
    take: 100,
  })

  let sentNotifications = 0
  let processedTransfers = 0

  for (const transfer of dueTransfers) {
    const userKey = transfer.korisnik?.trim()
    const subscriptions = await prisma.pushSubscription.findMany({
      where: userKey ? { userKey } : undefined,
    })

    const payload = {
      title: "Vrijeme je za transfer",
      body: `${relacijaToLabel(transfer.relacija)} u ${transfer.vrijeme
        .toISOString()
        .slice(11, 16)}`,
      url: `/transferi/${transfer.id}`,
      transferId: transfer.id,
    }

    for (const subscription of subscriptions) {
      try {
        await sendWebPush(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dhKey,
              auth: subscription.authKey,
            },
          },
          payload
        )
        sentNotifications += 1
      } catch (error) {
        if (isPushSubscriptionExpired(error)) {
          await prisma.pushSubscription.delete({ where: { endpoint: subscription.endpoint } })
        }
      }
    }

    await prisma.transfer.update({
      where: { id: transfer.id },
      data: { alarmSentAt: new Date() },
    })

    processedTransfers += 1
  }

  return NextResponse.json({
    ok: true,
    processedTransfers,
    sentNotifications,
  })
}
