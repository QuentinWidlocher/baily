import { redirect } from '~/services/superjson'

export async function loader() {
  return redirect(`/baby/${process.env.DEFAULT_BABY_ID}`)
}
