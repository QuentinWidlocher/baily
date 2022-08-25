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

  let body = <></>

  if (data.tab == 'bottles') {
    body = (
      <>
        {empty ? (
          <img
            className="md:p-20 my-auto dark:brightness-[0.7] dark:contrast-[1.3] dark:saturate-[1.3]"
            src="/undraw_add_notes_re_ln36.svg"
            alt="Illustration of a person adding notes on a wall"
          />
        ) : (
          <BottleList babyId={babyId} groupedBottles={data.groupedBottles} />
        )}
        <Link
          prefetch="render"
          to={`/baby/${babyId}/bottle/new`}
          className="w-full mt-5 space-x-2 btn btn-primary"
        >
          <Plus />
          <span>Ajouter un biberon</span>
        </Link>
      </>
    )
  } else {
    body = (
      <>
        {empty ? (
          <img
            className="md:p-20 my-auto dark:brightness-[0.7] dark:contrast-[1.3] dark:saturate-[1.3]"
            src="/undraw_add_notes_re_ln36.svg"
            alt="Illustration of a person adding notes on a wall"
          />
        ) : (
          <DiaperList babyId={babyId} groupedDiapers={data.groupedDiapers} />
        )}
        <Link
          prefetch="render"
          to={`/baby/${babyId}/diaper/new`}
          className="w-full mt-5 space-x-2 btn btn-primary"
        >
          <Plus />
          <span>Ajouter une couche</span>
        </Link>
      </>
    )
  }

  return (
    <section className="flex-1 card bg-base-200 w-full md:w-1/2 xl:w-1/4">
      <div className="overflow-x-hidden overflow-y-auto card-body">
        <TitleBar babyId={babyId} babyName={babyName} babies={babies} />
        {body}
      </div>
      <div className="card-actions">
        <div className="btm-nav md:btm-nav-sm relative bg-base-300">
          <Link
            className={data.tab == 'bottles' ? 'active' : ''}
            to="?tab=bottles"
          >
            Biberons
          </Link>
          <Link
            className={data.tab == 'diapers' ? 'active' : ''}
            to="?tab=diapers"
          >
            Couches
          </Link>
        </div>
      </div>
    </section>
  )
}
