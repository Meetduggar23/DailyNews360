import * as React from "react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";

type ToastVariant = "default" | "destructive";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface Toast extends ToastOptions {
  id: string;
}

const ToastContext = React.createContext<{
  toast: (options: ToastOptions) => void;
} | null>(null);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

let counter = 0;

export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((options: ToastOptions) => {
    const id = `toast-${++counter}`;
    setToasts((prev) => [...prev, { id, ...options }]);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastProvider>
        {toasts.map((item) => (
          <Toast
            key={item.id}
            variant={item.variant}
            duration={item.duration ?? 3000}
            onOpenChange={(open) => {
              if (!open) dismiss(item.id);
            }}
          >
            <div className="flex flex-col gap-1">
              <ToastTitle>{item.title}</ToastTitle>
              {item.description ? <ToastDescription>{item.description}</ToastDescription> : null}
            </div>
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}