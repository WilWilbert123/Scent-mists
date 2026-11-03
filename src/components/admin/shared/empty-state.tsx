import React from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center border border-border bg-surface-elevated px-6 py-14 text-center space-y-3">
      <div className="flex h-11 w-11 items-center justify-center border border-border bg-surface text-muted-foreground">
        <Inbox className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="font-serif text-xl font-medium text-foreground">{title}</h3>
      <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

