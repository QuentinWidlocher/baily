import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { addHours, format, isBefore, parse } from 'date-fns'
import { Bin, NavArrowLeft, SaveFloppyDisk } from 'iconoir-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { makeDomainFunction } from 'remix-domains'
import { formAction, Form } from '~/services/form'
import invariant from 'tiny-invariant'
import { z } from 'zod'
import LoadingItem from '~/components/loading-item'
import type { Diaper } from '~/services/diapers.server'
import {
  createDiaper,
  deleteDiaper,
  getDiaper,
  updateDiaper,
} from '~/services/diapers.server'
import { superjson, useSuperLoaderData } from '~/services/superjson'
import { dateToISOLikeButLocal } from '~/services/time'

const schema = z.object({
  _action: z.enum(['delete', 'update']),
  description: z
    .string({
      invalid_type_error: 'La description est invalide',
    })
    .min(1, 'La description est obligatoire')
    .max(50, 'La description doit faire moins de 50 caractères'),
  date: z
    .date({ invalid_type_error: 'La date doit être remplie' })
    .refine((date) => isBefore(date, new Date()), {
      message: 'La date doit être dans le passé',
    }),
  time: z
    .string()
    .min(1, { message: "L'heure doit être remplie" })
    .regex(/^\d{2}:\d{2}/, {
      message: 'Le format doit être hh:mm',
    }),
})

export async function loader({ params }: LoaderArgs) {
  invariant(params.diaperId, 'diaper id is required')

  let diaper =
    params.diaperId === 'new'
      ? ({} as Diaper)
      : await getDiaper(params.diaperId)

  return superjson({
    diaper,
  })
}

const prefillOptions = ['Souillée', 'Pipi', 'Mixte']

export async function action({ request, params }: ActionArgs) {
  let action = (await request.clone().formData()).get('_action')?.toString()

  if (action == 'delete') {
    invariant(params.babyId, 'baby id is required')
    invariant(params.diaperId, 'diaper id is required')

    await deleteDiaper(params.diaperId, params.babyId)
    return redirect(`/baby/${params.babyId}`)
  } else {
    return formAction({
      request,
      schema,
      successPath: `/baby/${params.babyId}?tab=diapers`,
      mutation: makeDomainFunction(schema)(async (values) => {
        let diaper = values

        invariant(params.babyId, 'baby id is required')
        invariant(params.diaperId, 'diaper id is required')

        let [hours, minutes] = values.time.split(':')

        let time = parse(
          `${format(values.date, 'yyyy-MM-dd')} ${hours}:${minutes}`,
          'yyyy-MM-dd HH:mm',
          new Date(),
        )

        // FIXME: DST hack for now
        let fixedTime = addHours(time, 1)

        if (params.diaperId == 'new') {
          await createDiaper(params.babyId, {
            ...diaper,
            time: fixedTime,
          })
        } else {
          await updateDiaper({
            ...diaper,
            id: params.diaperId,
            time: fixedTime,
          })
        }
      }),
    })
  }
}

export default function DiaperPage() {
  let { diaper } = useSuperLoaderData<typeof loader>()

  let [customDescription, setCustomDescription] = useState(
    !!diaper.description && !prefillOptions.includes(diaper.description),
  )
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
      <section className="card mt-auto md:mb-auto bg-base-200 w-full md:w-96">
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
              <Form schema={schema} onSubmit={onDelete}>
                {({ Field, Button }) => (
                  <>
                    <Field hidden name="_action" value="delete" />
                    <Button
                      className={`btn ${
                        confirm
                          ? 'btn-error'
                          : 'btn-square btn-ghost text-error'
                      }`}
                      title={confirm ? 'Confirmer la suppression' : 'Supprimer'}
                    >
                      {confirm ? <span className="mr-1">Confirmer</span> : ''}
                      <Bin />
                    </Button>
                  </>
                )}
              </Form>
            ) : null}
          </div>
          <Form schema={schema} method="post" className="flex flex-col">
            {({ Field, Errors, Button, register }) => (
              <>
                <Field name="_action" hidden value="update" />
                <Field name="date">
                  {({ Label, Errors, SmartInput }) => (
                    <div className="w-full form-control">
                      <Label className="label">
                        <span className="text-lg label-text">Date</span>
                      </Label>
                      <SmartInput
                        type="date"
                        value={
                          dateToISOLikeButLocal(
                            diaper.time ?? new Date(),
                          ).split('T')[0]
                        }
                        className="w-full input"
                      />
                      <label className="label">
                        <span className="label-text-alt text-error">
                          <Errors />
                        </span>
                      </label>
                    </div>
                  )}
                </Field>
                <Field name="time">
                  {({ Label, Errors, SmartInput }) => {
                    let [hours, minutes] = (diaper.time ?? new Date())
                      .toLocaleTimeString()
                      .split(':')

                    return (
                      <div className="w-full form-control">
                        <Label className="label">
                          <span className="text-lg label-text">Heure</span>
                        </Label>
                        <SmartInput
                          type="time"
                          value={`${hours}:${minutes}`}
                          className="w-full input"
                        />
                        <label className="label">
                          <span className="label-text-alt text-error">
                            <Errors />
                          </span>
                        </label>
                      </div>
                    )
                  }}
                </Field>
                <Field name="description">
                  {({ Label, Errors, SmartInput }) => (
                    <div className="form-control">
                      <Label className="label">
                        <span className="text-lg label-text">Description</span>
                        <div className="tabs tabs-boxed">
                          <button
                            type="button"
                            onClick={() => setCustomDescription(true)}
                            className={`tab ${
                              customDescription ? 'tab-active' : ''
                            }`}
                          >
                            Personnelle
                          </button>
                          <button
                            type="button"
                            onClick={() => setCustomDescription(false)}
                            className={`tab ${
                              customDescription ? '' : 'tab-active'
                            }`}
                          >
                            Habituelle
                          </button>
                        </div>
                      </Label>
                      {customDescription ? (
                        <SmartInput
                          type="text"
                          className="w-full input"
                          value={diaper.description}
                        />
                      ) : (
                        <select
                          {...register('description')}
                          className="select bg-base-300"
                          defaultValue={diaper.description ?? ''}
                        >
                          <option value="" disabled>
                            Choisir
                          </option>
                          {prefillOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}
                      <label className="label">
                        <span className="label-text-alt text-error">
                          <Errors />
                        </span>
                      </label>
                    </div>
                  )}
                </Field>
                <Button className="w-full mt-10 space-x-2 btn btn-primary">
                  <SaveFloppyDisk />
                  <span>{diaper.id ? 'Modifier' : 'Ajouter'} cette couche</span>
                </Button>
              </>
            )}
          </Form>
        </div>
      </section>
    </>
  )
}
