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
    <DialogTitle
      className={cn(
        "text-[20px] leading-[1.2] font-semibold tracking-[-0.02em] text-[#17161A]",
        className,
      )}
    >
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
      <DialogBackdrop className="fixed inset-0 bg-[#17161A]/40" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          className={cn(
            "max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-[12px] border border-[#E3DFD7] bg-white px-5 pt-[22px] pb-6 font-sans text-[#3B3934] shadow-[0_12px_32px_-12px_rgba(23,22,26,0.28)] sm:px-6",
            panelClassName,
          )}
        >
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
