import { Link } from '@remix-run/react'
import type { LoaderArgs } from '@remix-run/server-runtime'
import { addMinutes, format, intervalToDuration } from 'date-fns'
import { NavArrowLeft } from 'iconoir-react'
import invariant from 'tiny-invariant'
import FullPageCardLayout from '~/components/layouts/fullpage-card'
import { getBaby } from '~/services/babies.server'
import { getSleeps } from '~/services/sleeps.server'
import { superjson, useSuperLoaderData } from '~/services/superjson'
import { groupSleepsByWeeks } from '~/services/time'

export async function loader({ params }: LoaderArgs) {
  invariant(params.babyId, 'params.id is required')
  let [baby, sleeps] = await Promise.all([
    getBaby(params.babyId),
    getSleeps(params.babyId, null),
  ])

  return superjson({ data: groupSleepsByWeeks(sleeps), babyName: baby.name })
}

export default function StatsPage() {
  let {
    data: [keys, sleeps],
    babyName,
  } = useSuperLoaderData<typeof loader>()

  return (
    <FullPageCardLayout>
      <Link
        to="./../..?tab=sleeps"
        className="mb-5 space-x-2 btn btn-ghost"
        title="Retour"
      >
        <NavArrowLeft />
        <span>Retour</span>
      </Link>
      {keys.length > 0 ? (
        <ul className="flex-1 -mx-2 space-y-2 overflow-y-auto">
          {keys.map((week, i) => {
            let weekData = sleeps[week]
            let now = new Date()
            let durationAsInterval = intervalToDuration({
              start: now,
              end: addMinutes(now, weekData.total),
            })
            let hours =
              (durationAsInterval.days ?? 0) * 24 +
              (durationAsInterval.hours ?? 0)
            let totalInterval = `${String(hours).padStart(2, '0')}:${String(
              durationAsInterval.minutes,
            ).padStart(2, '0')}`

            return (
              <li key={week}>
                <div className="grid w-full grid-cols-2 overflow-x-hidden shadow stats">
                  <div className="stat">
                    <div className="stat-title">Semaine</div>
                    <div className="stat-value">{weekData.week}</div>
                    <div className="text-base stat-desc">
                      {format(weekData.start, 'dd/MM')} -{' '}
                      {format(weekData.end, 'dd/MM')}
                    </div>
                  </div>

                  <div className="stat">
                    <div className="stat-title">Total</div>
                    <div className="stat-value">{totalInterval}</div>
                    <div className="flex justify-between text-base stat-desc">
                      <span>{weekData.sleeps.length} dodos</span>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
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
