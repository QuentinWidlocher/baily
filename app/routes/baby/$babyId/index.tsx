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
import { Fragment, useState } from 'react'
import { isSameDay, parse } from 'date-fns'
import {
  Plus,
  MoreHoriz,
  RefreshDouble,
  StatsSquareUp,
  RefreshCircular,
} from 'iconoir-react'

export async function loader({ params }: LoaderArgs) {
  invariant(params.babyId, 'params.id is required')

  let baby = await getBaby(params.babyId)
  let groupedBottles = groupByTime(baby.bottles)

  console.log(
    'Server timezone',
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  )
  console.log('Server timezone offset', new Date().getTimezoneOffset())

  return superjson({ babyName: baby.name, babyId: baby.id, groupedBottles })
}

export default function Index() {
  let { babyId, babyName, groupedBottles } = useSuperLoaderData<typeof loader>()
  let [reloading, setReloading] = useState(false)
  let [navToStats, setNavToStats] = useState(false)

  return (
    <>
      <section className="flex-1 w-full card bg-base-200 md:w-96">
        <div className="overflow-x-hidden overflow-y-auto card-body">
          <div className="flex justify-between mb-5 card-title">
            <h1 className="text-xl">Les biberons de {babyName}</h1>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="m-1 btn btn-square btn-ghost">
                <MoreHoriz />
              </label>
              <ul
                tabIndex={0}
                className="p-2 shadow dropdown-content menu bg-base-100 rounded-box w-72"
              >
                <li>
                  <button
                    className={`space-x-2 text-left ${
                      reloading ? 'animate-pulse' : ''
                    }`}
                    onClick={() => {
                      setReloading(true)
                      window.location.reload()
                    }}
                    disabled={reloading}
                  >
                    {reloading ? (
                      <RefreshCircular className="animate-spin" />
                    ) : (
                      <RefreshDouble />
                    )}
                    <span>Rafraîchir la page</span>
                  </button>
                </li>
                <li>
                  <Link
                    className={`space-x-2 text-left ${
                      navToStats ? 'animate-pulse' : ''
                    }`}
                    to={`/baby/${babyId}/stats`}
                    onClick={() => setNavToStats(true)}
                  >
                    {navToStats ? (
                      <RefreshCircular className="animate-spin" />
                    ) : (
                      <StatsSquareUp />
                    )}
                    <span>Voir l'évolution</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <ul className="flex-1 p-2 -mx-5 overflow-y-auto menu">
            {Object.keys(groupedBottles).map((day) => (
              <Fragment key={day}>
                <li className="flex flex-row justify-between mx-3 mt-16 first-of-type:mt-0">
                  <span className="p-1 hover:bg-transparent hover:cursor-default">
                    {getRelativeDate(parse(day, 'yyyy-MM-dd', new Date()))}
                  </span>
                  <span className="p-1 font-bold hover:bg-transparent hover:cursor-default">
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
            className="w-full mt-5 space-x-2 btn btn-primary"
          >
            <Plus />
            <span>Ajouter un biberon</span>
          </Link>
        </div>
      </section>
    </>
  )
}
