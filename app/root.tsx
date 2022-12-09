import type { LinksFunction, MetaFunction } from '@remix-run/node'
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import styleSheetUrl from './style.css'
import fontStyleSheetUrl from './fonts.css'

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Baily',
  viewport: 'width=device-width,initial-scale=1',
  description: 'Notez tout ce qui concerne votre bébé',
})

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: styleSheetUrl },
    { rel: 'stylesheet', href: fontStyleSheetUrl },
    { rel: 'manifest', href: '/manifest.json' },
  ]
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png?v=2"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png?v=2"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png?v=2"
        />
        <link
          rel="mask-icon"
          href="/safari-pinned-tab.svg?v=2"
          color="#96357a"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-title" content="Baily" />
        <meta name="application-name" content="Baily" />
        <meta name="msapplication-TileColor" content="#96357a" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV != 'development' ? (
          <>
            <script async src="/sw-launcher.js" />
          </>
        ) : (
          <>
            <LiveReload />
          </>
        )}
      </body>
    </html>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  if (process.env.NODE_ENV != 'production') {
    console.error(error)
  }

  return (
    <html>
      <head>
        <Links />
      </head>
      <body>
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="text-xl text-center">
            <p>Une erreur est survenue</p>
            <p>
              <Link className="link" to="/">
                Retour à l'accueil
              </Link>
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
