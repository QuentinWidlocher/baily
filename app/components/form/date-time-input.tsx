import { formatISO } from 'date-fns'
import Input from './input'

interface DateTimeInputProps {
  name: string
  label?: string
  labelAlt?: string | JSX.Element
  defaultValue?: Date
  value?: Date
  onTimeChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onDateChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export default function DateTimeInput({
  defaultValue,
  value,
  ...props
}: DateTimeInputProps) {
  return (
    <>
      <Input
        {...props}
        type="datetime"
        defaultValue={defaultValue ? formatISO(defaultValue) : undefined}
      />
    </>
  )
}
