import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { firestore, getDataAndId } from './firebase.server'

export type DiaperFromFirebase = {
  id: string
  time: Timestamp
  description: string
  babyId: string
}

export type Diaper = {
  id: string
  time: Date
  description?: string
}

export function parseDiaperFromFirebase(diaper: DiaperFromFirebase): Diaper {
  return {
    id: diaper.id,
    time: diaper.time.toDate(),
    description: diaper.description,
  }
}

export async function getDiaper(id: string) {
  return parseDiaperFromFirebase(
    (await firestore
      .collection('diapers')
      .doc(id)
      .get()
      .then(getDataAndId)) as DiaperFromFirebase
  )
}

export async function getDiapers(babyId: string, limit: number | null = 30) {
  let query = firestore
    .collection('diapers')
    .where('babyId', '==', babyId)
    .orderBy('time', 'desc')

  if (limit) {
    query = query.limit(limit)
  }

  const snapshot = await query.get()

  return snapshot.docs.map(diaper => {
    return parseDiaperFromFirebase(getDataAndId(diaper))
  }) as Diaper[]
}

export async function deleteDiaper(diaperId: string, babyId: string) {
  let res = await firestore.collection('diapers').doc(diaperId).get()

  await firestore
    .collection('babies')
    .doc(babyId)
    .update({
      diapers: FieldValue.arrayRemove(res.ref),
    })

  await res.ref.delete()
}

export async function createDiaper(babyId: string, diaper: Omit<Diaper, 'id'>) {
  let createdDiaper = await firestore.collection('diapers').add({
    description: diaper.description ?? '',
    time: Timestamp.fromDate(diaper.time),
    babyId,
  } as Partial<DiaperFromFirebase>)

  return firestore
    .collection('babies')
    .doc(babyId)
    .update({
      diapers: FieldValue.arrayUnion(createdDiaper),
    })
}

export function updateDiaper(diaper: Diaper) {
  return firestore
    .collection('diapers')
    .doc(diaper.id)
    .update({
      description: diaper.description,
      time: Timestamp.fromDate(diaper.time),
    } as Partial<DiaperFromFirebase>)
}
