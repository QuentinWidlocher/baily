import { Link } from '@remix-run/react'
import { LoaderArgs } from '@remix-run/server-runtime'
import { format } from 'date-fns'
import { NavArrowLeft } from 'iconoir-react'
import invariant from 'tiny-invariant'
import { getBaby } from '~/services/firebase.server'
import { superjson, useSuperLoaderData } from '~/services/superjson'
import { groupByWeeks } from '~/services/time'

export async function loader({ params }: LoaderArgs) {
  invariant(params.babyId, 'params.id is required')
  let baby = await getBaby(params.babyId, true)

  return superjson({ data: groupByWeeks(baby.bottles) })
}

export default function StatsPage() {
  let {
    data: [keys, bottles],
  } = useSuperLoaderData<typeof loader>()

  return (
    <section className="card flex-1 bg-base-200 w-full md:w-96">
      <div className="card-body overflow-y-auto overflow-x-hidden">
        <Link to="./.." className="btn btn-ghost mb-5 space-x-2" title="Retour">
          <NavArrowLeft />
          <span>Retour</span>
        </Link>
        <ul className="space-y-2 -mx-2">
          {keys.map((week, i) => (
            <li key={week}>
              <div className="stats w-full shadow overflow-x-hidden">
                <div className="stat">
                  <div className="stat-title">Semaine</div>
                  <div className="stat-value">{bottles[week].week}</div>
                  <div className="stat-desc text-base">
                    {format(bottles[week].start, 'dd/MM')} -{' '}
                    {format(bottles[week].end, 'dd/MM')}
                  </div>
                </div>

                <div className="stat">
                  <div className="stat-title">Total</div>
                  <div className="stat-value">{bottles[week].total}ml</div>
                  <div className="stat-desc text-base flex justify-between">
                    <span>{bottles[week].bottles.length} biberons</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
