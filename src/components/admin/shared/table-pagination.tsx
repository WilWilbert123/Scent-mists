"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: TablePaginationProps) {
  return (
    <div
      role="navigation"
      aria-label="Table pagination"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border bg-surface px-4 py-3 text-xs text-muted-foreground"
    >
      <p>
        Total Records: <strong className="text-foreground">{totalItems}</strong> • Page{" "}
        <strong className="text-foreground">{currentPage}</strong> of{" "}
        <strong className="text-foreground">{Math.max(1, totalPages)}</strong>
      </p>
      <div className="flex items-center gap-2.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Previous</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <span>Next</span>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

