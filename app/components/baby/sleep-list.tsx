import { addMinutes, formatDuration, intervalToDuration, parse } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Fragment } from 'react'
import type { Sleep } from '~/services/sleeps.server'
import { displayTime, getRelativeDate } from '~/services/time'
import LoadingItem from '../loading-item'

export type SleepListProps = {
  babyId: string
  groupedSleeps: {
    [key: string]: {
      items: Sleep[]
      total: number
    }
  }
}

export default function SleepList({ babyId, groupedSleeps }: SleepListProps) {
  return (
    <ul className="flex-1 p-2 -mx-8 overflow-x-hidden overflow-y-auto shadow-inner flex-nowrap menu bg-base-300">
      {Object.keys(groupedSleeps).map((day) => {
        let sleeps = groupedSleeps[day]
        let now = new Date()
        let durationAsInterval = intervalToDuration({
          start: now,
          end: addMinutes(now, sleeps.total),
        })
        let hours = String(durationAsInterval.hours).padStart(2, '0')
        let minutes = String(durationAsInterval.minutes).padStart(2, '0')
        let totalInterval = `${hours}h${minutes}`

        return (
          <Fragment key={day}>
            <li className="flex flex-row justify-between mx-3 mt-16 first-of-type:mt-0">
              <span className="p-1 hover:bg-transparent hover:cursor-default">
                {getRelativeDate(parse(day, 'yyyy-MM-dd', new Date()))}
              </span>
              <span className="p-1 font-bold hover:bg-transparent hover:cursor-default">
                Total : {totalInterval}
              </span>
            </li>
            {sleeps.items.map((sleep) => {
              let durationRaw = intervalToDuration({
                start: sleep.start,
                end: sleep.end ?? new Date(),
              })

              let duration
              if (
                (!durationRaw.years || durationRaw.years == 0) &&
                (!durationRaw.months || durationRaw.months == 0) &&
                (!durationRaw.weeks || durationRaw.weeks == 0) &&
                (!durationRaw.days || durationRaw.days == 0) &&
                (!durationRaw.hours || durationRaw.hours == 0) &&
                (!durationRaw.minutes || durationRaw.minutes <= 0)
              ) {
                duration = "Moins d'une minute"
              } else {
                duration = formatDuration(durationRaw, {
                  locale: fr,
                  format: ['hours', 'minutes'],
                  delimiter: ' et ',
                })
              }

              return (
                <li key={sleep.id}>
                  <LoadingItem
                    type="link"
                    className="stat"
                    to={`/baby/${babyId}/sleep/${sleep.id}`}
                  >
                    <span className="text-2xl stat-value text-ellipsis">
                      {duration}
                    </span>
                    <span
                      className={`stat-desc text-lg leading-tight w-full flex flex-wrap justify-between`}
                    >
                      <span>
                        {sleep.description || ''} {!sleep.end && ' (en cours)'}
                      </span>
                      <span className="flex">
                        {sleep.end
                          ? `${displayTime(sleep.start)} - ${displayTime(
                              sleep.end,
                            )}`
                          : `Depuis ${displayTime(sleep.start)}`}
                      </span>
                    </span>
                  </LoadingItem>
                </li>
              )
            })}
          </Fragment>
        )
      })}
    </ul>
  )
}
