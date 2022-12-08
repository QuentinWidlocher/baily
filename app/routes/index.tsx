import { Link, useLoaderData } from '@remix-run/react'
import { getSelectorsByUserAgent } from 'react-device-detect'
import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import { redirect } from '@remix-run/server-runtime'
import { getUserId } from '~/services/session.server'
import { useCustomPWAInstall } from '~/services/pwa'

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

export default function IndexRoute() {
  let isMobile = useLoaderData<typeof loader>()

  let { deferredPrompt, installed } = useCustomPWAInstall(isMobile)

  return (
    <main className="min-h-screen hero">
      <div className="hero-overlay bg-gradient-to-t from-primary to-primary-focus"></div>
      <div className="text-center text-white hero-content">
        <div className="max-w-md">
          <picture>
            <source srcSet="/logo/baily-logo-white.svg" type="image/svg+xml" />
            <source srcSet="/logo/baily-logo-white@1x.webp" type="image/webp" />
            <img
              className="w-64 h-64 mx-auto mb-5"
              src="/logo/baily-logo-white@1x.png"
              alt="Logo de Baily, un homme et une femme tenant un bébé dans leurs bras"
            />
          </picture>
          <h1 className="mb-5 font-bold text-7xl">Baily</h1>
          <p className="mb-5">
            Gardez une trace des biberons, des couches et des dodos de votre/vos
            bébé(s) et voyez l'évolution hébdomadaire.
            <br />
            <br />
            {installed
              ? 'Pour commencer, il suffit de créer un compte'
              : "Pour commencer, il suffit d'installer Baily"}
          </p>
          <div className="space-x-2">
            {installed ? (
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
