import { Outlet, useLoaderData } from '@remix-run/react'
import { LoaderArgs } from '@remix-run/server-runtime'
import { useState } from 'react'
import { getSelectorsByUserAgent } from 'react-device-detect'
import { useCustomPWAInstall } from '~/services/pwa'

export function loader({ request }: LoaderArgs) {
  const { isMobile } = getSelectorsByUserAgent(
    request.headers.get('User-Agent') || '',
  )

  return !!isMobile
}

export default function BabyLayout() {
  let isMobile = useLoaderData<typeof loader>()

  let { installed, deferredPrompt } = useCustomPWAInstall(isMobile)
  let [refusedInstallation, setRefusedInstallation] = useState(false)

  return (
    <main className="flex flex-col h-screen p-0 overflow-hidden desktop:py-5 desktop:items-center">
      <Outlet></Outlet>
      {isMobile && !installed && !refusedInstallation ? (
        <div className="modal modal-open modal-bottom sm:modal-middle">
          <div className="modal-box">
            <h3 className="text-lg font-bold">Bonjour !</h3>
            <p className="py-4">
              Vous devriez installer Baily sur votre téléphone pour une
              meilleure expérience. <br /> <br /> Sachez aussi que Baily est
              disponible sur votre ordinateur.
            </p>
            <div className="modal-action">
              <button
                className="btn btn-outline"
                onClick={() => setRefusedInstallation(true)}
              >
                Non merci
              </button>
              <button
                className={`btn btn-primary ${!deferredPrompt ? 'hidden' : ''}`}
                onClick={() => deferredPrompt?.prompt()}
              >
                Installer Baily
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
