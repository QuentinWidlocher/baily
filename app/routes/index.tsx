import { redirect } from '~/services/superjson'

export async function loader() {
  console.log(process.env)
  return redirect(`/baby/${process.env.DEFAULT_BABY}`)
}
