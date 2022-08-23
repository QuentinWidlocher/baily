import { LoaderArgs } from '@remix-run/server-runtime'
import { logout } from '~/services/session.server'

export async function loader({ request }: LoaderArgs) {
  return logout(request)
}
