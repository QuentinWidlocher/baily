import { describe, expect, it, vi } from 'vitest'
import { loader } from '~/routes/index'
import * as session from '~/services/session.server'

describe('index route', () => {
  let getUserIdSpy = vi.spyOn(session, 'getUserId')

  it('should redirect to list if logged in', async () => {
    getUserIdSpy.mockImplementation(async () => '1')

    let response = await loader({
      request: new Request('http://localhost/'),
      context: {},
      params: {},
    })

    expect(response).toBeDefined()

    expect(response?.status).toEqual(302)
    expect(response?.headers.get('location')).toEqual('/babies')
  })

  it('should display home when not logged in', async () => {
    getUserIdSpy.mockImplementation(async () => null)

    let response = await loader({
      request: new Request('http://localhost/'),
      context: {},
      params: {},
    })

    expect(response).toBeNull()
  })
})
