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

const DISMISS_KEY = "pwa-install-dismissed-v2"

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

export function InstallBanner() {
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
    const unsub = subscribeDeferredPrompt((e) => {
      const prompt = e as BeforeInstallPromptEvent | null
      setLocalPrompt(prompt)
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

  const show = !installed && !dismissed && (ios || Boolean(deferredPrompt))

  async function handleInstall() {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    setDeferredPrompt(null)
    setLocalPrompt(null)
    setInstalled(outcome === "accepted")

    if (outcome === "accepted") {
      localStorage.setItem(DISMISS_KEY, "1")
      setDismissed(true)
    }
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "1")
    setDismissed(true)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-[rgb(62_45_30/0.25)] bg-[rgb(255_248_238/0.95)] px-4 py-3 shadow-xl backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[rgb(62_45_30)]">Transferi aplikacija</p>
          {ios ? (
            <p className="mt-0.5 text-xs text-[rgb(99_78_51)]">
              Safari - Share - Add to Home Screen
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-[rgb(99_78_51)]">
              Instaliraj aplikaciju na uredaj
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!ios && (
            <button
              type="button"
              onClick={handleInstall}
              className="rounded-md bg-[rgb(62_45_30)] px-3 py-1.5 text-xs font-semibold text-[rgb(255_248_238)] transition hover:bg-[rgb(83_63_42)]"
            >
              Instaliraj
            </button>
          )}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Zatvori"
            className="rounded p-1 text-[rgb(99_78_51)] transition hover:bg-[rgb(62_45_30/0.1)]"
          >
            x
          </button>
        </div>
      </div>
    </div>
  )
}
