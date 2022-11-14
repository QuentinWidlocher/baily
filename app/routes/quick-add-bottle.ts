import type { LoaderArgs } from '@remix-run/server-runtime';
import { redirect } from '@remix-run/server-runtime'
import { getBabies } from '~/services/babies.server'
import { requireUserId } from '~/services/session.server'

export async function loader({ request }: LoaderArgs) {
  let uid = await requireUserId(request)

  let babies = await getBabies(uid)
  return redirect(`/baby/${babies[0]}/bottle/new`)
}
