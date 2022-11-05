import { Link } from '@remix-run/react'
import type { ActionArgs } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import { FirebaseError } from 'firebase/app'
import { makeDomainFunction } from 'remix-domains'
import { Form } from '~/services/form'
import { performMutation } from 'remix-forms'
import { z } from 'zod'
import { authenticate } from '~/services/firebase.server'
import { createUserSession } from '~/services/session.server'

const schema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email({ message: "L'email est invalide" }),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

export async function action({ request }: ActionArgs) {
  let result = await performMutation({
    request,
    schema,
    mutation: makeDomainFunction(schema)(async ({ email, password }) => {
      try {
        let token = await authenticate(email, password)
        return createUserSession(token)
      } catch (e) {
        if (e instanceof FirebaseError) {
          console.log(e.code)
          if (e.code == 'auth/user-not-found') {
            throw new Error("Cet email n'existe pas sur B++")
          } else if (e.code == 'auth/wrong-password') {
            throw new Error('Le mot de passe est incorrect')
          } else {
            throw new Error('Une erreur est survenue')
          }
        }
      }
    }),
  })

  if (!result.success) return json(result, 400)

  return result.data
}

export default function LoginRoute() {
  return (
    <main className="py-2 md:py-5 px-2 flex flex-col h-screen overflow-hidden items-center">
      <section className="mt-auto md:my-auto w-full card bg-base-200 md:w-96">
        <div className="overflow-x-hidden overflow-y-auto card-body">
          <div className="flex justify-between mb-5 card-title">
            <h1 className="text-xl">Connexion</h1>
          </div>

          <Form schema={schema}>
            {({ Button, Field, Errors }) => (
              <>
                <Field name="email">
                  {({ SmartInput, Label, Errors }) => (
                    <div className="form-control w-full">
                      <Label className="label">
                        <span className="label-text">Email</span>
                      </Label>
                      <SmartInput type="email" className="input w-full" />
                      <label className="label">
                        <span className="label-text-alt text-error">
                          <Errors />
                        </span>
                      </label>
                    </div>
                  )}
                </Field>
                <Field name="password">
                  {({ SmartInput, Label, Errors }) => (
                    <div className="form-control w-full">
                      <Label className="label">
                        <span className="label-text">Mot de passe</span>
                      </Label>
                      <SmartInput type="password" className="input w-full" />
                      <label className="label">
                        <span className="label-text-alt text-error">
                          <Errors />
                        </span>
                      </label>
                    </div>
                  )}
                </Field>
                <Errors className="text-error" />
                <div className="form-control w-full mt-5">
                  <Button className="btn btn-primary">Se connecter</Button>
                </div>

                <div className="form-control w-full mt-5">
                  <Link to="/signin" className="btn btn-ghost">
                    S'inscrire
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
