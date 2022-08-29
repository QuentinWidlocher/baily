import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loader } from '../../routes/babies'
import * as babies from '~/services/babies.server'
import * as session from '~/services/session.server'

describe('babies route', () => {
  let requireUserIdSpy = vi
    .spyOn(session, 'requireUserId')
    .mockImplementation(async () => '1')

  let getBabiesSpy = vi.spyOn(babies, 'getBabies')

  let babyList = [
    {
      id: '1',
      name: 'Baby 1',
      bottles: [],
      diapers: [],
    },
    {
      id: '2',
      name: 'Baby 2',
      bottles: [],
      diapers: [],
    },
  ]

  it('should return baby list', async () => {
    getBabiesSpy.mockImplementationOnce(async (userId) => babyList)

    expect(
      await loader({
        request: new Request('http://localhost/babies'),
        context: {},
        params: {},
      })
    ).toEqual(babyList)

    expect(requireUserIdSpy).toHaveBeenCalled()
  })

  it('should redirect when one baby', async () => {
    getBabiesSpy.mockImplementationOnce(async (userId) => [babyList[0]])

    await expect(
      loader({
        request: new Request('http://localhost/babies'),
        context: {},
        params: {},
      })
    ).rejects.toThrowErrorMatchingSnapshot()

    expect(requireUserIdSpy).toHaveBeenCalled()
  })

  it('should redirect when no baby', async () => {
    getBabiesSpy.mockImplementationOnce(async (userId) => [])

    await expect(
      loader({
        request: new Request('http://localhost/babies'),
        context: {},
        params: {},
      })
    ).rejects.toThrowErrorMatchingSnapshot()

    expect(requireUserIdSpy).toHaveBeenCalled()
  })
})
