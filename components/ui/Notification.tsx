"use client";

import { Portal, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Fragment, JSX, useEffect, useState } from "react";

export type NotificationProps = {
  actions?: boolean;
  bgColor: string;
  icon?: JSX.Element;
  message?: JSX.Element;
  show: boolean;
  timeout?: number;
  closeNotification: () => void;
};

export default function Notification({
  actions,
  bgColor,
  icon,
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
      }, timeout || 8_000);
      return () => clearTimeout(timer);
    }
  }, [show, closeNotification, timeout]);

  if (!isMounted) {
    return null;
  }

  return (
    <Portal>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 z-20 flex items-start px-4 py-6 sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
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
              className={`w-full max-w-sm ${bgColor} pointer-events-auto rounded-lg shadow-lg ring-1 ring-black/5`}
            >
              <div className="p-4">
                <div className="flex items-start">
                  {icon && <div className="shrink-0">{icon}</div>}
                  <div className="ml-3 w-0 flex-1">
                    {message}
                    {actions && (
                      <div className="mt-4 flex">
                        <button
                          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          type="button"
                        >
                          Accept
                        </button>
                        <button
                          className="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          type="button"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex shrink-0">
                    <button
                      className={`${bgColor} inline-flex rounded-md text-white hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
                      onClick={() => closeNotification()}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon aria-hidden="true" className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Portal>
  );
}
