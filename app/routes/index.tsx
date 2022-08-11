import { redirect } from '~/services/superjson'

export async function loader() {
  console.log(process.env)
  const babyId =
    process.env.NODE_ENV == 'production' && process.env.CONTEXT == 'production'
      ? process.env.DEFAULT_BABY_ID
      : process.env.DEPLOY_PREVIEW_DEFAULT_BABY_ID
  return redirect(`/baby/${babyId}`)
}
