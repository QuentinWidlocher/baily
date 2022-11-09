import { Link } from '@remix-run/react'
import type { ActionArgs } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import { FirebaseError } from 'firebase/app'
import { EyeClose, EyeEmpty } from 'iconoir-react'
import { useState } from 'react'
import { makeDomainFunction } from 'remix-domains'
import { Form } from '~/services/form'
import { performMutation } from 'remix-forms'
import { z } from 'zod'
import { createUser } from '~/services/firebase.server'
import { createUserSession } from '~/services/session.server'
import { redirect } from '~/services/superjson'

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

export async function action({ request }: ActionArgs) {
  let result = await performMutation({
    request,
    schema,
    mutation: makeDomainFunction(schema)(async ({ email, password }) => {
      try {
        let newUser = await createUser(email, password)
        return createUserSession(await (await newUser.getIdTokenResult()).token)
      } catch (e) {
        if (e instanceof FirebaseError) {
          console.log(e.code)
          if (e.code == 'auth/user-not-found') {
            throw new Error("Cet email n'existe pas sur B++")
          } else if (e.code == 'auth/wrong-password') {
            throw new Error('Le mot de passe est incorrect')
          } else if (e.code == 'auth/email-already-in-use') {
            throw new Error(
              'Cet email existe déjà, vous pourriez essayer de vous connecter avec.',
            )
          } else {
            throw new Error('Une erreur est survenue')
          }
        }
      }
    }),
  })

  if (!result.success) return json(result, 400)

  // result.data is the return value of createUserSession (a redirect())
  return result.data
}

export default function LoginRoute() {
  let [showPassword, setShowPassword] = useState(false)

  return (
    <main className="flex flex-col items-center h-screen px-2 py-2 overflow-hidden md:py-5">
      <section className="w-full mt-auto md:my-auto card max-sm:rounded-b-none bg-base-200 md:w-96">
        <div className="overflow-x-hidden overflow-y-auto card-body">
          <div className="flex justify-between mb-5 card-title">
            <h1 className="text-xl">S'inscrire</h1>
          </div>

          <p>
            Créer un compte sur B++ que les parents pourront utiliser afin de
            noter les biberons.
          </p>

          <Form schema={schema}>
            {({ Button, Field, Errors, register }) => (
              <>
                <Field name="email">
                  {({ SmartInput, Label, Errors }) => (
                    <div className="w-full form-control">
                      <Label className="label">
                        <span className="label-text">Email</span>
                      </Label>
                      <SmartInput type="email" className="w-full input" />
                      <label className="label">
                        <span className="label-text-alt text-error">
                          <Errors />
                        </span>
                      </label>
                    </div>
                  )}
                </Field>
                <Field name="password">
                  {({ Label, Errors }) => (
                    <div className="w-full form-control">
                      <Label className="label">
                        <span className="label-text">Mot de passe</span>
                        <span className="label-text-alt">
                          Au moins 8 caractères
                        </span>
                      </Label>
                      <div className="input-group">
                        <input
                          {...register('password')}
                          type={showPassword ? 'text' : 'password'}
                          className="w-full input"
                        />
                        <div
                          onClick={() => setShowPassword((x) => !x)}
                          className={`bg-base-300 swap px-2 ${
                            showPassword ? 'swap-active' : ''
                          }`}
                        >
                          <div className="swap-on">
                            <EyeClose />
                          </div>
                          <div className="swap-off">
                            <EyeEmpty />
                          </div>
                        </div>
                      </div>
                      <label className="label">
                        <span className="label-text-alt text-error">
                          <Errors />
                        </span>
                      </label>
                    </div>
                  )}
                </Field>
                <Errors className="text-error" />
                <div className="w-full mt-5 form-control">
                  <Button className="btn btn-primary">S'inscrire</Button>
                </div>
                <div className="w-full mt-5 form-control">
                  <Link to="/login" className="btn btn-ghost">
                    Se connecter
                  </Link>
                </div>
              </>
            )}
          </Form>
        </div>
      </section>
    </main>
  )
}
