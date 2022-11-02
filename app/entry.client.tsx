import { RemixBrowser, useLocation, useMatches } from '@remix-run/react'
import { hydrate } from 'react-dom'
import * as Sentry from '@sentry/remix'
import { useEffect } from 'react'

// Sentry.init({
//   dsn: process.env.SENTRY_DSN,
//   tracesSampleRate: 1,
//   integrations: [
//     new Sentry.BrowserTracing({
//       routingInstrumentation: Sentry.remixRouterInstrumentation(
//         useEffect,
//         useLocation,
//         useMatches
//       ),
//     }),
//   ],
// })

hydrate(<RemixBrowser />, document)
