import { initializeApp, App } from "firebase-admin/app";
import { credential } from "firebase-admin";
import {
  DocumentReference,
  DocumentSnapshot,
  getFirestore,
  Timestamp,
  FieldValue,
} from "firebase-admin/firestore";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { utcToZonedTimeWithOptions } from "date-fns-tz/fp";

let firebaseApp: App;
export let firestore: FirebaseFirestore.Firestore;

declare global {
  var _firebaseApp: App | undefined;
  var _firestore: FirebaseFirestore.Firestore | undefined;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === "production") {
  firebaseApp = initializeApp({
    credential: credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\_/gm, "\n"),
    }),
  });

  firestore = getFirestore(firebaseApp);
} else {
  if (!global._firebaseApp) {
    global._firebaseApp = initializeApp({
      credential: credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\_/gm, "\n"),
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    global._firestore = getFirestore(global._firebaseApp);
  }
  firebaseApp = global._firebaseApp;
  firestore = global._firestore!;
}

type BottleFromFirebase = {
  id: string;
  time: Timestamp;
  quantity: number;
};

type BabyFromFirebase = {
  id: string;
  name: string;
  bottles: BottleFromFirebase[];
};

export type Bottle = {
  id: string;
  time: Date;
  quantity: number;
};

export type Baby = {
  id: string;
  name: string;
  bottles: Bottle[];
};

function parseBottleFromFirebase(bottle: BottleFromFirebase): Bottle {
  return {
    id: bottle.id,
    time: bottle.time.toDate(),
    quantity: bottle.quantity,
  };
}

function parseBabyFromFirebase(baby: BabyFromFirebase): Baby {
  console.log(baby);
  return {
    id: baby.id,
    name: baby.name,
    bottles: (baby.bottles ?? []).map(parseBottleFromFirebase),
  };
}

function getDataAndId<T>(doc: DocumentSnapshot): T {
  return {
    id: doc.id,
    ...doc.data(),
  } as T;
}

export async function getBaby(id: string) {
  return parseBabyFromFirebase(
    (await firestore
      .collection("babies")
      .doc(id)
      .get()
      .then(async (snapshot) => {
        let babyFromFb = getDataAndId<
          BabyFromFirebase & { bottles: DocumentReference[] }
        >(snapshot);

        let bottles = await Promise.all(
          (babyFromFb.bottles ?? []).map((b: DocumentReference) =>
            b.get().then((x) => getDataAndId<BottleFromFirebase>(x))
          )
        ).then((bottles) =>
          (bottles ?? []).sort((a, b) => b.time.seconds - a.time.seconds)
        );

        return {
          ...babyFromFb,
          bottles,
        };
      })) as BabyFromFirebase
  );
}

export async function getBottle(id: string) {
  return parseBottleFromFirebase(
    (await firestore
      .collection("bottles")
      .doc(id)
      .get()
      .then(getDataAndId)) as BottleFromFirebase
  );
}

export async function deleteBottle(bottleId: string, babyId: string) {
  let res = await firestore.collection("bottles").doc(bottleId).get();

  await firestore
    .collection("babies")
    .doc(babyId)
    .update({
      bottles: FieldValue.arrayRemove(res.ref),
    });

  await res.ref.delete();
}

export async function createBottle(babyId: string, bottle: Omit<Bottle, "id">) {
  let createdBottle = await firestore.collection("bottles").add({
    time: Timestamp.fromDate(bottle.time),
    quantity: bottle.quantity,
  });

  return firestore
    .collection("babies")
    .doc(babyId)
    .update({
      bottles: FieldValue.arrayUnion(createdBottle),
    });
}

export function updateBottle(bottle: Bottle) {
  return firestore
    .collection("bottles")
    .doc(bottle.id)
    .update({
      time: Timestamp.fromDate(bottle.time),
      quantity: bottle.quantity,
    });
}
