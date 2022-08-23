import { createCookieSessionStorage } from '@remix-run/node'
import { redirect } from '@remix-run/server-runtime'
import { firebaseAdminAuth } from './firebase.server'

const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days

const storage = createCookieSessionStorage({
  cookie: {
    name: 'b-plus-plus',
    secure: process.env.NODE_ENV === 'production',
    secrets: [process.env.FIREBASE_API_KEY!],
    sameSite: 'lax',
    path: '/',
    maxAge: expiresIn,
    httpOnly: true,
  },
})

export async function createUserSession(idToken: string, redirectTo = '/') {
  const session = await storage.getSession()
  session.set(
    'token',
    await firebaseAdminAuth.createSessionCookie(idToken, { expiresIn })
  )
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

export async function getUserSession(request: Request) {
  return storage.getSession(request.headers.get('Cookie'))
}

export async function getUserId(request: Request) {
  try {
    const sessionCookie = (await getUserSession(request)) ?? ''
    let { uid } = await firebaseAdminAuth.verifySessionCookie(
      sessionCookie.get('token'),
      true
    )
    return uid
  } catch (err) {
    return null
  }
}

export async function requireUserId(request: Request) {
  let uid = getUserId(request)
  if (!uid) {
    throw redirect('/login')
  } else {
    return uid
  }
}

export async function logout(request: Request) {
  const session = await getUserSession(request)
  return redirect('/', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  })
}
