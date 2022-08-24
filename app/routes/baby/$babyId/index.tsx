import { ActionArgs, LoaderArgs, redirect } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { Plus } from 'iconoir-react'
import { useEffect } from 'react'
import invariant from 'tiny-invariant'
import BottleList from '~/components/baby/bottle-list'
import TitleBar from '~/components/baby/title-bar'
import { deleteBaby, getBabies, getBaby } from '~/services/firebase.server'
import { requireUserId } from '~/services/session.server'
import { superjson, useSuperLoaderData } from '~/services/superjson'
import { groupByTime } from '~/services/time'

export async function loader({ params, request }: LoaderArgs) {
  invariant(params.babyId, 'params.babyId is required')

  let uid = await requireUserId(request)

  let baby = await getBaby(params.babyId)
  let groupedBottles = groupByTime(baby.bottles)

  let babies = await getBabies(uid)

  return superjson({
    babyName: baby.name,
    babyId: baby.id,
    groupedBottles,
    babies,
  })
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.babyId, 'params.babyId is required')
  deleteBaby(params.babyId)
  return redirect('/babies')
}

export default function Index() {
  let { babyId, babyName, groupedBottles, babies } =
    useSuperLoaderData<typeof loader>()

  return (
    <section className="flex-1 card bg-base-200 w-full md:w-1/2 xl:w-1/4">
      <div className="overflow-x-hidden overflow-y-auto card-body">
        <TitleBar babyId={babyId} babyName={babyName} babies={babies} />
        <BottleList babyId={babyId} groupedBottles={groupedBottles} />
        <Link
          to={`/baby/${babyId}/bottle/new`}
          className="w-full mt-5 space-x-2 btn btn-primary"
        >
          <Plus />
          <span>Ajouter un biberon</span>
        </Link>
      </div>
    </section>
  )
}
