import { Link, useLoaderData } from '@remix-run/react'
import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'
import { FirebaseError } from 'firebase/app'
import { z } from 'zod'
import { authenticate } from '~/services/firebase.server'
import { createUserSession } from '~/services/session.server'
import { withZod } from '@remix-validated-form/with-zod'
import { ValidatedForm, validationError } from 'remix-validated-form'
import SubmitButton from '~/components/form/submit-button'
import PasswordInput from '~/components/form/password-input'
import Input from '~/components/form/input'
import BottomCardLayout from '~/components/layouts/bottom-card'

const schema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email({ message: "L'email est invalide" }),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

const validator = withZod(schema)

export const meta: MetaFunction = () => ({
  title: 'Baily - Connectez-vous',
})

export async function action({ request }: ActionArgs) {
  let result = await validator.validate(await request.formData())

  if (result.error) {
    return validationError(result.error)
  }

  let { email, password } = result.data

  try {
    let token = await authenticate(email, password)
    return createUserSession(token, '/babies')
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.log(e.code)
      if (e.code == 'auth/user-not-found') {
        return validationError({
          fieldErrors: {
            email: "Cet email n'existe pas sur Baily",
          },
          formId: result.formId,
        })
      } else if (e.code == 'auth/wrong-password') {
        return validationError({
          fieldErrors: {
            password: 'Le mot de passe est incorrect',
          },
          formId: result.formId,
        })
      } else {
        return validationError({
          fieldErrors: {
            password: 'Une erreur est survenue',
          },
          formId: result.formId,
        })
      }
    }
  }
}

export function loader({ request }: LoaderArgs) {
  let from = new URL(request.url).searchParams.get('from')
  return { fromForgotPassword: from == 'forgot-password' }
}

export default function LoginRoute() {
  let { fromForgotPassword } = useLoaderData<typeof loader>()
  return (
    <BottomCardLayout>
      <div className="flex justify-between mb-5 card-title">
        <h1 className="text-xl">Connexion</h1>
      </div>

      {fromForgotPassword ? (
        <p>
          Un email de réinitialisation de mot de passe a été envoyé à votre
          adresse email. <br />
          <br />
          Une fois que vous aurez réinitialisé votre mot de passe, vous pourrez
          vous connecter.
        </p>
      ) : null}

      <ValidatedForm validator={validator} method="post">
        <Input name="email" label="Email" />
        <PasswordInput name="password" label="Mot de passe" />
        <div className="w-full mt-5 form-control">
          <SubmitButton label="Se connecter" submittingLabel="Connexion" />
        </div>
        <div className="w-full mt-5 form-control">
          <Link to="/signin" className="btn btn-ghost">
            S'inscrire
          </Link>
        </div>
        {!fromForgotPassword ? (
          <div className="w-full mt-5 form-control">
            <Link to="/forgot-password" className="btn btn-ghost">
              Mot de passe oublié ?
            </Link>
          </div>
        ) : null}
      </ValidatedForm>
    </BottomCardLayout>
  )
}
