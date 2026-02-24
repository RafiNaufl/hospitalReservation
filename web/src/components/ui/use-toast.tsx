"use client";

import * as React from "react";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  ToastViewport,
  type ToastProps,
} from "./toast";

type ToastAction = {
  label: string;
  onClick?: () => void;
};

type ToastItem = {
  id: string;
  variant?: ToastProps["variant"];
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastAction;
};

type ToastState = ToastItem[];

type ToastContextValue = {
  toasts: ToastState;
  toast: (toast: Omit<ToastState[number], "id">) => void;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined
);

export function ToastProviderWithHook({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [toasts, setToasts] = React.useState<ToastState>([]);

  const toast = React.useCallback(
    (toast: Omit<ToastState[number], "id">) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { ...toast, id }]);
      setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, 5000);
    },
    []
  );

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastViewport>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            variant={toast.variant}
            onClose={() => dismiss(toast.id)}
          >
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            {toast.description && (
              <ToastDescription>{toast.description}</ToastDescription>
            )}
          </Toast>
        ))}
      </ToastViewport>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProviderWithHook");
  }

  return {
    toast: context.toast,
  };
}
