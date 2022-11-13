import { format } from 'date-fns'
import DateInput from '~/components/form/date-input'
import TimeInput from '~/components/form/time-input'

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
  name,
  label,
  labelAlt,
  defaultValue,
  value,
  onTimeChange,
  onDateChange,
}: DateTimeInputProps) {
  return (
    <div className="form-control">
      {label ? (
        <label htmlFor={name} className="label">
          <span className="label-text">{label}</span>
          {labelAlt ? <span className="label-text-alt">{labelAlt}</span> : null}
        </label>
      ) : null}
      <div className="flex gap-2">
        <div className="w-4/6">
          <DateInput
            name={`${name}.date`}
            defaultValue={defaultValue}
            value={value ? format(value, 'yyyy-MM-dd') : undefined}
            onChange={onDateChange}
          />
        </div>

        <div className="w-2/6">
          <TimeInput
            name={`${name}.time`}
            defaultValue={defaultValue}
            value={value ? format(value, 'HH:mm') : undefined}
            onChange={onTimeChange}
          />
        </div>
      </div>
    </div>
  )
}
