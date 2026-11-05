"use client";

import React from "react";
import * as XLSX from "xlsx";
import { FileSpreadsheet, ChevronDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";

export interface ExportButtonProps {
  filename: string;
  headers: string[];
  rows: (string | number | boolean | null | undefined)[][];
  label?: string;
  sheetName?: string;
  className?: string;
}

export function ExportButton({
  filename,
  headers,
  rows,
  label = "Export to Excel",
  sheetName = "Sheet1",
  className,
}: ExportButtonProps) {
  const exportToExcel = () => {
    if (rows.length === 0) {
      toast.error("No records available to export.");
      return;
    }

    try {
      // 1. Prepare raw matrix
      const data = [headers, ...rows];
      const worksheet = XLSX.utils.aoa_to_sheet(data);

      // 2. Compute dynamic auto-fit column widths
      const colWidths = headers.map((header, colIdx) => {
        let maxLen = header.length;
        for (const row of rows) {
          const cellVal = row[colIdx];
          if (cellVal !== null && cellVal !== undefined) {
            maxLen = Math.max(maxLen, String(cellVal).length);
          }
        }
        return { wch: Math.min(Math.max(maxLen + 3, 10), 65) };
      });
      worksheet["!cols"] = colWidths;

      // 3. Create workbook and trigger download
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
      const dateStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(workbook, `${filename}-${dateStr}.xlsx`);
      toast.success(`Exported ${rows.length} records to Excel (.xlsx)`);
    } catch (err) {
      console.error("Excel export error:", err);
      toast.error("Failed to generate Excel file.");
    }
  };

  const exportToCsv = () => {
    if (rows.length === 0) {
      toast.error("No records available to export.");
      return;
    }

    try {
      const escapeCsv = (val: string | number | boolean | null | undefined) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const csvLines = [
        headers.map(escapeCsv).join(","),
        ...rows.map((r) => r.map(escapeCsv).join(",")),
      ];

      // Include UTF-8 BOM so Microsoft Excel correctly parses UTF-8 symbols (e.g. ₱)
      const blob = new Blob(["\uFEFF" + csvLines.join("\n")], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${rows.length} records to CSV`);
    } catch (err) {
      console.error("CSV export error:", err);
      toast.error("Failed to export CSV.");
    }
  };

  return (
    <div className={`inline-flex items-center rounded-lg border border-border bg-surface shadow-xs ${className || ""}`}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={exportToExcel}
        className="h-8 gap-1.5 px-3 text-xs font-medium text-foreground hover:bg-surface-elevated hover:text-accent cursor-pointer"
        title="Download Excel Spreadsheet (.xlsx)"
      >
        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        <span>{label}</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-8 w-7 items-center justify-center border-l border-border/80 text-muted-foreground hover:bg-surface-elevated hover:text-foreground cursor-pointer"
            aria-label="Export format options"
          >
            <ChevronDown className="h-3 w-3" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 text-xs">
          <DropdownMenuItem onClick={exportToExcel} className="gap-2 cursor-pointer">
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <div className="flex flex-col">
              <span className="font-medium text-foreground">Excel Workbook</span>
              <span className="text-[10px] text-muted-foreground">Download .xlsx spreadsheet</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={exportToCsv} className="gap-2 cursor-pointer">
            <FileText className="h-3.5 w-3.5 text-blue-500" />
            <div className="flex flex-col">
              <span className="font-medium text-foreground">CSV Document</span>
              <span className="text-[10px] text-muted-foreground">Download raw .csv table</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

