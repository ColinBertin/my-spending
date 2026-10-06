"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { NotificationProps, NotificationVariant } from "./Notification";
import Notification from "./Notification";

type NotificationState = Omit<NotificationProps, "closeNotification">;

type NotificationProviderState = {
  showNotification: (
    variant: NotificationVariant,
    message: string,
    timeout?: number,
  ) => void;
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
  const { showNotification } = useNotification();
  return useCallback(
    (message: string) => showNotification("success", message),
    [showNotification],
  );
}

export function useErrorNotification() {
  const { showNotification } = useNotification();
  return useCallback(
    (message: string) => showNotification("error", message),
    [showNotification],
  );
}

export default function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [notificationState, setNotificationState] = useState<NotificationState>(
    {
      id: 0,
      variant: "success",
      message: undefined,
      show: false,
    },
  );

  const showNotification = useCallback(
    (variant: NotificationVariant, message: string, timeout?: number) =>
      setNotificationState((prev) => ({
        id: prev.id + 1,
        variant,
        message,
        timeout,
        show: true,
      })),
    [],
  );

  const closeNotification = useCallback(
    () => setNotificationState((prev) => ({ ...prev, show: false })),
    [],
  );

  const contextValue = useMemo(
    () => ({ showNotification }),
    [showNotification],
  );

  return (
    <NotificationProviderContext.Provider value={contextValue}>
      <Notification
        closeNotification={closeNotification}
        id={notificationState.id}
        message={notificationState.message}
        show={notificationState.show}
        timeout={notificationState.timeout}
        variant={notificationState.variant}
      />
      {children}
    </NotificationProviderContext.Provider>
  );
}
