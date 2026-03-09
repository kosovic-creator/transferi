import "dotenv/config"

import { prisma } from "../lib/prisma"

const ADMIN_PUSH_USER_KEY = "admin"

function hasArg(flag: string): boolean {
  return process.argv.includes(flag)
}

async function main() {
  const apply = hasArg("--apply")
  const allowNoAdmin = hasArg("--allow-no-admin")

  const allSubscriptions = await prisma.pushSubscription.findMany({
    select: { id: true, endpoint: true, userKey: true },
  })

  const adminSubscriptions = allSubscriptions.filter(
    (item) => item.userKey.trim().toLowerCase() === ADMIN_PUSH_USER_KEY
  )

  const removableSubscriptions = allSubscriptions.filter(
    (item) => item.userKey.trim().toLowerCase() !== ADMIN_PUSH_USER_KEY
  )

  console.log(`Total subscriptions: ${allSubscriptions.length}`)
  console.log(`Admin subscriptions kept: ${adminSubscriptions.length}`)
  console.log(`Non-admin subscriptions removable: ${removableSubscriptions.length}`)

  if (!apply) {
    console.log("Dry run mode: no records were deleted.")
    console.log("Run with --apply to delete non-admin subscriptions.")
    return
  }

  if (adminSubscriptions.length === 0 && !allowNoAdmin) {
    console.error("Abort: no admin subscription found.")
    console.error("Enable push on your admin phone first, or run with --allow-no-admin.")
    process.exitCode = 1
    return
  }

  if (removableSubscriptions.length === 0) {
    console.log("Nothing to delete.")
    return
  }

  const removableIds = removableSubscriptions.map((item) => item.id)

  const result = await prisma.pushSubscription.deleteMany({
    where: {
      id: {
        in: removableIds,
      },
    },
  })

  console.log(`Deleted non-admin subscriptions: ${result.count}`)
}

main()
  .catch((error) => {
    console.error("Cleanup failed:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
