import type { FieldProps } from 'remix-validated-form'
import { useField } from 'remix-validated-form'

type InputProps = {
  name: string
  label?: string
  labelAlt?: string | JSX.Element
  type?: React.HTMLInputTypeAttribute
  groupPrepend?: JSX.Element
  groupAppend?: JSX.Element
  defaultValue?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void

  customInputTag?: (field: FieldProps) => JSX.Element
}

export default function Input({
  name,
  label,
  type = 'text',
  value,
  defaultValue,
  onChange,
  customInputTag,
  ...props
}: InputProps) {
  let field = useField(name)
  let isInputGroup = props.groupAppend || props.groupPrepend

  let inputTag

  if (customInputTag) {
    inputTag = customInputTag(field)
  } else {
    if (isInputGroup) {
      inputTag = (
        <label className="input-group">
          {props.groupPrepend ?? null}
          <input
            {...field.getInputProps({ id: name, type, onChange, value })}
            defaultValue={defaultValue}
            className={`w-full input ${field.error ? 'input-error' : ''}`}
          />
          {props.groupAppend ?? null}
        </label>
      )
    } else {
      inputTag = (
        <input
          {...field.getInputProps({ id: name, type, onChange, value })}
          defaultValue={defaultValue}
          className={`w-full input ${field.error ? 'input-error' : ''}`}
        />
      )
    }
  }

  let labelAlt = null

  if (props.labelAlt) {
    if (typeof props.labelAlt == 'string') {
      labelAlt = <span className="label-text-alt">{props.labelAlt}</span>
    } else {
      labelAlt = props.labelAlt
    }
  }

  return (
    <div className="w-full form-control">
      {label ? (
        <label htmlFor={name} className="label">
          <span className="label-text">{label}</span>
          {labelAlt}
        </label>
      ) : null}
      {inputTag}
      <label className="label">
        <span className="label-text-alt text-error">
          {field.error ? field.error : null}
        </span>
      </label>
    </div>
  )
}
