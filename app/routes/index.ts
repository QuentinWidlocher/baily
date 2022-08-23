import { LoaderArgs } from '@remix-run/server-runtime'
import { requireUserId } from '~/services/session.server'
import { redirect } from '~/services/superjson'

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request)
  return redirect(`/babies`)
}
