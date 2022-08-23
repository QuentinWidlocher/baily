import { Link } from '@remix-run/react'
import { parse, isSameDay } from 'date-fns'
import { Fragment } from 'react'
import { Bottle } from '~/services/firebase.server'
import {
  getRelativeDate,
  getDistanceFromNow,
  displayTime,
} from '~/services/time'

export type BottleListProps = {
  babyId: string
  groupedBottles: {
    [key: string]: {
      bottles: Bottle[]
      total: number
    }
  }
}

export default function BottleList({
  babyId,
  groupedBottles,
}: BottleListProps) {
  console.log('BottleList render')
  return (
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
  )
}
