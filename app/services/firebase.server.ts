import { credential } from 'firebase-admin'
import type { App as AdminApp } from 'firebase-admin/app'
import { initializeApp as initializeAdmin } from 'firebase-admin/app'
import type { Auth } from 'firebase-admin/auth';
import { getAuth as getAdminAuth } from 'firebase-admin/auth'
import { sendPasswordResetEmail as sendPasswordResetEmailFirebase } from 'firebase/auth'
import type { DocumentSnapshot } from 'firebase-admin/firestore'
import { getFirestore } from 'firebase-admin/firestore'
import type { FirebaseApp } from 'firebase/app';
import { initializeApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth'

export let firebaseAdmin: AdminApp
export let firebaseApp: FirebaseApp
export let firebaseAdminAuth: Auth
export let firestore: FirebaseFirestore.Firestore

declare global {
  var _firebaseAdmin: AdminApp | undefined
  var _firebaseApp: FirebaseApp | undefined
  var _firebaseAdminAuth: Auth | undefined
  var _firestore: FirebaseFirestore.Firestore | undefined
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === 'production') {
  firebaseAdmin = initializeAdmin({
    credential: credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/_/gm, '\n'),
    }),
  })

  firebaseApp = initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  })

  firebaseAdminAuth = getAdminAuth(firebaseAdmin)
  firestore = getFirestore(firebaseAdmin)
} else if (process.env.NODE_ENV == 'development') {
  if (
    !global._firebaseAdmin ||
    !global._firebaseApp ||
    !global._firebaseAdminAuth ||
    !global._firestore
  ) {
    global._firebaseAdmin = initializeAdmin({
      credential: credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/_/gm, '\n'),
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    })

    global._firebaseApp = initializeApp({
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    })

    global._firebaseAdminAuth = getAdminAuth(global._firebaseAdmin)
    global._firestore = getFirestore(global._firebaseAdmin)
  }

  firebaseAdmin = global._firebaseAdmin
  firebaseApp = global._firebaseApp
  firebaseAdminAuth = global._firebaseAdminAuth
  firestore = global._firestore
}

export function getDataAndId<T extends { id: string }>(
  doc: DocumentSnapshot
): T {
  return {
    id: doc.id,
    ...doc.data(),
  } as T
}

export async function authenticate(email: string, password: string) {
  let { user } = await signInWithEmailAndPassword(getAuth(), email, password)
  let result = await user.getIdTokenResult()
  return result.token
}

export async function createUser(email: string, password: string) {
  let { user } = await createUserWithEmailAndPassword(
    getAuth(),
    email,
    password
  )

  return user
}

export function sendPasswordResetEmail(email: string) {
  return sendPasswordResetEmailFirebase(getAuth(), email)
}
