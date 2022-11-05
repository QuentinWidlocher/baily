import { Link } from '@remix-run/react'
import type { ActionArgs } from '@remix-run/server-runtime'
import { makeDomainFunction } from 'remix-domains'
import { z } from 'zod'
import { createBaby } from '~/services/babies.server'
import { Form, formAction } from '~/services/form'
import { requireUserId } from '~/services/session.server'

const schema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
})

export async function action({ request }: ActionArgs) {
  let uid = await requireUserId(request)

  return formAction({
    request,
    schema,
    successPath: (id) => `/baby/${id}`,
    mutation: makeDomainFunction(schema)(async ({ name }) => {
      return createBaby(uid, name)
    }),
  })
}

export default function NewBabyRoute() {
  return (
    <section className="mt-auto md:mb-auto w-full card bg-base-200 md:w-96">
      <div className="overflow-x-hidden overflow-y-auto card-body">
        <div className="flex justify-between mb-5 card-title">
          <h1 className="text-xl">Nouveau bébé !</h1>
          <Link className="text-base opacity-75" to="/babies">
            Retour
          </Link>
        </div>

        <Form schema={schema}>
          {({ Button, Field, Errors }) => (
            <>
              <Field name="name">
                {({ SmartInput, Label, Errors }) => (
                  <div className="form-control w-full">
                    <Label className="label">
                      <span className="label-text">Nom du bébé</span>
                    </Label>
                    <SmartInput className="input w-full" />
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
                <Button className="btn btn-primary">Ajouter le bébé</Button>
              </div>
            </>
          )}
        </Form>
      </div>
    </section>
  )
}
