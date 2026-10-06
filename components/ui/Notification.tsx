"use client";

import { Portal, Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Fragment, useEffect, useState } from "react";

export type NotificationVariant = "success" | "error";

export type NotificationProps = {
  id: number;
  variant: NotificationVariant;
  message?: string;
  show: boolean;
  timeout?: number;
  closeNotification: () => void;
};

const VARIANT_STYLES = {
  success: { label: "Success", Icon: CheckCircleIcon, color: "text-[#0E7C66]" },
  error: {
    label: "Error",
    Icon: ExclamationCircleIcon,
    color: "text-[#B0442A]",
  },
} satisfies Record<
  NotificationVariant,
  { label: string; Icon: typeof CheckCircleIcon; color: string }
>;

export default function Notification({
  id,
  variant,
  message,
  show,
  timeout,
  closeNotification,
}: NotificationProps) {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        closeNotification();
      }, timeout ?? 8_000);
      return () => clearTimeout(timer);
    }
  }, [id, show, closeNotification, timeout]);

  if (!isMounted) {
    return null;
  }

  const styles = VARIANT_STYLES[variant];

  return (
    <Portal>
      <div
        aria-live={variant === "error" ? "assertive" : "polite"}
        className="print-hidden pointer-events-none fixed inset-0 z-[60] flex items-start px-4 py-6 sm:p-6"
      >
        <div className="flex w-full flex-col items-center sm:items-end">
          <Transition
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            show={show}
          >
            <div
              className="pointer-events-auto flex w-full max-w-sm items-center gap-[11px] rounded-[12px] border border-[#D9D4C9] bg-white py-[11px] pr-[9px] pl-[14px]"
              role={variant === "error" ? "alert" : "status"}
            >
              <styles.Icon
                aria-hidden="true"
                className={`h-5 w-5 flex-none ${styles.color}`}
              />
              <p className="min-w-0 flex-1 text-[13px] leading-[1.5] text-[#3B3934] [text-wrap:pretty]">
                <span className="sr-only">{styles.label}: </span>
                {message}
              </p>
              <button
                className="inline-flex h-7 w-7 flex-none cursor-pointer items-center justify-center rounded-[7px] text-[#5C5952] transition-colors hover:bg-[#F4F1EA] hover:text-[#17161A] focus-visible:outline-[1.5px] focus-visible:outline-[#17161A] focus-visible:outline-solid"
                onClick={closeNotification}
                type="button"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </Portal>
  );
}
