import { LoaderArgs } from '@remix-run/node'
import { getBaby } from '~/services/firebase.server'
import { superjson, useSuperLoaderData } from '~/services/superjson'
import { Link } from '@remix-run/react'
import invariant from 'tiny-invariant'
import {
  getDistanceFromNow,
  getRelativeDate,
  groupByTime,
} from '~/services/time'
import { Fragment } from 'react'
import { parse } from 'date-fns'

export async function loader({ params }: LoaderArgs) {
  invariant(params.babyId, 'params.id is required')
  return superjson({ baby: await getBaby(params.babyId) })
}

export default function Index() {
  let { baby } = useSuperLoaderData<typeof loader>()

  let groupedBottles = groupByTime(baby.bottles)

  return (
    <>
      <section className="card flex-1 bg-base-200 w-full md:w-96">
        <div className="card-body overflow-y-auto">
          <h1 className="card-title text-xl mx-auto mb-5">
            Les biberons de {baby.name}
          </h1>
          <ul className="menu -mx-5 p-2 overflow-y-auto">
            {Object.keys(groupedBottles).map((day) => (
              <Fragment key={day}>
                <li className="menu-title mt-10">
                  <span>
                    {getRelativeDate(parse(day, 'yyyy-MM-dd', new Date()))}
                  </span>
                </li>
                {groupedBottles[day].map((bottle) => {
                  let distanceToNow = getDistanceFromNow(bottle.time)

                  return (
                    <li key={bottle.id}>
                      <Link
                        className="stat"
                        to={`/baby/${baby.id}/bottle/${bottle.id}`}
                      >
                        <span className="stat-value">{bottle.quantity}ml</span>
                        <span className="stat-desc text-lg">
                          {distanceToNow}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </Fragment>
            ))}
          </ul>
          <Link
            to={`/baby/${baby.id}/bottle/new`}
            className="btn btn-primary mt-5 w-full md:w-96"
          >
            Ajouter un biberon
          </Link>
        </div>
      </section>
    </>
  )
}
