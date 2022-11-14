import {
  differenceInMinutes,
  format,
  formatDistanceToNow,
  formatDuration,
  formatRelative,
  getWeek,
  intervalToDuration,
  isBefore,
  isSameDay, lastDayOfWeek,
  parse,
  startOfWeek
} from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Bottle } from './bottles.server'
import type { Sleep } from './sleeps.server'

export function getGroupByTimeKey<K extends string, T extends { [k in K]: Date }, U extends {}>(
  keyToGroupBy: K,
  items: T[],
  calculateByDay: (items: T[]) => U = (items) => ({} as U)
) {
  let grouped = items.reduce((acc, item) => {
    const key = format(item[keyToGroupBy], 'yyyy-MM-dd')
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(item)
    return acc
  }, {} as { [key: string]: T[] })

  return Object.keys(grouped).reduce((acc, key) => {
    return {
      ...acc,
      [key]: {
        items: grouped[key],
        ...calculateByDay(grouped[key]),
      },
    }
  }, {} as { [key: string]: { items: T[] } & U })
}

export function groupByTime<T extends { time: Date }, U extends {}>(
  items: T[],
  calculateByDay: (items: T[]) => U = (items) => ({} as U)
) {
  return getGroupByTimeKey<'time', T, U>('time', items, calculateByDay)
}
export function groupByStart<T extends { start: Date }, U extends {}>(
  items: T[],
  calculateByDay: (items: T[]) => U = (items) => ({} as U)
) {
  return getGroupByTimeKey<'start', T, U>('start', items, calculateByDay)
}

export function groupBottlesByWeeks(bottles: Bottle[]) {
  let grouped = bottles.reduce((acc, bottle) => {
    const key = format(startOfWeek(bottle.time, { locale: fr }), 'yyyy-MM-dd')
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(bottle)
    return acc
  }, {} as { [key: string]: Bottle[] })

  let keys = Object.keys(grouped).sort(
    (a, b) =>
      parse(b, 'yyyy-MM-dd', new Date()).getTime() -
      parse(a, 'yyyy-MM-dd', new Date()).getTime()
  )

  let formatted = keys.reduce(
    (acc, key) => {
      let parsedDate = parse(key, 'yyyy-MM-dd', new Date())
      let total = grouped[key].reduce((acc, bottle) => acc + bottle.quantity, 0)

      return {
        ...acc,
        [key]: {
          week: getWeek(parsedDate, { locale: fr }),
          start: parsedDate,
          end: lastDayOfWeek(parsedDate, { locale: fr }),
          bottles: grouped[key],
          total,
        },
      }
    },
    {} as {
      [key: string]: {
        bottles: Bottle[]
        total: number
        week: number
        start: Date
        end: Date
      }
    }
  )

  return [keys, formatted] as const
}

export function groupSleepsByWeeks(sleeps: Sleep[]) {
  let grouped = sleeps.reduce((acc, sleep) => {
    const key = format(startOfWeek(sleep.start, { locale: fr }), 'yyyy-MM-dd')
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(sleep)
    return acc
  }, {} as { [key: string]: Sleep[] })

  let keys = Object.keys(grouped).sort(
    (a, b) =>
      parse(b, 'yyyy-MM-dd', new Date()).getTime() -
      parse(a, 'yyyy-MM-dd', new Date()).getTime()
  )

  let formatted = keys.reduce(
    (acc, key) => {
      let parsedDate = parse(key, 'yyyy-MM-dd', new Date())
      let total = grouped[key].reduce((acc, sleep) => acc + differenceInMinutes(sleep.end ?? new Date(), sleep.start), 0)

      return {
        ...acc,
        [key]: {
          week: getWeek(parsedDate, { locale: fr }),
          start: parsedDate,
          end: lastDayOfWeek(parsedDate, { locale: fr }),
          sleeps: grouped[key],
          total,
        },
      }
    },
    {} as {
      [key: string]: {
        sleeps: Sleep[]
        total: number
        week: number
        start: Date
        end: Date
      }
    }
  )

  return [keys, formatted] as const
}



export function getDistanceFromNow(date: Date) {
  let now = new Date()
  let yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (Math.abs(differenceInMinutes(date, now)) <= 1) {
    return (
      'il y a ' +
      formatDistanceToNow(date, { locale: fr, includeSeconds: true })
    )
  } else if (isSameDay(date, now) || isSameDay(date, yesterday)) {
    let options = {
      locale: fr,
      format: ['hours', 'minutes'],
      delimiter: ' et ',
    }

    if (isBefore(date, now)) {
      return (
        'il y a ' +
        formatDuration(
          intervalToDuration({
            start: date,
            end: now,
          }),
          options
        )
      )
    } else {
      return (
        'dans ' +
        formatDuration(
          intervalToDuration({
            start: now,
            end: date,
          }),
          options
        )
      )
    }
  }
}

export function dateToISOLikeButLocal(date: Date) {
  let offsetMs =
    (process.env.NODE_ENV == 'production' ? -120 : date.getTimezoneOffset()) *
    60 *
    1000
  let msLocal = date.getTime() - offsetMs
  let dateLocal = new Date(msLocal)
  let iso = dateLocal.toISOString()
  let isoLocal = iso.slice(0, 19)
  return isoLocal
}

export function getRelativeDate(date: Date) {
  let relative = formatRelative(date, new Date(), { locale: fr }).split(' à')[0]
  let [firstLetter, ...rest] = relative
  return firstLetter.toUpperCase() + rest.join('')
}

export function displayTime(time: Date) {
  return format(time, 'HH:mm', { locale: fr })
}
