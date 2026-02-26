"use client";

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useState } from "react";
import { NotificationProps } from "./Notification";
import Notification from "./Notification";

type NotificationState = Omit<NotificationProps, "closeNotification">;

type NotificationProviderState = {
  setNotificationState: Dispatch<SetStateAction<NotificationState>>;
};

const NotificationProviderContext = createContext<
  NotificationProviderState | undefined
>(undefined);

export function useNotification() {
  const context = useContext(NotificationProviderContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
}

export function useSuccessNotification() {
  const { setNotificationState } = useNotification();
  return (message: string) =>
    setNotificationState({
      bgColor: "bg-teal-500",
      icon: (
        <CheckCircleIcon aria-hidden="true" className="h-6 w-6 text-white" />
      ),
      message: (
        <>
          <p className="font-medium text-white">Success!</p>
          <p className="mt-1 text-white">{message}</p>
        </>
      ),
      show: true,
    });
}

export function useErrorNotification() {
  const { setNotificationState } = useNotification();
  return (message: string) =>
    setNotificationState({
      bgColor: "bg-red-400",
      icon: (
        <ExclamationCircleIcon
          aria-hidden="true"
          className="h-6 w-6 text-white"
        />
      ),
      message: (
        <>
          <p className="font-medium text-white">Something bad happened!</p>
          <p className="mt-1 text-white">{message}</p>
        </>
      ),
      show: true,
    });
}

export default function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [notificationState, setNotificationState] = useState<NotificationState>(
    {
      bgColor: "bg-green-500",
      message: undefined,
      show: false,
    },
  );

  return (
    <NotificationProviderContext.Provider value={{ setNotificationState }}>
      <Notification
        bgColor={notificationState.bgColor}
        closeNotification={() =>
          setNotificationState({ ...notificationState, show: false })
        }
        icon={notificationState.icon}
        message={notificationState.message}
        show={notificationState.show}
      />
      {children}
    </NotificationProviderContext.Provider>
  );
}
