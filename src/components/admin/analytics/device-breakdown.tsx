import React from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/admin/shared/empty-state";

interface DeviceBreakdownProps {
  devices: { device: string; count: number; percentage: number }[];
  browsers: { browser: string; count: number; percentage: number }[];
}

export function DeviceBreakdown({ devices, browsers }: DeviceBreakdownProps) {
  const getDeviceIcon = (device: string) => {
    if (device === "Mobile") return <Smartphone className="h-4 w-4 text-accent" aria-hidden="true" />;
    if (device === "Tablet") return <Tablet className="h-4 w-4 text-accent" aria-hidden="true" />;
    return <Monitor className="h-4 w-4 text-accent" aria-hidden="true" />;
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Device Category Breakdown</CardTitle>
          <CardDescription>Viewport &amp; user-agent device classification</CardDescription>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <EmptyState
              title="No Device Data Yet"
              description="Device categories (Desktop, Mobile, Tablet) will populate from visitor sessions."
            />
          ) : (
            <div className="space-y-4">
              {devices.map((item) => (
                <div key={item.device} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      {getDeviceIcon(item.device)}
                      {item.device}
                    </span>
                    <span className="text-muted-foreground">
                      {item.count} views ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface overflow-hidden">
                    <div
                      className="h-full bg-accent"
                      style={{ width: `${Math.max(4, item.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Browser Category Breakdown</CardTitle>
          <CardDescription>High-level browser family distribution</CardDescription>
        </CardHeader>
        <CardContent>
          {browsers.length === 0 ? (
            <EmptyState
              title="No Browser Data Yet"
              description="Browser categories (Chrome, Safari, Firefox, Edge) will populate from visitor sessions."
            />
          ) : (
            <div className="space-y-4">
              {browsers.map((item) => (
                <div key={item.browser} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{item.browser}</span>
                    <span className="text-muted-foreground">
                      {item.count} views ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface overflow-hidden">
                    <div
                      className="h-full bg-sage"
                      style={{ width: `${Math.max(4, item.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

