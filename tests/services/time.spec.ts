import { format } from 'date-fns'
import { describe, it, expect, beforeEach } from 'vitest'
import { Bottle } from '../../app/services/bottles.server'
import {
  dateToISOLikeButLocal,
  displayTime,
  getDistanceFromNow,
  getRelativeDate,
  groupByTime,
  groupBottlesByWeeks,
} from '../../app/services/time'

describe('time', () => {
  let now: Date = new Date()
  let yesterday: Date = new Date()
  let february23rd2022: Date = new Date()
  let february23rd2022UTC: Date
  let march1st2022: Date = new Date()

  beforeEach(() => {
    now = new Date()

    yesterday = new Date()
    yesterday.setDate(now.getDate() - 1)

    february23rd2022 = new Date('2022-02-23T12:30:00.000')
    february23rd2022UTC = new Date('2022-02-23T12:30:00.000Z')

    march1st2022 = new Date('2022-03-01T12:30:00.000')
  })

  it('should display time', () => {
    expect(displayTime(february23rd2022)).toBe('12:30')
    expect(displayTime(february23rd2022UTC)).toBe('13:30')
  })

  it('should format relative date', () => {
    expect(getRelativeDate(february23rd2022)).toBe('23/02/2022')
    expect(getRelativeDate(now)).toBe('Aujourd’hui')
    expect(getRelativeDate(yesterday)).toBe('Hier')
  })

  it('should give a local iso datetime', () => {
    expect(dateToISOLikeButLocal(february23rd2022)).toBe('2022-02-23T12:30:00')
    expect(dateToISOLikeButLocal(february23rd2022UTC)).toBe(
      '2022-02-23T13:30:00'
    )
  })

  it('should format distance from now (only for today)', () => {
    expect(getDistanceFromNow(now)).toBe('il y a moins de 5 secondes')
    now.setSeconds(now.getSeconds() - 32)
    expect(getDistanceFromNow(now)).toBe('il y a 30 secondes')
    now.setHours(now.getHours() - 1)
    expect(getDistanceFromNow(now)).toBe('il y a 1 heure')
    now.setMinutes(now.getMinutes() - 23)
    expect(getDistanceFromNow(now)).toBe('il y a 1 heure et 23 minutes')
    now.setHours(now.getHours() + 3)
    expect(getDistanceFromNow(now)).toBe('dans 1 heure et 36 minutes')
    now.setMinutes(now.getMinutes() + 23)
    expect(getDistanceFromNow(now)).toBe('dans 1 heure et 59 minutes')

    expect(getDistanceFromNow(yesterday)).toBe(undefined)
  })

  it('should group bottles by days', () => {
    let bottles: Bottle[] = [
      {
        id: '1',
        quantity: 1,
        time: now,
      },
      {
        id: '2',
        quantity: 2,
        time: now,
      },
      {
        id: '3',
        quantity: 3,
        time: now,
      },
      {
        id: '4',
        quantity: 4,
        time: yesterday,
      },
      {
        id: '5',
        quantity: 5,
        time: now,
      },
      {
        id: '6',
        quantity: 23,
        time: february23rd2022,
      },
      {
        id: '7',
        quantity: 7,
        time: yesterday,
      },
    ]

    let expected = {
      [format(now, 'yyyy-MM-dd')]: {
        items: [
          {
            id: '1',
            quantity: 1,
            time: now,
          },
          {
            id: '2',
            quantity: 2,
            time: now,
          },
          {
            id: '3',
            quantity: 3,
            time: now,
          },
          {
            id: '5',
            quantity: 5,
            time: now,
          },
        ],
        total: 11,
      },
      [format(yesterday, 'yyyy-MM-dd')]: {
        items: [
          {
            id: '4',
            quantity: 4,
            time: yesterday,
          },
          {
            id: '7',
            quantity: 7,
            time: yesterday,
          },
        ],
        total: 11,
      },
      '2022-02-23': {
        items: [
          {
            id: '6',
            quantity: 23,
            time: february23rd2022,
          },
        ],
        total: 23,
      },
    }

    expect(
      groupByTime(bottles, (bottlesOfDay) => ({
        total: bottlesOfDay.reduce(
          (total, bottle) => total + bottle.quantity,
          0
        ),
      }))
    ).toEqual(expected)
  })

  it('should group bottles by weeks', () => {
    let bottles: Bottle[] = [
      {
        id: '1',
        quantity: 1,
        time: march1st2022,
      },
      {
        id: '2',
        quantity: 2,
        time: february23rd2022,
      },
      {
        id: '3',
        quantity: 3,
        time: march1st2022,
      },
      {
        id: '4',
        quantity: 4,
        time: march1st2022,
      },
      {
        id: '5',
        quantity: 5,
        time: february23rd2022,
      },
      {
        id: '6',
        quantity: 23,
        time: february23rd2022,
      },
    ]

    let expected: ReturnType<typeof groupBottlesByWeeks> = [
      ['2022-02-28', '2022-02-21'],
      {
        '2022-02-21': {
          bottles: [
            {
              id: '2',
              quantity: 2,
              time: february23rd2022,
            },
            {
              id: '5',
              quantity: 5,
              time: february23rd2022,
            },
            {
              id: '6',
              quantity: 23,
              time: february23rd2022,
            },
          ],
          total: 30,
          week: 8,
          start: new Date('2022-02-21T00:00:00.000'),
          end: new Date('2022-02-27T00:00:00.000'),
        },
        '2022-02-28': {
          bottles: [
            {
              id: '1',
              quantity: 1,
              time: march1st2022,
            },
            {
              id: '3',
              quantity: 3,
              time: march1st2022,
            },
            {
              id: '4',
              quantity: 4,
              time: march1st2022,
            },
          ],
          total: 8,
          week: 9,
          start: new Date('2022-02-28T00:00:00.000'),
          end: new Date('2022-03-06T00:00:00.000'),
        },
      },
    ]

    expect(groupBottlesByWeeks(bottles)).toEqual(expected)
  })
})
