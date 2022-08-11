import type { LinksFunction, MetaFunction } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import styleSheetUrl from './style.css'

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title:
    process.env.NODE_ENV == 'production' && process.env.CONTEXT == 'production'
      ? 'B++'
      : 'B++ - DEPLOY PREVIEW',
  viewport: 'width=device-width,initial-scale=1',
})

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: styleSheetUrl },
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
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="apple-mobile-web-app-title" content="B++" />
        <meta name="application-name" content="B++" />
        <meta name="msapplication-TileColor" content="#603cba" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV != 'development' ? (
          <>
            <script src="/sw-launcher.js" />
          </>
        ) : (
          <LiveReload />
        )}
      </body>
    </html>
  )
}
