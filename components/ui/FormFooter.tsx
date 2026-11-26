import type { ComponentProps } from "react";
import { Button } from "./Button";

type ButtonProps = ComponentProps<typeof Button>;

export type ActionButton = {
  text: string;
  type: "submit" | "button";
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  isMutating?: boolean;
  handleClick?: ButtonProps["onClick"];
  value?: string;
  className?: string;
};

type FormFooterProps = {
  actionButtons: ActionButton[];
};

export default function FormFooter({ actionButtons }: FormFooterProps) {
  return (
    <div className="mt-10 flex flex-col gap-3 sm:flex-row-reverse sm:justify-start">
      {actionButtons.map(
        (
          {
            text,
            type,
            size,
            variant,
            isMutating,
            handleClick,
            value,
            className,
          },
          index,
        ) => (
          <Button
            key={index}
            type={type}
            size={size}
            variant={variant}
            disabled={isMutating}
            onClick={handleClick}
            value={value}
            className={className || "sm:min-w-50"}
          >
            {text}
          </Button>
        ),
      )}
    </div>
  );
}
