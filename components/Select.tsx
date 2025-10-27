type Option = {
  id: string;
  name: string;
};

type SelectProps = {
  defaultValue: number | string;
  options: Option[];
};

export default function Select({
  defaultValue,
  options,
  ...rest
}: SelectProps) {

  return (
    <select
      id="column"
      className={`border border-gray-500 rounded-xl p-2 focus:border-purple-300 flex-1 `}
      defaultValue={defaultValue}
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