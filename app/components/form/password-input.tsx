import { useField } from 'remix-validated-form'

type PasswordInputProps = {
  name: string
  label: string
}

export default function PasswordInput({ name, label }: PasswordInputProps) {
  let field = useField(name)
  return (
    <div className="w-full form-control">
      <label htmlFor={name} className="label">
        <span className="label-text">{label}</span>
      </label>
      <input
        {...field.getInputProps({ id: name, type: 'password' })}
        className={`w-full input ${field.error ? 'input-error' : ''}`}
      />
      <label className="label">
        <span className="label-text-alt text-error">
          {field.error ? field.error : null}
        </span>
      </label>
    </div>
  )
}
