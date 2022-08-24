import { LoaderArgs } from '@remix-run/server-runtime'
import { getBabies } from '~/services/firebase.server'
import { requireUserId } from '~/services/session.server'
import { redirect } from '~/services/superjson'

export async function loader({ request }: LoaderArgs) {
  let uid = await requireUserId(request)

  let babies = await getBabies(uid)
  return redirect(`/baby/${babies[0]}/bottle/new`)
}
