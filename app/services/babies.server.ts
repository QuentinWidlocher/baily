import { DocumentReference } from 'firebase-admin/firestore'
import {
  BottleFromFirebase,
  Bottle,
  parseBottleFromFirebase,
} from './bottles.server'
import {
  DiaperFromFirebase,
  Diaper,
  parseDiaperFromFirebase,
} from './diapers.server'
import { firestore, getDataAndId } from './firebase.server'

export type BabyFromFirebase = {
  id: string
  name: string
  bottles: BottleFromFirebase[]
  diapers: DiaperFromFirebase[]
}

export type Baby = {
  id: string
  name: string
  bottles: Bottle[]
  diapers: Diaper[]
}

export function parseBabyFromFirebase(baby: BabyFromFirebase): Baby {
  return {
    id: baby.id,
    name: baby.name,
    bottles: (baby.bottles ?? []).map(parseBottleFromFirebase),
    diapers: (baby.diapers ?? []).map(parseDiaperFromFirebase),
  }
}

export async function getBabies(userId: string) {
  const snapshot = await firestore
    .collection('babies')
    .where('userId', '==', userId)
    .get()

  return snapshot.docs.map(getDataAndId) as Baby[]
}

export async function getBaby(id: string, fetchAll = false) {
  return parseBabyFromFirebase(
    (await firestore
      .collection('babies')
      .doc(id)
      .get()
      .then(async (snapshot) => {
        let babyFromFb = getDataAndId<
          BabyFromFirebase & {
            bottles: DocumentReference[]
            diapers: DocumentReference[]
          }
        >(snapshot)

        let bottleRefs: DocumentReference<FirebaseFirestore.DocumentData>[] =
          babyFromFb.bottles ?? []

        if (!fetchAll) {
          bottleRefs = bottleRefs.slice(-30)
        }

        let bottles = await Promise.all(
          bottleRefs.map((b: DocumentReference) =>
            b.get().then((x) => getDataAndId<BottleFromFirebase>(x))
          )
        ).then((bottles) =>
          (bottles ?? []).sort((a, b) => b.time.seconds - a.time.seconds)
        )

        let diaperRefs: DocumentReference<FirebaseFirestore.DocumentData>[] =
          babyFromFb.diapers ?? []

        if (!fetchAll) {
          diaperRefs = diaperRefs.slice(-30)
        }

        let diapers = await Promise.all(
          diaperRefs.map((b: DocumentReference) =>
            b.get().then((x) => getDataAndId<DiaperFromFirebase>(x))
          )
        ).then((diapers) =>
          (diapers ?? []).sort((a, b) => b.time.seconds - a.time.seconds)
        )

        return {
          ...babyFromFb,
          bottles,
          diapers,
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
