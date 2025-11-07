import type { LabelHTMLAttributes } from "react";

export type LabelProps = {
  text: string;
} & LabelHTMLAttributes<HTMLLabelElement>;

export default function Label({ text, ...rest }: LabelProps) {
  return (
    <label {...rest} className={`mt-4 mb-2 text-gray-700`}>
      {text}
    </label>
  );
}
