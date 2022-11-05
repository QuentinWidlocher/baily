import type { PropsWithChildren } from 'react'
import { useEffect, useState } from 'react'

export type ConfirmButtonProps = PropsWithChildren<{
  onClick?: () => void
  onConfirm?: () => void
  formRef: React.RefObject<HTMLFormElement>
}> &
  React.ButtonHTMLAttributes<HTMLButtonElement>

export default function ConfirmFormButton({
  onClick,
  onConfirm,
  formRef,
  children,
  ...btnProps
}: ConfirmButtonProps) {
  let [confirm, setConfirm] = useState(false)

  function onRemoteFormSubmit(e: SubmitEvent) {
    onClick?.()
    if (!confirm) {
      e.preventDefault()
      setConfirm(true)
      setTimeout(() => setConfirm(false), 3000)
    } else {
      onConfirm?.()
    }
  }

  useEffect(() => {
    formRef.current?.addEventListener('submit', onRemoteFormSubmit)

    return () => {
      formRef.current?.removeEventListener('submit', onRemoteFormSubmit)
    }
  }, [])

  return (
    <button
      type="submit"
      {...btnProps}
      className={`btn ${
        confirm ? 'btn-error' : 'btn-square btn-ghost text-error'
      }`}
      title={confirm ? 'Confirmer la suppression' : 'Supprimer'}
    >
      {confirm ? <span>Confirmer</span> : children}
    </button>
  )
}
