import type { ComponentProps } from "react";

type TextFieldProps = Omit<ComponentProps<"input">, "id"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({
  id,
  label,
  hint,
  error,
  className,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  ...props
}: TextFieldProps) {
  const descriptionIds = [
    hint ? `${id}-hint` : undefined,
    error ? `${id}-error` : undefined,
    describedBy,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {hint && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      <input
        {...props}
        id={id}
        className={["field__input", className].filter(Boolean).join(" ")}
        aria-invalid={error ? true : invalid}
        aria-describedby={descriptionIds || undefined}
      />
      {error && (
        <p className="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
