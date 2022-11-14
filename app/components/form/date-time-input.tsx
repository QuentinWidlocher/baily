import { format, formatISO, isToday, set } from 'date-fns'
import { useState } from 'react'
import { useField } from 'remix-validated-form'
import DateInput from '~/components/form/date-input'
import TimeInput from '~/components/form/time-input'

interface DateTimeInputProps {
  name: string
  label?: string
  withSetNowButton?: boolean
  defaultValue?: Date
  onTimeChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onDateChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export default function DateTimeInput({
  name,
  label,
  withSetNowButton,
  defaultValue,
  onTimeChange,
  onDateChange,
}: DateTimeInputProps) {
  let field = useField(name)
  let [dateTime, setDateTime] = useState(defaultValue)

  return (
    <div className="form-control">
      {label ? (
        <label htmlFor={name} className="label">
          <span className="label-text">{label}</span>
          {withSetNowButton && (!dateTime || !isToday(dateTime)) ? (
            <button
              onClick={() => setDateTime(new Date())}
              type="button"
              className="btn btn-primary btn-sm"
            >
              Maintenant
            </button>
          ) : undefined}
        </label>
      ) : null}
      <div className="flex gap-2">
        <div className="w-4/6">
          <DateInput
            name=""
            defaultValue={defaultValue}
            value={dateTime ? format(dateTime, 'yyyy-MM-dd') : undefined}
            onChange={(e) => {
              setDateTime((dt) =>
                dt
                  ? set(dt, {
                      date: e.target.valueAsDate?.getDate() ?? 0,
                      month: e.target.valueAsDate?.getMonth() ?? 0,
                      year: e.target.valueAsDate?.getFullYear() ?? 0,
                    })
                  : undefined,
              )
              onDateChange?.(e)
            }}
          />
        </div>

        <div className="w-2/6">
          <TimeInput
            name=""
            value={dateTime ? format(dateTime, 'HH:mm') : undefined}
            onChange={(e) => {
              setDateTime((dt) => {
                return dt
                  ? set(dt, {
                      hours: e.target.value
                        ? Number(e.target.value.split(':')[0])
                        : 0,
                      minutes: e.target.value
                        ? Number(e.target.value.split(':')[1])
                        : 0,
                    })
                  : undefined
              })

              onTimeChange?.(e)
            }}
          />
        </div>
        <input
          {...field.getInputProps({
            id: name,
            value: dateTime ? formatISO(dateTime) : undefined,
          })}
          hidden
          readOnly
        />
      </div>
      <label className="label -mt-3">
        <span className="label-text-alt text-error">
          {field.error ? field.error : null}
        </span>
      </label>
    </div>
  )
}
