import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ModalProps = {
  children: ReactNode;
  className?: string;
  onClose: () => void;
  open: boolean;
  panelClassName?: string;
};

type ModalTitleProps = {
  children: ReactNode;
  className?: string;
};

export function ModalTitleText({ children, className }: ModalTitleProps) {
  return (
    <DialogTitle className={cn("text-xl font-semibold", className)}>
      {children}
    </DialogTitle>
  );
}

export default function Modal({
  children,
  className,
  onClose,
  open,
  panelClassName,
}: ModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={cn("relative z-50", className)}
    >
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          className={cn(
            "w-full max-w-xl rounded-2xl border border-blue-dark/20 bg-white p-5 shadow-xl",
            panelClassName,
          )}
        >
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
