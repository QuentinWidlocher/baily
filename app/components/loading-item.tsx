import { Link } from '@remix-run/react'
import { RemixLinkProps } from '@remix-run/react/dist/components'
import { RefreshCircular } from 'iconoir-react'
import { ReactNode, useState } from 'react'

export type LoadingItemProps = {
  className?: string
} & (
  | ({
      type: 'link'
      onClick?: React.MouseEventHandler<HTMLAnchorElement>
    } & RemixLinkProps)
  | ({ type: 'button' } & React.ButtonHTMLAttributes<HTMLButtonElement>)
) &
  (
    | {
        children: ReactNode
      }
    | { label: string; icon?: JSX.Element }
  )

export default function LoadingItem(props: LoadingItemProps) {
  let [loading, setLoading] = useState(false)

  let body = <></>

  if ('children' in props) {
    body = <>{props.children}</>
  } else if ('label' in props) {
    body = (
      <>
        {loading && props.icon ? (
          <RefreshCircular className="animate-spin" />
        ) : (
          props.icon
        )}
        <span>{props.label}</span>
      </>
    )
  }

  if (props.type == 'link') {
    return (
      <Link
        {...props}
        className={`space-x-2 ${loading ? 'animate-pulse' : ''} ${
          props.className ?? ''
        }`}
        onClick={(e) => {
          setLoading(true)
          props.onClick?.(e)
        }}
      >
        {body}
      </Link>
    )
  } else {
    return (
      <button
        {...props}
        type="button"
        className={`space-x-2 ${loading ? 'animate-pulse' : ''} ${
          props.className ?? ''
        }`}
        onClick={(e) => {
          setLoading(true)
          props.onClick?.(e)
        }}
        disabled={loading}
      >
        {body}
      </button>
    )
  }
}
