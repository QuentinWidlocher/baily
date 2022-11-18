import { NavArrowLeft } from 'iconoir-react'
import LoadingItem from '~/components/loading-item'
import type { ActionArgs, MetaFunction } from '@remix-run/server-runtime'
import { redirect } from '@remix-run/server-runtime'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { createBaby } from '~/services/babies.server'
import { requireUserId } from '~/services/session.server'
import { ValidatedForm, validationError } from 'remix-validated-form'
import Input from '~/components/form/input'
import SubmitButton from '~/components/form/submit-button'
import BottomCardLayout from '~/components/layouts/bottom-card'

const schema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
})

const validator = withZod(schema)

export const meta: MetaFunction = () => ({
  title: 'Baily - Nouveau bébé !',
})

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
    <BottomCardLayout>
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
    </BottomCardLayout>
  )
}
