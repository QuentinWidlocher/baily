import { isSameDay, parse } from 'date-fns'
import { Fragment } from 'react'
import type { Diaper } from '~/services/diapers.server'
import {
  displayTime,
  getDistanceFromNow,
  getRelativeDate,
} from '~/services/time'
import LoadingItem from '../loading-item'

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
  let now = new Date()
  let yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  let shouldSpecifyTime = (time: Date) =>
    isSameDay(time, now) || isSameDay(time, yesterday)

  return (
    <ul className="flex-1 p-2 -mx-8 overflow-x-hidden overflow-y-auto shadow-inner flex-nowrap menu bg-base-300">
      {Object.keys(groupedDiapers).map((day) => (
        <Fragment key={day}>
          <li className="flex flex-row justify-between mx-3 mt-16 first-of-type:mt-0">
            <span className="p-1 hover:bg-transparent hover:cursor-default">
              {getRelativeDate(parse(day, 'yyyy-MM-dd', new Date()))}
            </span>
          </li>
          {groupedDiapers[day].items.map((diaper) => {
            let specifyTime = shouldSpecifyTime(diaper.time)

            return (
              <li key={diaper.id}>
                <LoadingItem
                  type="link"
                  className={`stat ${!specifyTime ? 'grid-cols-2' : ''}`}
                  to={`/baby/${babyId}/diaper/${diaper.id}`}
                >
                  <span className="stat-value text-ellipsis">
                    {diaper.description || 'Couche'}
                  </span>
                  <span
                    className={`stat-desc text-lg leading-tight ${
                      specifyTime
                        ? 'flex flex-wrap justify-between'
                        : 'col-start-2 text-right'
                    }`}
                  >
                    {specifyTime ? (
                      <span>{getDistanceFromNow(diaper.time)}</span>
                    ) : null}
                    <span>{displayTime(diaper.time)}</span>
                  </span>
                </LoadingItem>
              </li>
            )
          })}
        </Fragment>
      ))}
    </ul>
  )
}
