import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { withZod } from '@remix-validated-form/with-zod'
import { format, isBefore, isToday, parse, parseISO } from 'date-fns'
import { Bin, NavArrowLeft, SaveFloppyDisk } from 'iconoir-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { ValidatedForm, validationError } from 'remix-validated-form'
import invariant from 'tiny-invariant'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import DateTimeInput from '~/components/form/date-time-input'
import SelectInput from '~/components/form/select-input'
import SubmitButton from '~/components/form/submit-button'
import LoadingItem from '~/components/loading-item'
import type { Sleep } from '~/services/sleeps.server'
import {
  createSleep,
  deleteSleep,
  getSleep,
  updateSleep,
} from '~/services/sleeps.server'

const schema = z
  .object({
    _action: z.literal('update'),
    description: zfd.text(
      z.undefined().or(
        z
          .string({
            invalid_type_error: 'La description est invalide',
          })
          .max(50, 'La description doit faire moins de 50 caractères'),
      ),
    ),
    start: z.object({
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
    end: z.preprocess(
      (end) => {
        if (
          !end ||
          !(typeof end == 'object') ||
          !('date' in end) ||
          !('time' in end) ||
          // @ts-ignore
          !end.date ||
          // @ts-ignore
          !end.time
        ) {
          return undefined
        }
        return end
      },
      z
        .object({
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
        })
        .optional(),
    ),
  })
  .transform((values, ctx) => {
    let [startHours, startMinutes] = values.start.time.split(':')

    let start = parse(
      `${format(
        values.start.date,
        'yyyy-MM-dd',
      )} ${startHours}:${startMinutes}`,
      'yyyy-MM-dd HH:mm',
      new Date(),
    )

    if (values.end?.time && values.end?.date) {
      let [endHours, endMinutes] = values.end.time.split(':')

      let end = parse(
        `${format(values.end.date, 'yyyy-MM-dd')} ${endHours}:${endMinutes}`,
        'yyyy-MM-dd HH:mm',
        new Date(),
      )

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
    } else {
      return {
        ...values,
        start,
        end: undefined,
      }
    }
  })

const validator = withZod(schema)

export async function loader({ params }: LoaderArgs) {
  invariant(params.sleepId, 'sleep id is required')

  let sleep =
    params.sleepId === 'new' ? ({} as Sleep) : await getSleep(params.sleepId)

  return json({
    sleep,
  })
}

const prefillOptions = ['Agité', 'Normal']

export async function action({ request, params }: ActionArgs) {
  invariant(params.babyId, 'baby id is required')
  invariant(params.sleepId, 'sleep id is required')

  let action = (await request.clone().formData()).get('_action')?.toString()

  if (action == 'delete') {
    await deleteSleep(params.sleepId, params.babyId)
    return redirect(`/baby/${params.babyId}?tab=sleeps`)
  } else {
    let result = await validator.validate(await request.formData())

    if (result.error) {
      return validationError(result.error)
    }

    let sleep = result.data

    if (params.sleepId == 'new') {
      await createSleep(params.babyId, sleep)
    } else {
      await updateSleep({
        ...sleep,
        id: params.sleepId,
      })
    }

    return redirect(`/baby/${params.babyId}?tab=sleeps`)
  }
}

export default function SleepPage() {
  let { sleep } = useLoaderData<typeof loader>()

  let [confirm, setConfirm] = useState(false)
  let [end, setEnd] = useState(sleep.end ? new Date(sleep.end) : undefined)

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
              defaultValue={sleep.description}
              label="Description"
            />
            <DateTimeInput
              name="start"
              label="Début"
              defaultValue={sleep.start ? new Date(sleep.start) : new Date()}
            />
            <DateTimeInput
              name="end"
              label="Fin"
              labelAlt={
                !end || !isToday(end) ? (
                  <button
                    onClick={() => setEnd(new Date())}
                    type="button"
                    className="btn btn-primary btn-sm"
                  >
                    Maintenant
                  </button>
                ) : undefined
              }
              defaultValue={end ?? undefined}
              value={end}
              onTimeChange={(e) => {
                let parsed = parse(e.target.value, 'HH:mm', end ?? new Date())
                if (!isNaN(parsed.getTime())) {
                  setEnd(parsed)
                } else {
                  setEnd(undefined)
                }
              }}
              onDateChange={(e) => {
                let parsed = parse(
                  e.target.value,
                  'yyyy-MM-dd',
                  end ?? new Date(),
                )
                if (!isNaN(parsed.getTime())) {
                  setEnd(parsed)
                } else {
                  setEnd(undefined)
                }
              }}
            />
            <SubmitButton
              icon={<SaveFloppyDisk />}
              label={`${sleep.id ? 'Modifier' : 'Ajouter'} ce dodo`}
              submittingLabel={sleep.id ? 'Modification' : 'Ajout'}
              className="mt-10 btn btn-primary"
            />
          </ValidatedForm>
        </div>
      </section>
    </>
  )
}
