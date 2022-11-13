import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { differenceInMinutes } from 'date-fns'
import { Plus } from 'iconoir-react'
import invariant from 'tiny-invariant'
import BottleList from '~/components/baby/bottle-list'
import DiaperList from '~/components/baby/diaper-list'
import SleepList from '~/components/baby/sleep-list'
import TitleBar from '~/components/baby/title-bar'
import LoadingItem from '~/components/loading-item'
import { deleteBaby, getBabies, getBaby } from '~/services/babies.server'
import { getBottles } from '~/services/bottles.server'
import { getDiapers } from '~/services/diapers.server'
import { hasNewNotification } from '~/services/notifications.server'
import { getLastNotificationId, requireUserId } from '~/services/session.server'
import { getSleeps } from '~/services/sleeps.server'
import { superjson, useSuperLoaderData } from '~/services/superjson'
import { groupByStart, groupByTime } from '~/services/time'

const tabs = ['bottles', 'diapers', 'sleeps'] as const
type Tab = typeof tabs[number]

function assertTab(tab: string): tab is Tab {
  return tabs.includes(tab as Tab)
}

export async function loader({ params, request }: LoaderArgs) {
  invariant(params.babyId, 'params.babyId is required')

  let url = new URL(request.url)
  let tab = url.searchParams.get('tab') ?? 'bottles'

  invariant(assertTab(tab), 'tab is invalid')

  let [baby, babies, newNotifications] = await Promise.all([
    getBaby(params.babyId),
    requireUserId(request).then(getBabies),
    getLastNotificationId(request).then(hasNewNotification),
  ])

  if (tab == 'bottles') {
    let bottles = await getBottles(params.babyId)

    let groupedBottles = groupByTime(bottles, (bottlesOfDay) => ({
      total: bottlesOfDay.reduce((acc, item) => acc + item.quantity, 0),
    }))

    return superjson({
      tab,
      babyName: baby.name,
      babyId: baby.id,
      empty: bottles.length <= 0,
      groupedBottles,
      babies,
      newNotifications,
    })
  } else if (tab == 'diapers') {
    let diapers = await getDiapers(params.babyId)

    let groupedDiapers = groupByTime(diapers)

    return superjson({
      tab,
      babyName: baby.name,
      babyId: baby.id,
      empty: diapers.length <= 0,
      groupedDiapers,
      babies,
      newNotifications,
    })
  } else {
    let sleeps = await getSleeps(params.babyId)
    let now = new Date()

    let groupedSleeps = groupByStart(sleeps, (sleepsOfDay) => ({
      total: sleepsOfDay.reduce(
        (acc, item) => acc + differenceInMinutes(item.end ?? now, item.start),
        0,
      ),
    }))

    return superjson({
      tab,
      babyName: baby.name,
      babyId: baby.id,
      empty: sleeps.length <= 0,
      groupedSleeps,
      babies,
      newNotifications,
    })
  }
}

export async function action({ params }: ActionArgs) {
  invariant(params.babyId, 'params.babyId is required')
  deleteBaby(params.babyId)
  return redirect('/babies')
}

export default function Index() {
  let data = useSuperLoaderData<typeof loader>()
  let { babyId, babyName, babies, empty, newNotifications } = data

  let body: JSX.Element
  let action: JSX.Element

  if (data.tab == 'bottles') {
    if (!empty) {
      body = <BottleList babyId={babyId} groupedBottles={data.groupedBottles} />
    } else {
      body = (
        <div className="flex flex-1 p-10 -mx-8 shadow-inner bg-base-300">
          <img
            className="m-auto"
            src="/empty-bottle.svg"
            alt="Illustration of a sad personified empty baby bottle"
          />
        </div>
      )
    }

    action = (
      <LoadingItem
        type="link"
        to={`/baby/${babyId}/bottle/new`}
        className="w-full space-x-2 rounded-none btn btn-primary"
        icon={<Plus />}
        label="Ajouter un biberon"
      />
    )
  } else if (data.tab == 'diapers') {
    if (!empty) {
      body = <DiaperList babyId={babyId} groupedDiapers={data.groupedDiapers} />
    } else {
      body = (
        <div className="flex flex-1 p-20 -mx-8 shadow-inner bg-base-300">
          <img
            className="m-auto dark:brightness-[0.7] dark:contrast-[1.3] dark:saturate-[1.3]"
            src="/undraw_add_notes_re_ln36.svg"
            alt="Illustration of a person adding notes on a wall"
          />
        </div>
      )
    }

    action = (
      <LoadingItem
        type="link"
        to={`/baby/${babyId}/diaper/new`}
        className="w-full space-x-2 rounded-none btn btn-primary"
        icon={<Plus />}
        label="Ajouter une couche"
      />
    )
  } else {
    if (!empty) {
      body = <SleepList babyId={babyId} groupedSleeps={data.groupedSleeps} />
    } else {
      body = (
        <div className="flex flex-1 p-20 -mx-8 shadow-inner bg-base-300">
          <img
            className="m-auto dark:brightness-[0.7] dark:contrast-[1.3] dark:saturate-[1.3]"
            src="/undraw_add_notes_re_ln36.svg"
            alt="Illustration of a person adding notes on a wall"
          />
        </div>
      )
    }

    action = (
      <LoadingItem
        type="link"
        to={`/baby/${babyId}/sleep/new`}
        className="w-full space-x-2 rounded-none btn btn-primary"
        icon={<Plus />}
        label="Ajouter un dodo"
      />
    )
  }

  return (
    <section className="flex-1 w-full overflow-y-hidden card max-sm:rounded-none bg-base-200 md:w-96 xl:w-1/4">
      <div className="flex flex-col overflow-x-hidden overflow-y-auto card-body">
        <TitleBar
          babyId={babyId}
          babyName={babyName}
          babies={babies}
          tab={data.tab}
          hasNewNotifications={newNotifications}
        />
        {body}
      </div>
      <div className="-mt-5 card-actions">
        {action}
        <div className="relative mt-1 btm-nav md:btm-nav-sm bg-base-200">
          <Link
            className={`focus:bg-primary focus:text-primary-content hover:bg-base-300 transition-colors ${
              data.tab == 'bottles' ? 'active !text-primary !bg-base-300' : ''
            }`}
            to="?tab=bottles"
          >
            Biberons
          </Link>
          <Link
            className={`focus:bg-primary focus:text-primary-content hover:bg-base-300 transition-colors ${
              data.tab == 'diapers' ? 'active !text-primary !bg-base-300' : ''
            }`}
            to="?tab=diapers"
          >
            Couches
          </Link>
          <Link
            className={`focus:bg-primary focus:text-primary-content hover:bg-base-300 transition-colors ${
              data.tab == 'sleeps' ? 'active !text-primary !bg-base-300' : ''
            }`}
            to="?tab=sleeps"
          >
            Dodos
          </Link>
        </div>
      </div>
    </section>
  )
}
