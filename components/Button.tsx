type ButtonProps = {
  type: "submit" | "button" | "reset";
  color?: string;
  text: string;
  handleChange?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export default function Button({
  type,
  text,
  color,
  handleChange,
}: ButtonProps) {
  const bgColorClass = () => {
    switch (color) {
      case "primary":
        return "bg-blue-dark hover:bg-blue-light text-white";
      case "secondary":
        return "bg-orange-dark hover:bg-orange-light text-white";
      default:
        return "bg-red-500 hover:bg-red-300 text-white";
    }
  };

  return (
    <button
      className={`cursor-pointer ${bgColorClass()} font-semibold py-2 px-4 rounded-3xl self-center w-56 sm:w-40 mb-2 sm:mb-0`}
      type={type}
      onClick={handleChange}
    >
      {text}
    </button>
  );
}
