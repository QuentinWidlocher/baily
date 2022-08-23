import type { LoaderArgs } from '@remix-run/node'
import { getBabies, getBaby } from '~/services/firebase.server'
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
  NavArrowDown,
  LogOut,
} from 'iconoir-react'
import { requireUserId } from '~/services/session.server'

export async function loader({ params, request }: LoaderArgs) {
  invariant(params.babyId, 'params.babyId is required')

  let uid = await requireUserId(request)

  let baby = await getBaby(params.babyId)
  let groupedBottles = groupByTime(baby.bottles)

  let babies = (await getBabies(uid)).filter((b) => b.id !== baby.id)

  return superjson({
    babyName: baby.name,
    babyId: baby.id,
    groupedBottles,
    babies,
  })
}

export default function Index() {
  let { babyId, babyName, groupedBottles, babies } =
    useSuperLoaderData<typeof loader>()
  let [reloading, setReloading] = useState(false)
  let [navToStats, setNavToStats] = useState(false)
  let [loggingOut, setLoggingOut] = useState(false)

  return (
    <>
      <section className="flex-1 w-full card bg-base-200 md:w-1/4">
        <div className="overflow-x-hidden overflow-y-auto card-body">
          <div className="flex justify-between mb-5 card-title">
            <div className="flex space-x-2">
              <h1 className="text-xl hidden md:block">Les biberons de </h1>
              <div className="dropdown">
                <label className="flex items-center" tabIndex={0}>
                  <span>{babyName}</span> <NavArrowDown className="text-sm" />
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-72"
                >
                  {babies.map((baby) => (
                    <li key={baby.id}>
                      <Link to={`../${baby.id}`}>{baby.name}</Link>
                    </li>
                  ))}
                  <li>
                    <Link to={`../new`}>Nouveau bébé 🥳</Link>
                  </li>
                </ul>
              </div>
            </div>
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
                <li>
                  <Link
                    className={`space-x-2 text-left ${
                      loggingOut ? 'animate-pulse' : ''
                    }`}
                    to={`/logout`}
                    onClick={() => setLoggingOut(true)}
                  >
                    {loggingOut ? (
                      <RefreshCircular className="animate-spin" />
                    ) : (
                      <LogOut />
                    )}
                    <span>Déconnexion</span>
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
