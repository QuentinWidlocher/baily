import { Link } from '@remix-run/react'
import type { LoaderArgs } from '@remix-run/server-runtime'
import { format } from 'date-fns'
import { NavArrowLeft } from 'iconoir-react'
import invariant from 'tiny-invariant'
import FullPageCardLayout from '~/components/layouts/fullpage-card'
import { getBaby } from '~/services/babies.server'
import { getBottles } from '~/services/bottles.server'
import { superjson, useSuperLoaderData } from '~/services/superjson'
import { groupBottlesByWeeks } from '~/services/time'

export async function loader({ params }: LoaderArgs) {
  invariant(params.babyId, 'params.id is required')
  let [baby, bottles] = await Promise.all([
    getBaby(params.babyId),
    getBottles(params.babyId, null),
  ])

  return superjson({ data: groupBottlesByWeeks(bottles), babyName: baby.name })
}

export default function StatsPage() {
  let {
    data: [keys, bottles],
    babyName,
  } = useSuperLoaderData<typeof loader>()

  return (
    <FullPageCardLayout>
      <Link
        to="./../..?tab=bottles"
        className="mb-5 space-x-2 btn btn-ghost"
        title="Retour"
      >
        <NavArrowLeft />
        <span>Retour</span>
      </Link>
      {keys.length > 0 ? (
        <ul className="flex-1 -mx-2 space-y-2 overflow-y-auto">
          {keys.map((week, i) => (
            <li key={week}>
              <div className="grid w-full grid-cols-2 overflow-x-hidden shadow stats">
                <div className="stat">
                  <div className="stat-title">Semaine</div>
                  <div className="stat-value">{bottles[week].week}</div>
                  <div className="text-base stat-desc">
                    {format(bottles[week].start, 'dd/MM')} -{' '}
                    {format(bottles[week].end, 'dd/MM')}
                  </div>
                </div>

                <div className="stat">
                  <div className="stat-title">Total</div>
                  <div className="stat-value">{bottles[week].total}ml</div>
                  <div className="flex justify-between text-base stat-desc">
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
            className="mx-auto p-10 w-96 dark:brightness-[0.7] dark:contrast-[1.3] dark:saturate-[1.3]"
            src="/undraw_add_notes_re_ln36.svg"
            alt="Illustration of a person adding notes on a wall"
          />
        </div>
      )}
    </FullPageCardLayout>
  )
}
