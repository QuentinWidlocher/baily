import type { PropsWithChildren } from 'react'

export default function BottomCardLayout({ children }: PropsWithChildren<{}>) {
  return (
    <section className="mt-auto mx-2 card max-desktop:rounded-b-none desktop:mb-auto bg-base-200 desktop:w-desktop desktop:shadow-xl">
      <div className="card-body">{children}</div>
    </section>
  )
}
