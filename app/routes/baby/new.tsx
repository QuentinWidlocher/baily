import { NavArrowLeft } from 'iconoir-react'
import LoadingItem from '~/components/loading-item'
import type { ActionArgs } from '@remix-run/server-runtime'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { createBaby } from '~/services/babies.server'
import { requireUserId } from '~/services/session.server'
import { ValidatedForm, validationError } from 'remix-validated-form'
import Input from '~/components/form/input'
import SubmitButton from '~/components/form/submit-button'
import { redirect } from '~/services/superjson'

const schema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
})

const validator = withZod(schema)

export async function action({ request }: ActionArgs) {
  let uid = await requireUserId(request)

  let result = await validator.validate(await request.formData())

  if (result.error) {
    return validationError(result.error)
  }

  let { name } = result.data

  let id = await createBaby(uid, name)

  return redirect(`/baby/${id}`)
}

export default function NewBabyRoute() {
  return (
    <section className="w-full mt-auto md:mb-auto mx-2 card max-sm:rounded-b-none bg-base-200 md:w-96">
      <div className="overflow-x-hidden overflow-y-auto card-body">
        <div className="flex justify-between mb-5 card-title">
          <h1 className="text-xl">Nouveau bébé !</h1>
          <LoadingItem
            type="link"
            to="/babies"
            className="space-x-2 btn btn-ghost"
            title="Retour"
            icon={<NavArrowLeft />}
            label="Retour"
          />
        </div>

        <ValidatedForm validator={validator} method="post">
          <Input name="name" label="Nom du bébé" />
          <div className="w-full mt-5 form-control">
            <SubmitButton
              label="Ajouter le bébé"
              submittingLabel="Ajout en cours"
            />
          </div>
        </ValidatedForm>
      </div>
    </section>
  )
}
