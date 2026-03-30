import type { InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

type FormInputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  registration?: UseFormRegisterReturn;
  error?: string;
  containerClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
};

const defaultContainerClassName = "relative w-full max-w-md mb-6";
const defaultInputClassName =
  "border border-gray-500 rounded-xl h-10 px-3 text-gray-700 font-medium focus:border-purple-300 w-full";
const defaultErrorClassName = "absolute top-11 left-2 text-red-300";

export default function FormInputField({
  registration,
  error,
  containerClassName = defaultContainerClassName,
  inputClassName = "",
  errorClassName = defaultErrorClassName,
  ...inputProps
}: FormInputFieldProps) {
  return (
    <div className={containerClassName}>
      <input
        className={`${defaultInputClassName} ${inputClassName}`.trim()}
        {...registration}
        {...inputProps}
      />
      {error && <small className={errorClassName}>{error}</small>}
    </div>
  );
}
