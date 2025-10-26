type Option = {
  id: number;
  name: string;
};

type SelectProps = {
  defaultValue: number | string;
  options: Option[];
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export default function Select({
  defaultValue,
  handleChange,
  options,
  ...rest
}: SelectProps) {

  return (
    <select
      id="column"
      className={`border border-gray-500 rounded-xl p-2 focus:border-purple-300 flex-1 `}
      onChange={handleChange}
      defaultValue={defaultValue}
      {...rest}
    >
      {options.map((option) => (
        <option key={option.id} value={option.name}>
          {option.name}
        </option>
      ))}
    </select>
  );
}