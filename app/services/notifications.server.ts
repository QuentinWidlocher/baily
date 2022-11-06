import type { Timestamp } from 'firebase-admin/firestore'
import { firestore, getDataAndId } from './firebase.server'

export type NotificationFromFirebase = {
  id: string,
  date: Timestamp,
  title: string,
  description: string,
}

export type Notification = {
  id: string,
  date: Date,
  title: string,
  description: string,
}

export function parseNotificationFromFirebase(notification: NotificationFromFirebase): Notification {
  return {
    id: notification.id,
    date: notification.date.toDate(),
    title: notification.title,
    description: notification.description,
  }
}

export async function getNotifications() {
  let notificationsFromFb = await firestore.collection('notifications').orderBy('date', 'desc').get()
  return notificationsFromFb.docs.map(notification => {
    return parseNotificationFromFirebase(getDataAndId(notification))
  })
}

export async function hasNewNotification(currentKnownNotificationId: string | null) {
  if (!currentKnownNotificationId) {
    return true
  }

  let lastNotificationId = await firestore.collection('notifications').select('id').orderBy('date').limitToLast(1).get()
  return lastNotificationId.docs[0].id !== currentKnownNotificationId
}