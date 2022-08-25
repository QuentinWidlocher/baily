import { Outlet } from '@remix-run/react'

export default function BabyLayout() {
  return (
    <main className="p-0 md:py-5 flex flex-col h-screen overflow-hidden items-center">
      <Outlet></Outlet>
    </main>
  )
}
