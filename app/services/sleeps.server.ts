import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { firestore, getDataAndId } from './firebase.server'

export type SleepFromFirebase = {
  id: string
  start: Timestamp
  end?: Timestamp
  description: string
  babyId: string
}

export type Sleep = {
  id: string
  start: Date
  end?: Date
  description?: string
}

export function parseSleepFromFirebase(sleep: SleepFromFirebase): Sleep {
  return {
    id: sleep.id,
    start: sleep.start.toDate(),
    end: sleep.end?.toDate(),
    description: sleep.description,
  }
}

export async function getSleep(id: string) {
  return parseSleepFromFirebase(
    (await firestore
      .collection('sleeps')
      .doc(id)
      .get()
      .then(getDataAndId)) as SleepFromFirebase
  )
}

export async function getSleeps(babyId: string, limit: number | null = 30) {
  let query = firestore
    .collection('sleeps')
    .where('babyId', '==', babyId)
    .orderBy('start', 'desc')

  if (limit) {
    query = query.limit(limit)
  }

  const snapshot = await query.get()

  return snapshot.docs.map(sleep => {
    return parseSleepFromFirebase(getDataAndId(sleep))
  }) as Sleep[]
}

export async function deleteSleep(sleepId: string, babyId: string) {
  let res = await firestore.collection('sleeps').doc(sleepId).get()

  await firestore
    .collection('babies')
    .doc(babyId)
    .update({
      sleeps: FieldValue.arrayRemove(res.ref),
    })

  await res.ref.delete()
}

export async function createSleep(babyId: string, sleep: Omit<Sleep, 'id'>) {
  let createdSleep = await firestore.collection('sleeps').add({
    description: sleep.description ?? null,
    start: Timestamp.fromDate(sleep.start),
    end: sleep.end ? Timestamp.fromDate(sleep.end) : null,
    babyId,
  } as Partial<SleepFromFirebase>)

  return firestore
    .collection('babies')
    .doc(babyId)
    .update({
      sleeps: FieldValue.arrayUnion(createdSleep),
    })
}

export function updateSleep(sleep: Sleep) {
  return firestore
    .collection('sleeps')
    .doc(sleep.id)
    .update({
      description: sleep.description ?? null,
      start: Timestamp.fromDate(sleep.start),
      end: sleep.end ? Timestamp.fromDate(sleep.end) : null,
    } as Partial<SleepFromFirebase>)
}
