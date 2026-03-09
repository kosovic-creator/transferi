"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"

const ADMIN_ROUTES = ["/transferi", "/transferi/*"]

function matchesRoute(pathname: string, matcher: string): boolean {
  if (pathname === matcher) return true

  if (matcher.endsWith("/*")) {
    const base = matcher.slice(0, -1)
    return pathname.startsWith(base)
  }

  if (matcher.endsWith("*")) {
    const base = matcher.slice(0, -1)
    return pathname.startsWith(base)
  }

  return false
}

export function ChatAdminToggle() {
  const pathname = usePathname()
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)

  const shouldRender = useMemo(() => {
    return ADMIN_ROUTES.some((route) => matchesRoute(pathname, route))
  }, [pathname])

  useEffect(() => {
    if (!shouldRender) return

    let cancelled = false

    async function load() {
      try {
        const response = await fetch("/api/chat/settings", {
          method: "GET",
          cache: "no-store",
        })

        if (!response.ok) return

        const data = (await response.json()) as { enabled?: boolean }

        if (!cancelled && typeof data.enabled === "boolean") {
          setEnabled(data.enabled)
        }
      } catch {
        // Ignore temporary network issues in admin indicator.
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [shouldRender])

  async function toggleChat() {
    if (enabled === null) return

    const nextEnabled = !enabled
    setSaving(true)

    try {
      const response = await fetch("/api/chat/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: nextEnabled }),
      })

      if (!response.ok) return

      const data = (await response.json()) as { enabled?: boolean }
      if (typeof data.enabled === "boolean") {
        setEnabled(data.enabled)
        window.dispatchEvent(
          new CustomEvent("chat-settings-changed", {
            detail: { enabled: data.enabled },
          })
        )
      }
    } finally {
      setSaving(false)
    }
  }

  if (!shouldRender) return null

  return (
    <button
      type="button"
      onClick={toggleChat}
      disabled={enabled === null || saving}
      className="rounded-md border px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
      title="Uključi ili isključi chat podršku"
    >
      {enabled ? "Chat: ukljucen" : "Chat: iskljucen"}
    </button>
  )
}
