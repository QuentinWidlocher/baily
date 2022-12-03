import { useState, useEffect } from "react"
import { useHydrated } from "remix-utils"

function isStandalone() {
  let iOSCheck = 'standalone' in window.navigator && window.navigator.standalone
  let androidCheck = window.matchMedia('(display-mode: standalone)').matches

  return iOSCheck || androidCheck
}

export function useCustomPWAInstall(isMobile: boolean) {
  let isHydrated = useHydrated()

  // Browsers are considered standalone, else we need to have the PWA installed
  let installed = !isMobile || (isHydrated && isStandalone())

  let [deferredPrompt, setDeferredPrompt] = useState<
    BeforeInstallPromptEvent | undefined
  >(undefined)

  function manualInstallPrompt(e: Event) {
    e.preventDefault()
    setDeferredPrompt(e as BeforeInstallPromptEvent)
  }

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', manualInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', manualInstallPrompt)
    }
  }, [])

  return {
    installed,
    deferredPrompt,
  }
}