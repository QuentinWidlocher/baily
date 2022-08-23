import { Link } from '@remix-run/react'
import {
  NavArrowDown,
  MoreHoriz,
  RefreshCircular,
  RefreshDouble,
  StatsSquareUp,
  LogOut,
} from 'iconoir-react'
import { useState } from 'react'
import { Baby } from '~/services/firebase.server'

export type TitleBarProps = {
  babyId: string
  babyName: string
  babies: Baby[]
}

export default function TitleBar({ babyId, babyName, babies }: TitleBarProps) {
  let [loading, setLoading] = useState({
    reloading: false,
    navToStats: false,
    loggingOut: false,
  })

  return (
    <div className="flex justify-between mb-5 card-title">
      <div className="flex space-x-2">
        <h1 className="text-xl hidden md:block">Les biberons de </h1>
        <div className="dropdown">
          <label className="flex items-center" tabIndex={0}>
            <span>{babyName}</span> <NavArrowDown className="text-sm" />
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-72"
          >
            {babies.map((baby) => (
              <li key={baby.id}>
                <Link to={`../${baby.id}`}>{baby.name}</Link>
              </li>
            ))}
            <li>
              <Link to={`../new`}>Nouveau bébé 🥳</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="m-1 btn btn-square btn-ghost">
          <MoreHoriz />
        </label>
        <ul
          tabIndex={0}
          className="p-2 shadow dropdown-content menu bg-base-100 rounded-box w-72"
        >
          <li>
            <button
              className={`space-x-2 text-left ${
                loading.reloading ? 'animate-pulse' : ''
              }`}
              onClick={() => {
                setLoading({ ...loading, reloading: true })
                window.location.reload()
              }}
              disabled={loading.reloading}
            >
              {loading.reloading ? (
                <RefreshCircular className="animate-spin" />
              ) : (
                <RefreshDouble />
              )}
              <span>Rafraîchir la page</span>
            </button>
          </li>
          <li>
            <Link
              className={`space-x-2 text-left ${
                loading.navToStats ? 'animate-pulse' : ''
              }`}
              to={`/baby/${babyId}/stats`}
              onClick={() => setLoading({ ...loading, navToStats: true })}
            >
              {loading.navToStats ? (
                <RefreshCircular className="animate-spin" />
              ) : (
                <StatsSquareUp />
              )}
              <span>Voir l'évolution</span>
            </Link>
          </li>
          <li>
            <Link
              className={`space-x-2 text-left ${
                loading.loggingOut ? 'animate-pulse' : ''
              }`}
              to={`/logout`}
              onClick={() => setLoading({ ...loading, loggingOut: true })}
            >
              {loading.loggingOut ? (
                <RefreshCircular className="animate-spin" />
              ) : (
                <LogOut />
              )}
              <span>Déconnexion</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
