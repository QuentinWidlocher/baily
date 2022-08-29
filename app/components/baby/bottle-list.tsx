import { isSameDay, parse } from 'date-fns'
import { Fragment } from 'react'
import { Bottle } from '~/services/bottles.server'
import {
  displayTime,
  getDistanceFromNow,
  getRelativeDate,
} from '~/services/time'
import LoadingItem from '../loading-item'

export type BottleListProps = {
  babyId: string
  groupedBottles: {
    [key: string]: {
      items: Bottle[]
      total: number
    }
  }
}

export default function BottleList({
  babyId,
  groupedBottles,
}: BottleListProps) {
  return (
    <ul className="flex-1 p-2 -mx-8 shadow-inner overflow-y-auto menu bg-base-300">
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
          {groupedBottles[day].items.map((bottle) => {
            let sameDay = isSameDay(bottle.time, new Date())
            return (
              <li key={bottle.id}>
                <LoadingItem
                  type="link"
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
                </LoadingItem>
              </li>
            )
          })}
        </Fragment>
      ))}
    </ul>
  )
}
