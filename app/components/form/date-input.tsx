import Input from './input'
import { dateToISOLikeButLocal } from '~/services/time'

type DateInputProps = {
  name: string
  label?: string
  labelAlt?: string
  toggleVisibility?: boolean
  defaultValue?: Date
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export default function DateInput({
  toggleVisibility,
  defaultValue,
  ...props
}: DateInputProps) {
  return (
    <Input
      {...props}
      type="date"
      defaultValue={
        defaultValue
          ? dateToISOLikeButLocal(defaultValue).split('T')[0]
          : undefined
      }
    />
  )
}
