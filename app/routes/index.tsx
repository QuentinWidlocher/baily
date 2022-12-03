import { Link, useLoaderData } from '@remix-run/react'
import { getSelectorsByUserAgent } from 'react-device-detect'
import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import { redirect } from '@remix-run/server-runtime'
import { getUserId } from '~/services/session.server'
import { useHydrated } from 'remix-utils'
import { useEffect, useState } from 'react'

export const meta: MetaFunction = () => ({
  title: 'Baily - Notez tout ce qui concerne votre bébé',
})

export async function loader({ request }: LoaderArgs) {
  let uid = await getUserId(request)

  if (uid != null) {
    throw redirect(`/babies`)
  } else {
    const { isMobile } = getSelectorsByUserAgent(
      request.headers.get('User-Agent') || '',
    )
    return !!isMobile
  }
}

function isStandalone() {
  let iOSCheck = 'standalone' in window.navigator && window.navigator.standalone
  let androidCheck = window.matchMedia('(display-mode: standalone)').matches

  return iOSCheck || androidCheck
}

export default function IndexRoute() {
  let isMobile = useLoaderData<typeof loader>()
  let isHydrated = useHydrated()

  // Browsers are considered standalone, else we need to have the PWA installed
  let standalone = !isMobile || (isHydrated && isStandalone())

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

  return (
    <main className="min-h-screen hero">
      <div className="hero-overlay bg-gradient-to-t from-primary to-primary-focus"></div>
      <div className="text-center hero-content text-primary-content">
        <div className="max-w-md">
          <h1 className="mb-5 font-bold text-7xl">Baily</h1>
          <p className="mb-5">
            Gardez une trace des biberons, des couches et des dodos de votre/vos
            bébé(s) et voyez l'évolution hébdomadaire.
            <br />
            <br />
            {standalone
              ? 'Pour commencer, il suffit de créer un compte'
              : "Pour commencer, il suffit d'installer Baily"}
          </p>
          <div className="space-x-2">
            {standalone ? (
              <>
                <Link className="btn btn-primary" to="signin">
                  Créer un compte
                </Link>
                <Link className="btn btn-primary" to="login">
                  Se connecter
                </Link>
              </>
            ) : (
              <>
                <button
                  className={`btn btn-primary ${
                    !deferredPrompt ? 'hidden' : ''
                  }`}
                  onClick={() => deferredPrompt?.prompt()}
                >
                  Installer Baily
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
