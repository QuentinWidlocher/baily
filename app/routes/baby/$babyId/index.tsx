import type { LoaderArgs } from '@remix-run/node'
import { getBaby } from '~/services/firebase.server'
import { superjson, useSuperLoaderData } from '~/services/superjson'
import { Link } from '@remix-run/react'
import invariant from 'tiny-invariant'
import {
  displayTime,
  getDistanceFromNow,
  getRelativeDate,
  groupByTime,
} from '~/services/time'
import { Fragment, useEffect } from 'react'
import { isSameDay, parse } from 'date-fns'
import { Plus, MoreHoriz, RefreshDouble } from 'iconoir-react'

export async function loader({ params }: LoaderArgs) {
  invariant(params.babyId, 'params.id is required')

  let baby = await getBaby(params.babyId)
  let groupedBottles = groupByTime(baby.bottles)

  console.log(
    'Server timezone',
    Intl.DateTimeFormat().resolvedOptions().timeZone
  )
  console.log('Server timezone offset', new Date().getTimezoneOffset())

  return superjson({ babyName: baby.name, babyId: baby.id, groupedBottles })
}

export default function Index() {
  let { babyId, babyName, groupedBottles } = useSuperLoaderData<typeof loader>()

  return (
    <>
      <section className="card flex-1 bg-base-200 w-full md:w-96">
        <div className="card-body overflow-y-auto overflow-x-hidden">
          <div className="card-title flex justify-between mb-5">
            <h1 className="text-xl">Les biberons de {babyName}</h1>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-square btn-ghost m-1">
                <MoreHoriz />
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-72"
              >
                <li>
                  <button
                    className="space-x-2 text-left"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshDouble />
                    <span>Rafraîchir la page</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <ul className="menu -mx-5 p-2 flex-1 overflow-y-auto">
            {Object.keys(groupedBottles).map((day) => (
              <Fragment key={day}>
                <li className="mt-16 first-of-type:mt-0 flex mx-3 flex-row justify-between">
                  <span className="hover:bg-transparent hover:cursor-default p-1">
                    {getRelativeDate(parse(day, 'yyyy-MM-dd', new Date()))}
                  </span>
                  <span className="hover:bg-transparent hover:cursor-default p-1 font-bold">
                    Total : {groupedBottles[day].total}ml
                  </span>
                </li>
                {groupedBottles[day].bottles.map((bottle) => {
                  let sameDay = isSameDay(bottle.time, new Date())
                  return (
                    <li key={bottle.id}>
                      <Link
                        className={`stat ${!sameDay ? 'grid-cols-2' : ''}`}
                        to={`/baby/${babyId}/bottle/${bottle.id}`}
                      >
                        <span className="stat-value">{bottle.quantity}ml</span>
                        <span
                          className={`stat-desc text-lg leading-tight ${
                            sameDay
                              ? 'flex justify-between'
                              : 'col-start-2 text-right'
                          }`}
                        >
                          {isSameDay(bottle.time, new Date()) ? (
                            <span>{getDistanceFromNow(bottle.time)}</span>
                          ) : null}
                          <span>{displayTime(bottle.time)}</span>
                        </span>
                      </Link>
                    </li>
                  )
                })}
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
