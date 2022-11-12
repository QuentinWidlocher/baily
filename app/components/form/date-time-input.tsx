import DateInput from '~/components/form/date-input'
import TimeInput from '~/components/form/time-input'

interface DateTimeInputProps {
  name: string
  label?: string
  labelAlt?: string
  defaultValue?: Date
}

export default function DateTimeInput({
  name,
  label,
  labelAlt,
  defaultValue,
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
          <DateInput name={`${name}.date`} defaultValue={defaultValue} />
        </div>

        <div className="w-2/6">
          <TimeInput name={`${name}.time`} defaultValue={defaultValue} />
        </div>
      </div>
    </div>
  )
}
