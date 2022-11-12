import { useState } from 'react'
import Input from './input'

export type SelectInputProps = {
  name: string
  label?: string
  labelAlt?: string
  defaultValue?: string

  options: string[]
  allowCustom?: boolean
}

export default function SelectInput({
  options,
  allowCustom,
  ...props
}: SelectInputProps) {
  let [customDescription, setCustomDescription] = useState(
    !allowCustom ||
      (!!props.defaultValue && !options.includes(props.defaultValue)),
  )

  let labelAlt

  if (allowCustom) {
    labelAlt = (
      <div className="tabs tabs-boxed">
        <button
          type="button"
          onClick={() => setCustomDescription(true)}
          className={`tab ${customDescription ? 'tab-active' : ''}`}
        >
          Personnelle
        </button>
        <button
          type="button"
          onClick={() => setCustomDescription(false)}
          className={`tab ${customDescription ? '' : 'tab-active'}`}
        >
          Habituelle
        </button>
      </div>
    )
  }

  if (customDescription) {
    return <Input {...props} labelAlt={labelAlt} />
  } else {
    return (
      <Input
        {...props}
        labelAlt={labelAlt}
        customInputTag={(field) => (
          <select
            {...field.getInputProps({ id: props.name })}
            className={`select bg-base-300 w-full ${
              field.error ? 'input-error' : ''
            }`}
            defaultValue={props.defaultValue ?? ''}
          >
            <option value="" disabled>
              Choisir
            </option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
      />
    )
  }
}
