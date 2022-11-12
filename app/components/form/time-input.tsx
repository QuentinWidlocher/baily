import Input from './input'

type TimeInputProps = {
  name: string
  label?: string
  labelAlt?: string
  toggleVisibility?: boolean
  defaultValue?: Date
}

export default function TimeInput({
  toggleVisibility,
  defaultValue,
  ...props
}: TimeInputProps) {
  let [hours, minutes] = defaultValue?.toLocaleTimeString().split(':') ?? [
    undefined,
    undefined,
  ]

  return (
    <Input
      {...props}
      type="time"
      defaultValue={defaultValue ? `${hours}:${minutes}` : undefined}
    />
  )
}
