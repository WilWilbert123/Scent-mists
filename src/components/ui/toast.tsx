"use client";

import { Toaster as SonnerToaster, toast } from "sonner";
import { useTheme } from "@/hooks/use-theme";

export function AppToastProvider() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      theme={theme}
      position="top-center"
      duration={2200}
      visibleToasts={1}
      toastOptions={{
        classNames: {
          toast:
            "border border-border bg-surface-elevated text-foreground font-sans rounded-xl shadow-xl",
          title: "text-sm font-medium text-foreground",
          description: "text-xs text-muted-foreground",
        },
      }}
    />
  );
}

export { toast };

