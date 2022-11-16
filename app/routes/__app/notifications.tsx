import { useLoaderData } from '@remix-run/react'
import { format } from 'date-fns'
import { NavArrowLeft } from 'iconoir-react'
import LoadingItem from '~/components/loading-item'
import { getNotifications } from '~/services/notifications.server'
import { fr } from 'date-fns/locale'
import parse from 'html-react-parser'
import type { LoaderArgs } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import { getUserSession, storage } from '~/services/session.server'
import FullPageCardLayout from '~/components/layouts/fullpage-card'

export async function loader({ request }: LoaderArgs) {
  let [notifications, session] = await Promise.all([
    getNotifications(),
    getUserSession(request),
  ])

  session.set('lastNotificationId', notifications[0]?.id)

  return json(notifications, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

export default function NotificationsRoute() {
  let notifications = useLoaderData<typeof loader>()

  return (
    <FullPageCardLayout>
      <div className="flex justify-between mb-5 card-title">
        <h1 className="text-xl">Notifications</h1>
        <LoadingItem
          type="link"
          to=".."
          className="space-x-2 btn btn-ghost"
          title="Retour"
          icon={<NavArrowLeft />}
          label="Retour"
        />
      </div>
      <ul className="flex-1 space-y-10 overflow-y-auto">
        {notifications.map((notification) => (
          <li key={notification.id}>
            <div className="leading-tight">
              <h2 className="text-lg font-bold">{notification.title}</h2>
              <small className="opacity-50">
                {format(new Date(notification.date), 'dd/MM/yyyy', {
                  locale: fr,
                })}
              </small>
            </div>
            <p className="my-2">{parse(notification.description)}</p>
          </li>
        ))}
      </ul>
    </FullPageCardLayout>
  )
}
