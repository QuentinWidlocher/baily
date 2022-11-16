import type { PropsWithChildren } from 'react'

export default function FullPageCardLayout({
  children,
  actions,
}: PropsWithChildren<{ actions?: JSX.Element }>) {
  return (
    <section className="flex-1 w-full overflow-y-hidden card max-desktop:rounded-none bg-base-200 desktop:w-desktop desktop:shadow-xl">
      <div className="flex flex-col overflow-x-hidden overflow-y-auto card-body">
        {children}
      </div>
      {actions && <div className="-mt-5 card-actions">{actions}</div>}
    </section>
  )
}
