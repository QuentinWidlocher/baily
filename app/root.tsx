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
import { withSentry } from '@sentry/remix'
import styleSheetUrl from './style.css'

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'B++',
  viewport: 'width=device-width,initial-scale=1',
})

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: styleSheetUrl },
    { rel: 'manifest', href: '/manifest.json' },
  ]
}

function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#9333ea" />
        <meta name="apple-mobile-web-app-title" content="B++" />
        <meta name="application-name" content="B++" />
        <meta name="msapplication-TileColor" content="#9333ea" />
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
          <LiveReload />
        )}
      </body>
    </html>
  )
}

export default withSentry(App)

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
          <div className="text-center text-xl">
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
