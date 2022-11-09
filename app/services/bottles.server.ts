import { Timestamp, FieldValue } from 'firebase-admin/firestore'
import { firestore, getDataAndId } from './firebase.server'

export type BottleFromFirebase = {
  id: string
  time: Timestamp
  quantity: number
  babyId: string
}

export type Bottle = {
  id: string
  time: Date
  quantity: number
}

export function parseBottleFromFirebase(bottle: BottleFromFirebase): Bottle {
  return {
    id: bottle.id,
    time: bottle.time.toDate(),
    quantity: bottle.quantity,
  }
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

export async function getBottles(babyId: string, limit: number | null = 30) {
  let query = firestore
    .collection('bottles')
    .where('babyId', '==', babyId)
    .orderBy('time', 'desc')

  if (limit) {
    query = query.limit(limit)
  }

  const snapshot = await query.get()

  return snapshot.docs.map(bottle => {
    return parseBottleFromFirebase(getDataAndId(bottle) as BottleFromFirebase)
  }) as Bottle[]
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
  } as Partial<BottleFromFirebase>)

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
    } as Partial<BottleFromFirebase>)
}
