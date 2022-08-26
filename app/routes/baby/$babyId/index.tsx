import { ActionArgs, LoaderArgs, redirect } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { Plus } from 'iconoir-react'
import invariant from 'tiny-invariant'
import BottleList from '~/components/baby/bottle-list'
import DiaperList from '~/components/baby/diaper-list'
import TitleBar from '~/components/baby/title-bar'
import { deleteBaby, getBabies, getBaby } from '~/services/babies.server'
import { requireUserId } from '~/services/session.server'
import { superjson, useSuperLoaderData } from '~/services/superjson'
import { groupByDay } from '~/services/time'

const tabs = ['bottles', 'diapers'] as const
type Tab = typeof tabs[number]

function assertTab(tab: string): tab is Tab {
  return tabs.includes(tab as Tab)
}

export async function loader({ params, request }: LoaderArgs) {
  invariant(params.babyId, 'params.babyId is required')

  let url = new URL(request.url)
  let tab = url.searchParams.get('tab') ?? 'bottles'

  invariant(assertTab(tab), 'tab is invalid')

  let [baby, babies] = await Promise.all([
    getBaby(params.babyId),
    requireUserId(request).then(getBabies),
  ])

  if (tab == 'bottles') {
    let groupedBottles = groupByDay(baby.bottles, (bottlesOfDay) => ({
      total: bottlesOfDay.reduce((acc, item) => acc + item.quantity, 0),
    }))

    return superjson({
      tab,
      babyName: baby.name,
      babyId: baby.id,
      empty: baby.bottles.length <= 0,
      groupedBottles,
      babies,
    })
  } else {
    let groupedDiapers = groupByDay(baby.diapers)

    return superjson({
      tab,
      babyName: baby.name,
      babyId: baby.id,
      empty: baby.diapers.length <= 0,
      groupedDiapers,
      babies,
    })
  }
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.babyId, 'params.babyId is required')
  deleteBaby(params.babyId)
  return redirect('/babies')
}

export default function Index() {
  let data = useSuperLoaderData<typeof loader>()
  let { babyId, babyName, babies, empty } = data

  let emptyList = (
    <div className="flex-1 flex -mx-8 p-20 shadow-inner bg-base-300">
      <img
        className="m-auto dark:brightness-[0.7] dark:contrast-[1.3] dark:saturate-[1.3]"
        src="/undraw_add_notes_re_ln36.svg"
        alt="Illustration of a person adding notes on a wall"
      />
    </div>
  )
  let body = emptyList
  let action = <></>

  if (data.tab == 'bottles') {
    if (!empty) {
      body = <BottleList babyId={babyId} groupedBottles={data.groupedBottles} />
    }

    action = (
      <Link
        prefetch="render"
        to={`/baby/${babyId}/bottle/new`}
        className="w-full space-x-2 btn btn-primary rounded-none"
      >
        <Plus />
        <span>Ajouter un biberon</span>
      </Link>
    )
  } else {
    if (!empty) {
      body = <DiaperList babyId={babyId} groupedDiapers={data.groupedDiapers} />
    }

    action = (
      <Link
        prefetch="render"
        to={`/baby/${babyId}/diaper/new`}
        className="w-full space-x-2 btn btn-primary rounded-none"
      >
        <Plus />
        <span>Ajouter une couche</span>
      </Link>
    )
  }

  return (
    <section className="flex-1 card bg-base-200 w-full md:w-1/2 xl:w-1/4">
      <div className="overflow-x-hidden overflow-y-auto card-body">
        <TitleBar
          babyId={babyId}
          babyName={babyName}
          babies={babies}
          tab={data.tab}
        />
        {body}
      </div>
      <div className="card-actions -mt-5">
        {action}
        <div className="btm-nav md:btm-nav-sm mt-1 relative bg-base-200">
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
        </div>
      </div>
    </section>
  )
}
