import { Link } from '@remix-run/react'
import type { ActionArgs, MetaFunction } from '@remix-run/server-runtime'
import { redirect } from '@remix-run/server-runtime'
import { withZod } from '@remix-validated-form/with-zod'
import { FirebaseError } from 'firebase/app'
import { ValidatedForm, validationError } from 'remix-validated-form'
import { z } from 'zod'
import Input from '~/components/form/input'
import SubmitButton from '~/components/form/submit-button'
import BottomCardLayout from '~/components/layouts/bottom-card'
import { sendPasswordResetEmail } from '~/services/firebase.server'

const schema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email({ message: "L'email est invalide" }),
})

const validator = withZod(schema)

export const meta: MetaFunction = () => ({
  title: 'Baily - Réinitialisez votre mot de passe',
})

export async function action({ request }: ActionArgs) {
  let result = await validator.validate(await request.formData())

  if (result.error) {
    return validationError(result.error)
  }

  let { email } = result.data

  try {
    await sendPasswordResetEmail(email)
    return redirect('/login?from=forgot-password')
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

export default function LoginRoute() {
  return (
    <BottomCardLayout>
      <div className="flex justify-between mb-5 card-title">
        <h1 className="text-xl">Réinitialisation du mot de passe</h1>
      </div>

      <p>
        Entrez votre email en dessous et nous vous enverrons un email pour
        réinitialiser votre mot de passe.
      </p>

      <ValidatedForm validator={validator} method="post">
        <Input name="email" label="Email" />
        <div className="w-full mt-5 form-control">
          <SubmitButton
            label="Envoyer le mail de réinitialisation"
            submittingLabel="Envoi du mail..."
          />
        </div>
        <div className="w-full mt-5 form-control">
          <Link to="/login" className="btn btn-ghost">
            Se connecter
          </Link>
        </div>
        <div className="w-full mt-5 form-control">
          <Link to="/signin" className="btn btn-ghost">
            S'inscrire
          </Link>
        </div>
      </ValidatedForm>
    </BottomCardLayout>
  )
}
