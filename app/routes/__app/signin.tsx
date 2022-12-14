import { Link } from '@remix-run/react'
import type { ActionArgs, MetaFunction } from '@remix-run/server-runtime'
import { FirebaseError } from 'firebase/app'
import { z } from 'zod'
import { createUser } from '~/services/firebase.server'
import { createUserSession } from '~/services/session.server'
import { withZod } from '@remix-validated-form/with-zod'
import { ValidatedForm, validationError } from 'remix-validated-form'
import Input from '~/components/form/input'
import PasswordInput from '~/components/form/password-input'
import SubmitButton from '~/components/form/submit-button'
import BottomCardLayout from '~/components/layouts/bottom-card'

const schema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email({ message: "L'email est invalide" }),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' }),
})

const validator = withZod(schema)

export const meta: MetaFunction = () => ({
  title: 'Baily - Créer un compte',
})

export async function action({ request }: ActionArgs) {
  let result = await validator.validate(await request.formData())

  if (result.error) {
    return validationError(result.error)
  }

  let { email, password } = result.data

  try {
    let newUser = await createUser(email, password)
    return createUserSession(await (await newUser.getIdTokenResult()).token)
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.log(e.code)
      if (e.code == 'auth/email-already-in-use') {
        return validationError({
          fieldErrors: {
            email:
              'Cet email existe déjà, vous pourriez essayer de vous connecter avec.',
          },
          formId: result.formId,
        })
      } else {
        throw new Error('Une erreur est survenue')
      }
    }
  }
}

export default function LoginRoute() {
  return (
    <BottomCardLayout>
      <div className="flex justify-between mb-5 card-title">
        <h1 className="text-xl">S'inscrire</h1>
      </div>

      <p>
        Créer un compte sur Baily que les parents pourront utiliser afin de
        noter les biberons.
      </p>

      <ValidatedForm validator={validator} method="post">
        <Input label="Email" name="email" />
        <PasswordInput
          label="Mot de passe"
          name="password"
          labelAlt="Au moins 8 caractères"
          toggleVisibility
        />
        <div className="w-full mt-5 form-control">
          <SubmitButton label="S'inscrire" submittingLabel="Inscription" />
        </div>
        <div className="w-full mt-5 form-control">
          <Link to="/login" className="btn btn-ghost">
            Se connecter
          </Link>
        </div>
      </ValidatedForm>
    </BottomCardLayout>
  )
}
