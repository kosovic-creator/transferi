"use client";

import { useEffect, useRef, useState } from "react";

export function OfflineNotice() {
  const [isOffline, setIsOffline] = useState(false);
  const [showOnline, setShowOnline] = useState(false);
  const onlineTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setShowOnline(false);
      if (onlineTimerRef.current) {
        window.clearTimeout(onlineTimerRef.current);
        onlineTimerRef.current = null;
      }
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowOnline(true);

      if (onlineTimerRef.current) {
        window.clearTimeout(onlineTimerRef.current);
      }

      onlineTimerRef.current = window.setTimeout(() => {
        setShowOnline(false);
      }, 3000);
    };

    if (!navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (onlineTimerRef.current) {
        window.clearTimeout(onlineTimerRef.current);
      }
    };
  }, []);

  if (!isOffline && !showOnline) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[10000] px-3 py-2 text-center text-sm font-medium text-white shadow-md ${
        isOffline ? "bg-red-600" : "bg-emerald-600"
      }`}
    >
      {isOffline
        ? "Nema internet konekcije. Prikazuje se offline sadrzaj gde je dostupan."
        : "Ponovo ste online."}
    </div>
  );
}
