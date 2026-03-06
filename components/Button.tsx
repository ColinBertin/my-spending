import type { ReactNode } from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  color?: string;
  text: ReactNode;
  handleChange?: React.MouseEventHandler<HTMLButtonElement>;
};

export default function Button({
  type = "button",
  text,
  color,
  handleChange,
  className = "",
  onClick,
  ...rest
}: ButtonProps) {
  const bgColorClass = () => {
    switch (color) {
      case "primary":
        return "bg-blue-dark hover:bg-blue-light text-white";
      case "secondary":
        return "bg-orange-dark hover:bg-orange-light text-white";
      case "neutral":
        return "bg-gray-500 hover:bg-gray-400 text-white";
      default:
        return "bg-red-500 hover:bg-red-300 text-white";
    }
  };

  return (
    <button
      className={`cursor-pointer ${bgColorClass()} font-semibold py-2 px-4 rounded-3xl self-center w-56 sm:w-40 mb-2 sm:mb-0 ${className}`}
      type={type}
      onClick={handleChange ?? onClick}
      {...rest}
    >
      {text}
    </button>
  );
}
