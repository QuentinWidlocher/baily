import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { format, isBefore, parse } from 'date-fns'
import { Bin, NavArrowLeft, SaveFloppyDisk } from 'iconoir-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { makeDomainFunction } from 'remix-domains'
import { formAction, Form } from '~/services/form'
import invariant from 'tiny-invariant'
import { z } from 'zod'
import LoadingItem from '~/components/loading-item'
import type { Sleep } from '~/services/sleeps.server'
import {
  createSleep,
  deleteSleep,
  getSleep,
  updateSleep,
} from '~/services/sleeps.server'
import { superjson, useSuperLoaderData } from '~/services/superjson'
import { adjustedForDST, dateToISOLikeButLocal } from '~/services/time'

const schema = z
  .object({
    _action: z.enum(['delete', 'update']),
    description: z
      .string({
        invalid_type_error: 'La description est invalide',
      })
      .max(50, 'La description doit faire moins de 50 caractères'),
    startDate: z
      .date({ invalid_type_error: 'La date doit être remplie' })
      .refine((date) => isBefore(date, new Date()), {
        message: 'La date doit être dans le passé',
      }),
    startTime: z
      .string()
      .min(1, { message: "L'heure doit être remplie" })
      .regex(/^\d{2}:\d{2}/, {
        message: 'Le format doit être hh:mm',
      }),
    endDate: z
      .date({ invalid_type_error: 'La date doit être remplie' })
      .refine((date) => isBefore(date, new Date()), {
        message: 'La date doit être dans le passé',
      }),
    endTime: z
      .string()
      .min(1, { message: "L'heure doit être remplie" })
      .regex(/^\d{2}:\d{2}/, {
        message: 'Le format doit être hh:mm',
      }),
  })
  .transform((values, ctx) => {
    let [startHours, startMinutes] = values.startTime.split(':')

    let start = parse(
      `${format(values.startDate, 'yyyy-MM-dd')} ${startHours}:${startMinutes}`,
      'yyyy-MM-dd HH:mm',
      new Date(),
    )

    start = adjustedForDST(start)

    let [endHours, endMinutes] = values.endTime.split(':')

    let end = parse(
      `${format(values.endDate, 'yyyy-MM-dd')} ${endHours}:${endMinutes}`,
      'yyyy-MM-dd HH:mm',
      new Date(),
    )

    end = adjustedForDST(end)

    if (isBefore(end, start)) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date,
        message: 'La date de fin doit être après la date de début',
        path: ['endDate'],
      })
    }

    return {
      ...values,
      start,
      end,
    }
  })

export async function loader({ params }: LoaderArgs) {
  invariant(params.sleepId, 'sleep id is required')

  let sleep =
    params.sleepId === 'new' ? ({} as Sleep) : await getSleep(params.sleepId)

  return superjson({
    sleep,
  })
}

const prefillOptions = ['Normal', 'Agité', "D'une traite"]

export async function action({ request, params }: ActionArgs) {
  let action = (await request.clone().formData()).get('_action')?.toString()

  if (action == 'delete') {
    invariant(params.babyId, 'baby id is required')
    invariant(params.sleepId, 'sleep id is required')

    await deleteSleep(params.sleepId, params.babyId)
    return redirect(`/baby/${params.babyId}?tab=sleeps`)
  } else {
    return formAction({
      request,
      schema,
      successPath: `/baby/${params.babyId}?tab=sleeps`,
      mutation: makeDomainFunction(schema)(async (values) => {
        invariant(params.babyId, 'baby id is required')
        invariant(params.sleepId, 'sleep id is required')

        if (params.sleepId == 'new') {
          await createSleep(params.babyId, values)
        } else {
          await updateSleep({
            ...values,
            id: params.sleepId,
          })
        }
      }),
    })
  }
}

export default function SleepPage() {
  let { sleep } = useSuperLoaderData<typeof loader>()

  let [customDescription, setCustomDescription] = useState(
    !!sleep.description && !prefillOptions.includes(sleep.description),
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
      <section className="w-full mt-auto card max-sm:rounded-b-none md:mb-auto bg-base-200 md:w-96">
        <div className="card-body">
          <div className="flex justify-between">
            <LoadingItem
              type="link"
              to="./../..?tab=sleeps"
              className="mb-5 space-x-2 btn btn-ghost"
              title="Retour"
              icon={<NavArrowLeft />}
              label="Retour"
            ></LoadingItem>
            {sleep.id ? (
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
            {({ Field, Errors, Button, register, formState }) => (
              <>
                <Field name="_action" hidden value="update" />

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
                          value={sleep.description}
                        />
                      ) : (
                        <select
                          {...register('description')}
                          className="select bg-base-300"
                          defaultValue={sleep.description ?? ''}
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

                <div className="form-control">
                  <label className="label">
                    <span className="text-lg label-text">Début</span>
                  </label>
                  <div className="flex gap-2">
                    <Field name="startDate" className="w-4/6">
                      {({ Errors, SmartInput }) => (
                        <div className="form-control">
                          <SmartInput
                            type="date"
                            value={
                              dateToISOLikeButLocal(
                                sleep.start ?? new Date(),
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
                    <Field name="startTime" className="w-2/6">
                      {({ Label, Errors, SmartInput }) => {
                        let [hours, minutes] = (sleep.start ?? new Date())
                          .toLocaleTimeString()
                          .split(':')

                        return (
                          <div className="form-control">
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
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="text-lg label-text">Fin</span>
                  </label>
                  <div className="flex gap-2">
                    <Field name="endDate" className="w-4/6">
                      {({ Errors, SmartInput }) => (
                        <div className="form-control">
                          <SmartInput
                            type="date"
                            value={
                              dateToISOLikeButLocal(
                                sleep.end ?? new Date(),
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
                    <Field name="endTime" className="w-2/6">
                      {({ Label, Errors, SmartInput }) => {
                        let [hours, minutes] = (sleep.end ?? new Date())
                          .toLocaleTimeString()
                          .split(':')

                        return (
                          <div className="form-control">
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
                  </div>
                </div>

                <Errors className="text-error" />

                <Button
                  disabled={
                    formState.isSubmitting || formState.isSubmitSuccessful
                  }
                  className="w-full mt-10 space-x-2 btn btn-primary"
                >
                  <SaveFloppyDisk />
                  <span>{sleep.id ? 'Modifier' : 'Ajouter'} ce dodo</span>
                </Button>
              </>
            )}
          </Form>
        </div>
      </section>
    </>
  )
}
