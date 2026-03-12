"use client"

import { useEffect, useMemo, useState } from "react"
import {
  getDeferredPrompt,
  setDeferredPrompt,
  subscribeDeferredPrompt,
} from "@/components/register-pwa"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

const DISMISS_KEY = "pwa-install-dismissed-v3"

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandaloneDisplayMode(): boolean {
  if (typeof window === "undefined") return false
  const iosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  return window.matchMedia("(display-mode: standalone)").matches || iosStandalone
}

export function usePwaInstall() {
  const ios = useMemo(() => isIosDevice(), [])
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(DISMISS_KEY) === "1"
  })
  const [installed, setInstalled] = useState(() => isStandaloneDisplayMode())
  const [deferredPrompt, setLocalPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => getDeferredPrompt() as BeforeInstallPromptEvent | null
  )

  useEffect(() => {
    const unsub = subscribeDeferredPrompt((event) => {
      setLocalPrompt(event as BeforeInstallPromptEvent | null)
    })

    function handleAppInstalled() {
      setInstalled(true)
      setDeferredPrompt(null)
      setLocalPrompt(null)
    }

    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      unsub()
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  async function promptInstall() {
    if (!deferredPrompt) return "unavailable" as const

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    setDeferredPrompt(null)
    setLocalPrompt(null)

    if (outcome === "accepted") {
      localStorage.setItem(DISMISS_KEY, "1")
      setDismissed(true)
      setInstalled(true)
    }

    return outcome
  }

  function dismissInstall() {
    localStorage.setItem(DISMISS_KEY, "1")
    setDismissed(true)
  }

  return {
    canInstall: !installed && Boolean(deferredPrompt),
    dismissed,
    installed,
    ios,
    promptInstall,
    shouldShowBanner: !installed && !dismissed && (ios || Boolean(deferredPrompt)),
    dismissInstall,
  }
}