import { Link } from '@remix-run/react'
import { LoaderArgs } from '@remix-run/server-runtime'
import { format } from 'date-fns'
import { NavArrowLeft } from 'iconoir-react'
import invariant from 'tiny-invariant'
import { getBaby } from '~/services/babies.server'
import { superjson, useSuperLoaderData } from '~/services/superjson'
import { groupByWeeks } from '~/services/time'

export async function loader({ params }: LoaderArgs) {
  invariant(params.babyId, 'params.id is required')
  let baby = await getBaby(params.babyId, true)

  return superjson({ data: groupByWeeks(baby.bottles), babyName: baby.name })
}

export default function StatsPage() {
  let {
    data: [keys, bottles],
    babyName,
  } = useSuperLoaderData<typeof loader>()

  return (
    <section className="card flex-1 bg-base-200 w-full md:w-96">
      <div className="card-body overflow-y-auto overflow-x-hidden">
        <Link to="./.." className="btn btn-ghost mb-5 space-x-2" title="Retour">
          <NavArrowLeft />
          <span>Retour</span>
        </Link>
        {keys.length > 0 ? (
          <ul className="space-y-2 -mx-2">
            {keys.map((week, i) => (
              <li key={week}>
                <div className="stats grid grid-cols-2 w-full shadow overflow-x-hidden">
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
        ) : (
          <div className="my-auto space-y-5">
            <p className="text-center">
              Aucune donnée n'est disponible pour {babyName}
            </p>
            <img
              className="md:p-20 dark:brightness-[0.7] dark:contrast-[1.3] dark:saturate-[1.3]"
              src="/undraw_add_notes_re_ln36.svg"
              alt="Illustration of a person adding notes on a wall"
            />
          </div>
        )}
      </div>
    </section>
  )
}
