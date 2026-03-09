import { prisma } from "@/lib/prisma"

const CHAT_SETTINGS_SINGLETON_ID = 1

export async function getOrCreateChatSettings() {
  const existing = await prisma.chatSettings.findUnique({
    where: { id: CHAT_SETTINGS_SINGLETON_ID },
  })

  if (existing) {
    return existing
  }

  return prisma.chatSettings.create({
    data: {
      id: CHAT_SETTINGS_SINGLETON_ID,
      enabled: true,
    },
  })
}

export async function getChatEnabled(): Promise<boolean> {
  const settings = await getOrCreateChatSettings()
  return settings.enabled
}

export async function setChatEnabled(enabled: boolean) {
  return prisma.chatSettings.upsert({
    where: { id: CHAT_SETTINGS_SINGLETON_ID },
    update: { enabled },
    create: { id: CHAT_SETTINGS_SINGLETON_ID, enabled },
  })
}
