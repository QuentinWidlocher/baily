import { RefreshCircular } from 'iconoir-react'
import { useIsSubmitting } from 'remix-validated-form'

interface SubmitButtonProps {
  label: string
  submittingLabel?: string
  icon?: JSX.Element
  className?: string
  disabled?: boolean
}

export default function SubmitButton(props: SubmitButtonProps) {
  const isSubmitting = useIsSubmitting()

  let submittingLabel = props.submittingLabel ?? props.label
  let className = props.className ?? 'btn btn-primary'

  return (
    <button
      type="submit"
      disabled={props.disabled || isSubmitting}
      className={`${className} space-x-2`}
    >
      {isSubmitting ? (
        <RefreshCircular className="animate-spin" />
      ) : (
        props.icon ?? null
      )}
      <span>{isSubmitting ? `${submittingLabel}...` : props.label}</span>
    </button>
  )
}
