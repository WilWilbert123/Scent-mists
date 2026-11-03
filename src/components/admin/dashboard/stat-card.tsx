import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, subtitle, icon }: StatCardProps) {
  return (
    <Card className="p-5">
      <CardContent className="p-0 space-y-2">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium uppercase tracking-[0.14em]">
            {label}
          </span>
          {icon && <span className="text-accent">{icon}</span>}
        </div>
        <div className="font-serif text-3xl font-medium text-foreground">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

