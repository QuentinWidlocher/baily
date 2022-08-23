import { Link } from '@remix-run/react'
import { LoaderArgs } from '@remix-run/server-runtime'
import { getUserId } from '~/services/session.server'
import { redirect } from '~/services/superjson'

export async function loader({ request }: LoaderArgs) {
  let uid = await getUserId(request)

  if (uid != null) {
    return redirect(`/babies`)
  } else {
    return null
  }
}

export default function IndexRoute() {
  return (
    <main className="hero min-h-screen">
      <div className="hero-overlay bg-gradient-to-t from-primary to-primary-focus"></div>
      <div className="hero-content text-center text-primary-content">
        <div className="max-w-md">
          <h1 className="mb-5 text-7xl font-bold">B++</h1>
          <p className="mb-5">
            Gardez un trace des biberons que vous donnez à votre/vos bébé(s) et
            voyez l'évolution hébdomadaire.
            <br />
            <br />
            Pour commencer, il suffit de créer un compte
          </p>
          <div className="space-x-2">
            <Link className="btn btn-primary" to="signin">
              Créer un compte
            </Link>
            <Link className="btn btn-primary" to="login">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
