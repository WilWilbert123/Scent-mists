"use client";

import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

interface ExportButtonProps {
  filename: string;
  headers: string[];
  rows: (string | number | boolean | null | undefined)[][];
  label?: string;
}

export function ExportButton({
  filename,
  headers,
  rows,
  label = "Export CSV",
}: ExportButtonProps) {
  const handleExport = () => {
    if (rows.length === 0) {
      toast.error("No records available to export.");
      return;
    }

    const escapeCsv = (val: string | number | boolean | null | undefined) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvLines = [
      headers.map(escapeCsv).join(","),
      ...rows.map((r) => r.map(escapeCsv).join(",")),
    ];

    const blob = new Blob([csvLines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} records to CSV.`);
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleExport}>
      <Download className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{label}</span>
    </Button>
  );
}

