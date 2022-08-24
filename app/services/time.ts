import {
  format,
  formatDistanceToNow,
  formatDuration,
  formatRelative,
  intervalToDuration,
  isAfter,
  isBefore,
  isSameDay,
  differenceInMinutes,
  lastDayOfWeek,
  getWeek,
  startOfWeek,
  parse,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Bottle } from './firebase.server'

export function groupByTime(bottles: Bottle[]) {
  let grouped = bottles.reduce((acc, bottle) => {
    const key = format(bottle.time, 'yyyy-MM-dd')
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(bottle)
    return acc
  }, {} as { [key: string]: Bottle[] })

  return Object.keys(grouped).reduce((acc, key) => {
    return {
      ...acc,
      [key]: {
        bottles: grouped[key],
        total: grouped[key].reduce((acc, bottle) => acc + bottle.quantity, 0),
      },
    }
  }, {} as { [key: string]: { bottles: Bottle[]; total: number } })
}

export function groupByWeeks(bottles: Bottle[]) {
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
  console.log('keys', keys)

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

export function getDistanceFromNow(date: Date) {
  let now = new Date()
  if (Math.abs(differenceInMinutes(date, now)) <= 1) {
    return (
      'il y a ' +
      formatDistanceToNow(date, { locale: fr, includeSeconds: true })
    )
  } else if (isSameDay(date, now)) {
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
  let relative = formatRelative(date, new Date(), { locale: fr }).split('à')[0]
  let [firstLetter, ...rest] = relative
  return firstLetter.toUpperCase() + rest.join('')
}

export function getDuration(duration: number) {
  return formatDuration(
    { seconds: duration },
    { format: ['hours', 'minutes'], locale: fr, delimiter: ' et ' }
  )
}

export function displayTime(time: Date) {
  return format(time, 'HH:mm', { locale: fr })
}
