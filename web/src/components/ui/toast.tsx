import * as React from "react";

type ToastVariant = "default" | "success" | "destructive";

type ToastProps = {
  variant?: ToastVariant;
  children: React.ReactNode;
  onClose?: () => void;
};

function ToastViewport({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed top-0 z-50 flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col">
      {children}
    </div>
  );
}

function Toast({ variant = "default", children, onClose }: ToastProps) {
  const baseClasses =
    "group pointer-events-auto relative flex w-full items-center justify-between space-x-3 overflow-hidden rounded-lg border p-4 pr-6 text-sm shadow-lg transition-all bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50";

  const variantClasses =
    variant === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-50"
      : variant === "destructive"
        ? "border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/60 dark:text-red-50"
        : "border-zinc-200 dark:border-zinc-800";

  return (
    <div className={`${baseClasses} ${variantClasses}`}>
      <div className="flex flex-1 flex-col gap-1">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 rounded-full p-1 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          ×
        </button>
      )}
    </div>
  );
}

function ToastTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-semibold">{children}</div>;
}

function ToastDescription({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs text-zinc-600 dark:text-zinc-300">{children}</div>
  );
}

export { ToastViewport, Toast, ToastTitle, ToastDescription, type ToastProps };
