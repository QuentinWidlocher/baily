import { Form, Link } from '@remix-run/react'
import {
  NavArrowDown,
  MoreHoriz,
  RefreshCircular,
  RefreshDouble,
  StatsSquareUp,
  LogOut,
  RemoveEmpty,
  Plus,
} from 'iconoir-react'
import { FormEvent, useRef, useState } from 'react'
import { Baby } from '~/services/firebase.server'
import LoadingMenuItem from '../loading-menu-item'

export type TitleBarProps = {
  babyId: string
  babyName: string
  babies: Baby[]
}

export default function TitleBar({ babyId, babyName, babies }: TitleBarProps) {
  let [confirm, setConfirm] = useState(false)

  function onDeleteClick(e: FormEvent<HTMLFormElement>) {
    if (!confirm) {
      e.preventDefault()
      setConfirm(true)
      setTimeout(() => setConfirm(false), 3000)
    }
  }

  return (
    <Form method="post" onSubmit={(e) => onDeleteClick(e)}>
      <div className="flex justify-between mb-5 card-title">
        <div className="flex space-x-2">
          <h1 className="text-xl hidden md:block">Les biberons de </h1>
          <div className="dropdown">
            <label className="flex items-center space-x-2" tabIndex={0}>
              <span>{babyName}</span> <NavArrowDown className="text-sm" />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-72"
            >
              {babies.map((baby) => (
                <li key={baby.id}>
                  <Link
                    className={baby.id == babyId ? 'active' : ''}
                    to={`../${baby.id}`}
                  >
                    {baby.name}
                  </Link>
                </li>
              ))}
              <li></li>
              <li>
                <Link to={`../new`}>
                  <Plus />
                  <span>Nouveau bébé !</span>
                </Link>
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
            <LoadingMenuItem
              type="button"
              onClick={() => window.location.reload()}
              label="Rafraîchir la page"
              icon={<RefreshDouble />}
            />
            <LoadingMenuItem
              type="link"
              to={`/baby/${babyId}/stats`}
              label="Voir l'évolution"
              icon={<StatsSquareUp />}
            />
            <LoadingMenuItem
              type="link"
              to={`/logout`}
              label="Déconnexion"
              icon={<LogOut />}
            />
            <li></li>
            <li
              className={`tooltip tooltip-error ${
                confirm ? 'tooltip-open' : ''
              }`}
              data-tip="La suppression est définitive, vous perdez l'accès aux biberons"
            >
              <button
                className={`w-full ${
                  confirm
                    ? 'text-error-content bg-error'
                    : 'text-error focus:bg-error focus:text-error-content'
                }`}
                title={confirm ? 'Confirmer la suppression' : 'Supprimer'}
              >
                <RemoveEmpty />
                <span>{confirm ? 'Confirmer' : `Supprimer ${babyName}`}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </Form>
  )
}
