import { useField } from 'remix-validated-form'

type InputProps = {
  name: string
  label: string
  labelAlt?: string
  type?: React.HTMLInputTypeAttribute
  groupPrepend?: JSX.Element
  groupAppend?: JSX.Element
}

export default function Input({
  name,
  label,
  labelAlt,
  type = 'text',
  ...props
}: InputProps) {
  let field = useField(name)
  let isInputGroup = props.groupAppend || props.groupPrepend

  let inputTag

  if (isInputGroup) {
    inputTag = (
      <label className="input-group">
        {props.groupPrepend ?? null}
        <input
          {...field.getInputProps({ id: name, type })}
          className={`w-full input ${field.error ? 'input-error' : ''}`}
        />
        {props.groupAppend ?? null}
      </label>
    )
  } else {
    inputTag = (
      <input
        {...field.getInputProps({ id: name, type })}
        className={`w-full input ${field.error ? 'input-error' : ''}`}
      />
    )
  }

  return (
    <div className="w-full form-control">
      <label htmlFor={name} className="label">
        <span className="label-text">{label}</span>
        {labelAlt ? <span className="label-text-alt">{labelAlt}</span> : null}
      </label>
      {inputTag}
      <label className="label">
        <span className="label-text-alt text-error">
          {field.error ? field.error : null}
        </span>
      </label>
    </div>
  )
}
