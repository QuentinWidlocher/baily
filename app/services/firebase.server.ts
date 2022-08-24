import type { App as AdminApp } from 'firebase-admin/app'
import { initializeApp as initializeAdmin } from 'firebase-admin/app'
import { credential } from 'firebase-admin'
import type {
  DocumentReference,
  DocumentSnapshot,
} from 'firebase-admin/firestore'
import { Auth, getAuth as getAdminAuth } from 'firebase-admin/auth'
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore'
import { initializeApp, FirebaseApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth'

let firebaseAdmin: AdminApp
let firebaseApp: FirebaseApp
export let firebaseAdminAuth: Auth
let firestore: FirebaseFirestore.Firestore

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
} else {
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

type BottleFromFirebase = {
  id: string
  time: Timestamp
  quantity: number
}

type BabyFromFirebase = {
  id: string
  name: string
  bottles: BottleFromFirebase[]
}

export type Bottle = {
  id: string
  time: Date
  quantity: number
}

export type Baby = {
  id: string
  name: string
  bottles: Bottle[]
}

function parseBottleFromFirebase(bottle: BottleFromFirebase): Bottle {
  return {
    id: bottle.id,
    time: bottle.time.toDate(),
    quantity: bottle.quantity,
  }
}

function parseBabyFromFirebase(baby: BabyFromFirebase): Baby {
  console.log(baby)
  return {
    id: baby.id,
    name: baby.name,
    bottles: (baby.bottles ?? []).map(parseBottleFromFirebase),
  }
}

function getDataAndId<T extends { id: string }>(doc: DocumentSnapshot): T {
  return {
    id: doc.id,
    ...doc.data(),
  } as T
}

export async function getBabies(userId: string) {
  const snapshot = await firestore
    .collection('babies')
    .where('userId', '==', userId)
    .get()

  return snapshot.docs.map(getDataAndId) as Baby[]
}

export async function getBaby(id: string, allBottles = false) {
  return parseBabyFromFirebase(
    (await firestore
      .collection('babies')
      .doc(id)
      .get()
      .then(async (snapshot) => {
        let babyFromFb = getDataAndId<
          BabyFromFirebase & { bottles: DocumentReference[] }
        >(snapshot)

        let bottleRefs: DocumentReference<FirebaseFirestore.DocumentData>[] =
          babyFromFb.bottles ?? []

        if (!allBottles) {
          bottleRefs = bottleRefs.slice(-30)
        }

        let bottles = await Promise.all(
          bottleRefs.map((b: DocumentReference) =>
            b.get().then((x) => getDataAndId<BottleFromFirebase>(x))
          )
        ).then((bottles) =>
          (bottles ?? []).sort((a, b) => b.time.seconds - a.time.seconds)
        )

        bottles.forEach((b) => {
          console.log(
            'Bottle',
            b.id,
            'timezone offset',
            b.time.toDate().getTimezoneOffset()
          )
        })

        return {
          ...babyFromFb,
          bottles,
        }
      })) as BabyFromFirebase
  )
}

export async function createBaby(userId: string, name: string) {
  const baby = await firestore.collection('babies').add({
    name,
    userId,
  })

  return baby.id
}

export async function deleteBaby(id: string) {
  await Promise.all([
    firestore.collection('babies').doc(id).delete(),
    firestore
      .collection('bottles')
      .where('babyId', '==', id)
      .get()
      .then(async (snapshot) => {
        await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()))
      }),
  ])
}

export async function getBottle(id: string) {
  return parseBottleFromFirebase(
    (await firestore
      .collection('bottles')
      .doc(id)
      .get()
      .then(getDataAndId)) as BottleFromFirebase
  )
}

export async function deleteBottle(bottleId: string, babyId: string) {
  let res = await firestore.collection('bottles').doc(bottleId).get()

  await firestore
    .collection('babies')
    .doc(babyId)
    .update({
      bottles: FieldValue.arrayRemove(res.ref),
    })

  await res.ref.delete()
}

export async function createBottle(babyId: string, bottle: Omit<Bottle, 'id'>) {
  let createdBottle = await firestore.collection('bottles').add({
    time: Timestamp.fromDate(bottle.time),
    quantity: bottle.quantity,
    babyId,
  })

  return firestore
    .collection('babies')
    .doc(babyId)
    .update({
      bottles: FieldValue.arrayUnion(createdBottle),
    })
}

export function updateBottle(bottle: Bottle) {
  return firestore
    .collection('bottles')
    .doc(bottle.id)
    .update({
      time: Timestamp.fromDate(bottle.time),
      quantity: bottle.quantity,
    })
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
