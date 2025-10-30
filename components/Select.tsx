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
  ...rest
}: SelectProps) {
  return (
    <select
      id="column"
      className={`border border-gray-500 rounded-xl p-2 focus:border-purple-300 flex-1 `}
      defaultValue={defaultValue}
      onChange={handleChange}
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
