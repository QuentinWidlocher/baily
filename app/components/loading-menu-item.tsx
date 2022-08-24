import { Link } from '@remix-run/react'
import { RefreshCircular } from 'iconoir-react'
import { useState } from 'react'

export type LoadingMenuItemProps = {
  label: string
  icon?: JSX.Element
  className?: string
} & ({ type: 'link'; to: string } | { type: 'button'; onClick: () => void })

export default function LoadingMenuItem(props: LoadingMenuItemProps) {
  let [loading, setLoading] = useState(false)

  if (props.type == 'link') {
    return (
      <li>
        <Link
          className={`space-x-2 text-left ${loading ? 'animate-pulse' : ''} ${
            props.className ?? ''
          }`}
          to={props.to}
          onClick={() => setLoading(true)}
        >
          {loading && props.icon ? (
            <RefreshCircular className="animate-spin" />
          ) : (
            props.icon
          )}
          <span>{props.label}</span>
        </Link>
      </li>
    )
  } else {
    return (
      <li>
        <button
          type="button"
          className={`space-x-2 text-left ${loading ? 'animate-pulse' : ''} ${
            props.className ?? ''
          }`}
          onClick={() => {
            setLoading(true)
            props.onClick()
          }}
          disabled={loading}
        >
          {loading && props.icon ? (
            <RefreshCircular className="animate-spin" />
          ) : (
            props.icon
          )}
          <span>{props.label}</span>
        </button>
      </li>
    )
  }
}
