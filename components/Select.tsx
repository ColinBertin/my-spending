import { ChangeEvent, SelectHTMLAttributes } from "react";

type Option = {
  id: string;
  name: string;
};

type SelectProps = {
  defaultValue: number | string;
  options: Option[];
  handleChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
} & SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({
  defaultValue,
  options,
  handleChange,
  className,
  onChange,
  ...rest
}: SelectProps) {
  return (
    <select
      className={[
        "w-full h-10 border border-gray-500 rounded-xl px-3 focus:border-purple-300",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      defaultValue={defaultValue}
      onChange={onChange ?? handleChange}
      {...rest}
    >
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  );
}
