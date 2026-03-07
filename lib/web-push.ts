import webpush from "web-push"

let configured = false

function getEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} nije postavljen.`)
  }

  return value
}

function ensureConfigured() {
  if (configured) {
    return
  }

  webpush.setVapidDetails(
    getEnv("VAPID_SUBJECT"),
    getEnv("VAPID_PUBLIC_KEY"),
    getEnv("VAPID_PRIVATE_KEY")
  )

  configured = true
}

export type StoredPushSubscription = {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export async function sendWebPush(
  subscription: StoredPushSubscription,
  payload: Record<string, unknown>
): Promise<void> {
  ensureConfigured()

  await webpush.sendNotification(subscription, JSON.stringify(payload))
}
