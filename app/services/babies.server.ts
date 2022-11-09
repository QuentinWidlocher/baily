import { firestore, getDataAndId } from './firebase.server';

export type BabyFromFirebase = {
  id: string
  name: string
}

export type Baby = {
  id: string
  name: string
}

export function parseBabyFromFirebase(baby: BabyFromFirebase): Baby {
  return {
    id: baby.id,
    name: baby.name,
  }
}

export async function getBabies(userId: string) {
  const snapshot = await firestore
    .collection('babies')
    .where('userId', '==', userId)
    .select('id', 'name')
    .get()

  return snapshot.docs.map(baby => {
    return parseBabyFromFirebase(getDataAndId(baby) as BabyFromFirebase)
  }) as Baby[]
}

export async function getBaby(id: string) {
  return parseBabyFromFirebase(
    (await firestore
      .collection('babies')
      .doc(id)
      .get()
      .then(getDataAndId)) as BabyFromFirebase
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
