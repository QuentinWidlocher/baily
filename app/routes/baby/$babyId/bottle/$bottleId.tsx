import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { addHours, format, isBefore, parse } from 'date-fns'
import { Bin, NavArrowLeft, SaveFloppyDisk } from 'iconoir-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { makeDomainFunction } from 'remix-domains'
import invariant from 'tiny-invariant'
import { z } from 'zod'
import LoadingItem from '~/components/loading-item'
import type { Bottle } from '~/services/bottles.server'
import {
  createBottle,
  deleteBottle,
  getBottle,
  updateBottle,
} from '~/services/bottles.server'
import { formAction, Form } from '~/services/form'
import { superjson, useSuperLoaderData } from '~/services/superjson'
import { dateToISOLikeButLocal } from '~/services/time'

const schema = z.object({
  _action: z.enum(['delete', 'update']),
  quantity: z.number({
    required_error: 'La quantité est requise',
    invalid_type_error: 'La quantité est requise',
  }),
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
  invariant(params.bottleId, 'bottle id is required')

  let bottle =
    params.bottleId === 'new'
      ? ({} as Bottle)
      : await getBottle(params.bottleId)

  return superjson({
    bottle,
  })
}

export async function action({ request, params }: ActionArgs) {
  let action = (await request.clone().formData()).get('_action')?.toString()
  console.log(action)

  if (action == 'delete') {
    invariant(params.babyId, 'baby id is required')
    invariant(params.bottleId, 'bottle id is required')

    await deleteBottle(params.bottleId, params.babyId)
    return redirect(`/baby/${params.babyId}`)
  } else {
    return formAction({
      request,
      schema,
      successPath: `/baby/${params.babyId}?tab=bottles`,
      mutation: makeDomainFunction(schema)(async (values) => {
        let bottle = values

        invariant(params.babyId, 'baby id is required')
        invariant(params.bottleId, 'bottle id is required')

        let [hours, minutes] = bottle.time.split(':')

        let time = parse(
          `${format(bottle.date, 'yyyy-MM-dd')} ${hours}:${minutes}`,
          'yyyy-MM-dd HH:mm',
          new Date(),
        )

        // FIXME: DST hack for now
        let fixedTime = addHours(time, 1)

        if (params.bottleId == 'new') {
          await createBottle(params.babyId, {
            ...bottle,
            time: fixedTime,
          })
        } else {
          await updateBottle({
            ...bottle,
            id: params.bottleId,
            time: fixedTime,
          })
        }
      }),
    })
  }
}

export default function BottlePage() {
  let { bottle } = useSuperLoaderData<typeof loader>()
  let [confirm, setConfirm] = useState(false)
  let [sliderQuantity, setSliderQuantity] = useState(bottle.quantity ?? 140)

  function onDelete(e: FormEvent<HTMLFormElement>) {
    if (!confirm) {
      e.preventDefault()
      setConfirm(true)
      setTimeout(() => setConfirm(false), 3000)
    }
  }

  return (
    <>
      <div className="flex px-5 flex-col-reverse flex-1 w-full mb-5 align-middle md:mb-0 md:flex-col">
        <input
          type="range"
          min="40"
          max="240"
          value={sliderQuantity || 0}
          onChange={(e) => setSliderQuantity(e.target.valueAsNumber)}
          className="range"
          step="5"
        />
        <div className="flex justify-between w-full px-2 text-xs">
          <span>40</span>
          <span>65</span>
          <span>90</span>
          <span>115</span>
          <span>140</span>
          <span>165</span>
          <span>190</span>
          <span>115</span>
          <span>240</span>
        </div>
        <span className="my-auto text-6xl text-center">
          {sliderQuantity || 0} ml
        </span>
      </div>
      <section className="card md:mb-auto bg-base-200 w-full md:w-96">
        <div className="card-body">
          <div className="flex justify-between">
            <LoadingItem
              type="link"
              to="./../..?tab=bottles"
              className="mb-5 space-x-2 btn btn-ghost"
              title="Retour"
              icon={<NavArrowLeft />}
              label="Retour"
            />
            {bottle.id ? (
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
                            bottle.time ?? new Date(),
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
                    let [hours, minutes] = (bottle.time ?? new Date())
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
                <Field name="quantity">
                  {({ Label, Errors, SmartInput }) => (
                    <div className="form-control">
                      <Label className="label">
                        <span className="text-lg label-text">
                          Quantité donnée
                        </span>
                      </Label>
                      <label className="input-group">
                        <input
                          {...register('quantity')}
                          type="number"
                          value={sliderQuantity}
                          onChange={(e) => {
                            setSliderQuantity(e.target.valueAsNumber)
                          }}
                          className="w-full input"
                        />
                        <span>ml</span>
                      </label>
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
                  <span>{bottle.id ? 'Modifier' : 'Ajouter'} ce biberon</span>
                </Button>
              </>
            )}
          </Form>
        </div>
      </section>
    </>
  )
}
