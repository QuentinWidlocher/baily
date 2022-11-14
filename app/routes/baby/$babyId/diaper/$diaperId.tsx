import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { withZod } from '@remix-validated-form/with-zod'
import { format, isBefore, parse, parseISO } from 'date-fns'
import { Bin, NavArrowLeft, SaveFloppyDisk } from 'iconoir-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { ValidatedForm, validationError } from 'remix-validated-form'
import invariant from 'tiny-invariant'
import { z } from 'zod'
import DateTimeInput from '~/components/form/date-time-input'
import SelectInput from '~/components/form/select-input'
import SubmitButton from '~/components/form/submit-button'
import LoadingItem from '~/components/loading-item'
import type { Diaper } from '~/services/diapers.server'
import {
  createDiaper,
  deleteDiaper,
  getDiaper,
  updateDiaper,
} from '~/services/diapers.server'

const schema = z.object({
  _action: z.literal('update'),
  description: z
    .string({
      required_error: 'La description est obligatoire',
      invalid_type_error: 'La description est invalide',
    })
    .min(1, 'La description est obligatoire')
    .max(50, 'La description doit faire moins de 50 caractères'),
  date: z.object({
    date: z
      .string()
      .min(1, { message: 'La date doit être remplie' })
      .transform((x) => parseISO(x))
      .refine((date) => isBefore(date, new Date()), {
        message: 'La date doit être dans le passé',
      }),
    time: z
      .string()
      .min(1, { message: "L'heure doit être remplie" })
      .regex(/^\d{2}:\d{2}/, {
        message: 'Le format doit être hh:mm',
      }),
  }),
})

const validator = withZod(schema)

export async function loader({ params }: LoaderArgs) {
  invariant(params.diaperId, 'diaper id is required')

  let diaper =
    params.diaperId === 'new'
      ? ({} as Diaper)
      : await getDiaper(params.diaperId)

  return json({
    diaper,
  })
}

const prefillOptions = ['Pipi 💦', 'Popo 💩', 'Mixte']

export async function action({ request, params }: ActionArgs) {
  invariant(params.babyId, 'baby id is required')
  invariant(params.diaperId, 'diaper id is required')

  let action = (await request.clone().formData()).get('_action')?.toString()

  if (action == 'delete') {
    await deleteDiaper(params.diaperId, params.babyId)
    return redirect(`/baby/${params.babyId}?tab=diapers`)
  } else {
    let result = await validator.validate(await request.formData())

    if (result.error) {
      return validationError(result.error)
    }

    let diaper = result.data

    let [hours, minutes] = diaper.date.time.split(':')

    let time = parse(
      `${format(diaper.date.date, 'yyyy-MM-dd')} ${hours}:${minutes}`,
      'yyyy-MM-dd HH:mm',
      new Date(),
    )

    if (params.diaperId == 'new') {
      await createDiaper(params.babyId, {
        ...diaper,
        time,
      })
    } else {
      await updateDiaper({
        ...diaper,
        id: params.diaperId,
        time,
      })
    }

    return redirect(`/baby/${params.babyId}?tab=diapers`)
  }
}

export default function DiaperPage() {
  let { diaper } = useLoaderData<typeof loader>()

  let [confirm, setConfirm] = useState(false)

  function onDelete(e: FormEvent<HTMLFormElement>) {
    if (!confirm) {
      e.preventDefault()
      setConfirm(true)
      setTimeout(() => setConfirm(false), 3000)
    }
  }

  return (
    <>
      <section className="w-full mt-auto card max-sm:rounded-b-none md:mb-auto bg-base-200 md:w-96">
        <div className="card-body">
          <div className="flex justify-between">
            <LoadingItem
              type="link"
              to="./../..?tab=diapers"
              className="mb-5 space-x-2 btn btn-ghost"
              title="Retour"
              icon={<NavArrowLeft />}
              label="Retour"
            ></LoadingItem>
            {diaper.id ? (
              <Form method="post" onSubmit={onDelete}>
                <input hidden name="_action" value="delete" readOnly />
                <button
                  className={`btn ${
                    confirm ? 'btn-error' : 'btn-square btn-ghost text-error'
                  }`}
                  title={confirm ? 'Confirmer la suppression' : 'Supprimer'}
                >
                  {confirm ? <span className="mr-1">Confirmer</span> : ''}
                  <Bin />
                </button>
              </Form>
            ) : null}
          </div>

          <ValidatedForm
            validator={validator}
            method="post"
            className="flex flex-col"
          >
            <input name="_action" hidden value="update" readOnly />
            <SelectInput
              name="description"
              options={prefillOptions}
              allowCustom
              defaultValue={diaper.description}
              label="Description"
            />
            <DateTimeInput
              name="date"
              label="Date et heure"
              defaultValue={diaper.time ? new Date(diaper.time) : new Date()}
            />
            <SubmitButton
              icon={<SaveFloppyDisk />}
              label={`${diaper.id ? 'Modifier' : 'Ajouter'} cette couche`}
              submittingLabel={diaper.id ? 'Modification' : 'Ajout'}
              className="mt-10 btn btn-primary"
            />
          </ValidatedForm>
        </div>
      </section>
    </>
  )
}
