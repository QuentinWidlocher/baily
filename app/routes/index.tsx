import { redirect } from '~/services/superjson'

export async function loader() {
  const babyId =
    process.env.NODE_ENV == 'production'
      ? process.env.DEFAULT_BABY_ID
      : process.env.DEPLOY_PREVIEW_DEFAULT_BABY_ID
  return redirect(`/baby/${babyId}`)
}
