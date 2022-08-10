import {
  format,
  formatDistanceToNow,
  formatDuration,
  formatRelative,
  intervalToDuration,
  isBefore,
  isSameDay,
  isSameMinute,
} from "date-fns";
import { fr } from "date-fns/locale";
import type { Bottle } from "./firebase.server";

export function groupByTime(bottles: Bottle[]) {
  return bottles.reduce((acc, bottle) => {
    const key = format(bottle.time, "yyyy-MM-dd");
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(bottle);
    return acc;
  }, {} as { [key: string]: Bottle[] });
}

export function getDistanceFromNow(date: Date) {
  let now = new Date()
  if (isSameMinute(date, now)) {
    return (
      "il y a " +
      formatDistanceToNow(date, { locale: fr, includeSeconds: true })
    );
  } else if (isSameDay(date, now) && isBefore(date, now)) {
    return (
      "il y a " +
      formatDuration(
        intervalToDuration({
          start: date,
          end: now,
        }),
        {
          locale: fr,
          format: ["hours", "minutes"],
          delimiter: " et ",
        }
      )
    );
  } else {
    return formatRelative(date, now, { locale: fr });
  }
}

export function dateToISOLikeButLocal(date: Date) {
  let offsetMs = date.getTimezoneOffset() * 60 * 1000;
  let msLocal = date.getTime() - offsetMs;
  let dateLocal = new Date(msLocal);
  let iso = dateLocal.toISOString();
  let isoLocal = iso.slice(0, 19);
  return isoLocal;
}

export function getRelativeDate(date: Date) {
  let relative = formatRelative(date, new Date(), { locale: fr }).split("à")[0];
  let [firstLetter, ...rest] = relative;
  return firstLetter.toUpperCase() + rest.join("");
}
