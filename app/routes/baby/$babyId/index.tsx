import type { LoaderArgs } from '@remix-run/node'
import { getBaby } from '~/services/firebase.server'
import { superjson, useSuperLoaderData } from '~/services/superjson'
import { Link } from '@remix-run/react'
import invariant from 'tiny-invariant'
import {
  getDistanceFromNow,
  getDuration,
  getRelativeDate,
  groupByTime,
} from '~/services/time'
import { Fragment } from 'react'
import { format, isSameDay, parse } from 'date-fns'
import { Plus } from 'iconoir-react'

export async function loader({ params }: LoaderArgs) {
  invariant(params.babyId, 'params.id is required')

  let baby = await getBaby(params.babyId)
  let groupedBottles = groupByTime(baby.bottles)

  return superjson({ babyName: baby.name, babyId: baby.id, groupedBottles })
}

export default function Index() {
  let { babyId, babyName, groupedBottles } = useSuperLoaderData<typeof loader>()

  return (
    <>
      <section className="card flex-1 bg-base-200 w-full md:w-96">
        <div className="card-body overflow-y-auto overflow-x-hidden">
          <h1 className="card-title text-xl mx-auto mb-5">
            Les biberons de {babyName}
          </h1>
          <ul className="menu -mx-5 p-2 overflow-y-auto">
            {Object.keys(groupedBottles).map((day) => (
              <Fragment key={day}>
                <li className="mt-10 flex mx-3 flex-row justify-between">
                  <span className="hover:bg-transparent hover:cursor-default p-1">
                    {getRelativeDate(parse(day, 'yyyy-MM-dd', new Date()))}
                  </span>
                  <span className="hover:bg-transparent hover:cursor-default p-1 font-bold">
                    Total : {groupedBottles[day].total}ml
                  </span>
                </li>
                {groupedBottles[day].bottles.map((bottle) => (
                  <li key={bottle.id}>
                    <Link
                      className="stat"
                      to={`/baby/${babyId}/bottle/${bottle.id}`}
                    >
                      <span className="stat-value">{bottle.quantity}ml</span>
                      <span className="stat-desc text-lg leading-tight flex justify-between">
                        {getDistanceFromNow(bottle.time)}
                        {isSameDay(bottle.time, new Date()) ? (
                          <span>{format(bottle.time, 'HH:mm')}</span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                ))}
              </Fragment>
            ))}
          </ul>
          <Link
            to={`/baby/${babyId}/bottle/new`}
            className="btn btn-primary mt-5 w-full space-x-2"
          >
            <Plus />
            <span>Ajouter un biberon</span>
          </Link>
        </div>
      </section>
    </>
  )
}
