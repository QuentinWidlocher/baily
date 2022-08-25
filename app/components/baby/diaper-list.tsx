import { Link } from '@remix-run/react'
import { parse, isSameDay } from 'date-fns'
import { Fragment } from 'react'
import { Diaper } from '~/services/diapers.server'
import {
  getRelativeDate,
  getDistanceFromNow,
  displayTime,
} from '~/services/time'

export type DiaperListProps = {
  babyId: string
  groupedDiapers: {
    [key: string]: {
      items: Diaper[]
    }
  }
}

export default function DiaperList({
  babyId,
  groupedDiapers,
}: DiaperListProps) {
  return (
    <ul className="flex-1 p-2 -mx-5 overflow-y-auto menu">
      {Object.keys(groupedDiapers).map((day) => (
        <Fragment key={day}>
          <li className="flex flex-row justify-between mx-3 mt-16 first-of-type:mt-0">
            <span className="p-1 hover:bg-transparent hover:cursor-default">
              {getRelativeDate(parse(day, 'yyyy-MM-dd', new Date()))}
            </span>
          </li>
          {groupedDiapers[day].items.map((diaper) => {
            let sameDay = isSameDay(diaper.time, new Date())
            return (
              <li key={diaper.id}>
                <Link
                  className={`stat ${!sameDay ? 'grid-cols-2' : ''}`}
                  to={`/baby/${babyId}/diaper/${diaper.id}`}
                >
                  <span className="stat-value text-lg text-ellipsis">
                    {diaper.description || 'Couche'}
                  </span>
                  <span
                    className={`stat-desc text-lg leading-tight ${
                      sameDay
                        ? 'flex justify-between'
                        : 'col-start-2 text-right'
                    }`}
                  >
                    {isSameDay(diaper.time, new Date()) ? (
                      <span>{getDistanceFromNow(diaper.time)}</span>
                    ) : null}
                    <span>{displayTime(diaper.time)}</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </Fragment>
      ))}
    </ul>
  )
}
