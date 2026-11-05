"use client";

import React, { useCallback, useRef, useState, useTransition } from "react";
import * as XLSX from "xlsx";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  X,
  FileText,
  HelpCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import type { Product } from "@/types/product";
import {
  massUploadProductsAction,
  type MassUploadProductRow,
} from "@/actions/product.actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface ProductMassUploadDialogProps {
  existingProducts: Product[];
  onSuccess: () => void;
}

interface ParsedRowResult {
  raw: Record<string, unknown>;
  normalized: MassUploadProductRow | null;
  action: "update" | "create" | "invalid";
  matchedSku?: string;
  errors: string[];
}

// Standard Column Headers for Template Generation & Flexible Header Matching
const TEMPLATE_HEADERS = [
  "SKU [REQUIRED to match & update]",
  "Product Name [REQUIRED]",
  "Brand [REQUIRED]",
  "Volume [REQUIRED: 50ml, 85ml, 100ml]",
  "Price [REQUIRED: PHP]",
  "Stock [REQUIRED: Units]",
  "Original Price [OPTIONAL: PHP]",
  "Gender [OPTIONAL: female, male, unisex]",
  "Status [OPTIONAL: in_stock, low_stock, out_of_stock]",
  "Fragrance Family [OPTIONAL]",
  "Description [OPTIONAL]",
  "Top Notes [OPTIONAL: comma-separated]",
  "Heart Notes [OPTIONAL: comma-separated]",
  "Base Notes [OPTIONAL: comma-separated]",
  "Is Featured [OPTIONAL: TRUE or FALSE]",
];

const SAMPLE_TEMPLATE_ROWS = [
  [
    "CVS25",
    "VS - Vanilla Lace",
    "Victoria's Secret",
    "50ml",
    135,
    20,
    180,
    "female",
    "in_stock",
    "Warm Vanilla Gourmand",
    "Sensual blend of vanilla, warm amber, and white musk with an addictive cozy finish.",
    "Warm Vanilla, White Orchid",
    "Sweet Amber, Spiced Sugar",
    "Creamy Musk, Sandalwood",
    "TRUE",
  ],
  [
    "VS85-PC",
    "VS Perfume 85ml - Pink Chiffon",
    "Victoria's Secret",
    "85ml",
    200,
    250,
    250,
    "female",
    "in_stock",
    "Fruity Floral Gourmand",
    "Sparkling red pear and vanilla chiffon layered with delicate soft pink petals.",
    "Red Pear, Sparkling Mandarin",
    "Water Lily, Jasmine Petals",
    "Vanilla Chiffon, Sandalwood",
    "FALSE",
  ],
];

export function ProductMassUploadDialog({
  existingProducts,
  onSuccess,
}: ProductMassUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRowResult[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [showFieldsGuide, setShowFieldsGuide] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate and download template in Excel (.xlsx) or CSV
  const handleDownloadTemplate = (format: "xlsx" | "csv") => {
    try {
      const data = [TEMPLATE_HEADERS, ...SAMPLE_TEMPLATE_ROWS];
      const worksheet = XLSX.utils.aoa_to_sheet(data);

      // Auto-fit column widths
      worksheet["!cols"] = TEMPLATE_HEADERS.map((h) => ({
        wch: Math.max(h.length + 2, 14),
      }));

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Product Mass Upload");

      const filename = `scents-mists-mass-upload-format.${format}`;
      if (format === "xlsx") {
        XLSX.writeFile(workbook, filename, { bookType: "xlsx" });
      } else {
        XLSX.writeFile(workbook, filename, { bookType: "csv" });
      }
      toast.success(`Format template downloaded (${format.toUpperCase()})`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate format template.");
    }
  };

  // Helper to extract value regardless of whether user kept the header with "[REQUIRED]" or shortened it
  const findCell = (row: Record<string, unknown>, keys: string[]): unknown => {
    for (const k of Object.keys(row)) {
      const lowerKey = k.toLowerCase().trim();
      for (const target of keys) {
        if (
          lowerKey === target.toLowerCase().trim() ||
          lowerKey.startsWith(target.toLowerCase().trim()) ||
          lowerKey.includes(target.toLowerCase().trim())
        ) {
          return row[k];
        }
      }
    }
    return undefined;
  };

  // Parse uploaded file
  const handleFileChange = useCallback(
    async (uploadedFile: File) => {
      setFile(uploadedFile);
      setIsParsing(true);
      setParsedRows([]);

      try {
        const buffer = await uploadedFile.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          toast.error("The uploaded spreadsheet is empty.");
          setIsParsing(false);
          return;
        }

        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          defval: "",
        });

        if (rawJson.length === 0) {
          toast.error("No product rows found in the sheet.");
          setIsParsing(false);
          return;
        }

        // Validate each row
        const results: ParsedRowResult[] = rawJson.map((row) => {
          const errors: string[] = [];

          // 1. SKU (Required for update matching)
          const rawSku = String(findCell(row, ["sku"]) || "").trim();

          // 2. Product Name (Required)
          const rawName = String(
            findCell(row, ["product name", "perfume name", "name", "title"]) || ""
          ).trim();
          if (!rawName) {
            errors.push("Missing required field: Product Name");
          }

          // 3. Price (Required)
          const rawPrice = findCell(row, ["price", "price (php)", "unit price"]);
          const numPrice = Number(String(rawPrice ?? "").replace(/[^0-9.]/g, ""));
          if (rawPrice === undefined || rawPrice === "" || isNaN(numPrice) || numPrice < 0) {
            errors.push("Missing or invalid required field: Price (must be a positive number)");
          }

          // 4. Stock (Required)
          const rawStock = findCell(row, ["stock", "stock units", "units", "inventory"]);
          const numStock = Number(String(rawStock ?? "").replace(/[^0-9]/g, ""));
          if (rawStock === undefined || rawStock === "" || isNaN(numStock) || numStock < 0) {
            errors.push("Missing or invalid required field: Stock Units (must be 0 or higher)");
          }

          // 5. Volume (Required: 50ml, 85ml, 100ml)
          const rawVolume = String(
            findCell(row, ["volume", "bottle size", "size"]) || "50ml"
          ).trim();
          let validVolume: "50ml" | "85ml" | "100ml" = "50ml";
          if (rawVolume.toLowerCase().includes("85")) {
            validVolume = "85ml";
          } else if (rawVolume.toLowerCase().includes("100")) {
            validVolume = "100ml";
          } else if (rawVolume.toLowerCase().includes("50")) {
            validVolume = "50ml";
          } else {
            errors.push("Invalid volume: must specify '50ml', '85ml', or '100ml'");
          }

          // Brand (Required)
          const rawBrand = String(findCell(row, ["brand", "manufacturer"]) || "").trim();
          const brand = rawBrand || "SCENTS & MISTS";

          // Optional fields
          const rawOriginalPrice = findCell(row, ["original price", "regular price", "srp"]);
          const numOrigPrice = Number(String(rawOriginalPrice ?? "").replace(/[^0-9.]/g, ""));
          const original_price =
            !isNaN(numOrigPrice) && numOrigPrice > 0 ? numOrigPrice : undefined;

          const rawGender = String(findCell(row, ["gender", "category"]) || "female").toLowerCase();
          const gender: "female" | "male" | "unisex" =
            rawGender.includes("male") && !rawGender.includes("female")
              ? "male"
              : rawGender.includes("uni")
              ? "unisex"
              : "female";

          const rawStatus = String(findCell(row, ["status", "inventory status"]) || "").toLowerCase();
          const status: "in_stock" | "low_stock" | "out_of_stock" | undefined =
            rawStatus.includes("out")
              ? "out_of_stock"
              : rawStatus.includes("low")
              ? "low_stock"
              : rawStatus.includes("in")
              ? "in_stock"
              : undefined;

          const fragrance_family = String(findCell(row, ["fragrance family", "family", "olfactory"]) || "").trim();
          const description = String(findCell(row, ["description", "details"]) || "").trim();

          const parseNotes = (val: unknown): string[] | undefined => {
            if (!val) return undefined;
            const str = String(val).trim();
            if (!str) return undefined;
            return str
              .split(/[,;\n]/)
              .map((s) => s.trim())
              .filter(Boolean);
          };

          const top_notes = parseNotes(findCell(row, ["top notes", "top"]));
          const heart_notes = parseNotes(findCell(row, ["heart notes", "middle notes", "heart"]));
          const base_notes = parseNotes(findCell(row, ["base notes", "base"]));

          const rawFeatured = String(findCell(row, ["featured", "is featured", "highlight"]) || "").toLowerCase();
          const is_featured = rawFeatured === "true" || rawFeatured === "yes" || rawFeatured === "1";

          // Check if matches existing product
          let matchedSku: string | undefined;
          let action: "update" | "create" | "invalid" = "create";

          if (errors.length > 0) {
            action = "invalid";
          } else {
            const cleanSku = rawSku.toUpperCase();
            const cleanName = rawName.toLowerCase();

            const existing = existingProducts.find((p) => {
              if (cleanSku && (p.sku || "").toUpperCase() === cleanSku) return true;
              return (p.name || "").toLowerCase() === cleanName;
            });

            if (existing) {
              action = "update";
              matchedSku = existing.sku || rawSku;
            } else {
              action = "create";
            }
          }

          const normalized: MassUploadProductRow | null =
            errors.length === 0
              ? {
                  sku: rawSku || matchedSku,
                  name: rawName,
                  brand,
                  volume: validVolume,
                  price: numPrice,
                  stock: numStock,
                  original_price,
                  gender,
                  status,
                  fragrance_family: fragrance_family || undefined,
                  description: description || undefined,
                  top_notes,
                  heart_notes,
                  base_notes,
                  is_featured,
                }
              : null;

          return {
            raw: row,
            normalized,
            action,
            matchedSku,
            errors,
          };
        });

        setParsedRows(results);
        toast.success(`Processed ${results.length} rows from file.`);
      } catch (err) {
        console.error("Error reading file:", err);
        toast.error("Could not parse file. Please verify it is a valid .xlsx or .csv.");
      } finally {
        setIsParsing(false);
      }
    },
    [existingProducts]
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleApplyImport = () => {
    const validItems = parsedRows
      .filter((r) => r.normalized !== null)
      .map((r) => r.normalized as MassUploadProductRow);

    if (validItems.length === 0) {
      toast.error("No valid product rows to import. Please check required fields.");
      return;
    }

    startTransition(async () => {
      const res = await massUploadProductsAction(validItems);
      if (res.success) {
        toast.success(
          `Mass upload complete! ${res.updatedCount} updated, ${res.createdCount} created.`
        );
        setIsOpen(false);
        setFile(null);
        setParsedRows([]);
        onSuccess();
      } else {
        toast.error(res.error || "Failed to import products.");
      }
    });
  };

  const updatesCount = parsedRows.filter((r) => r.action === "update").length;
  const createsCount = parsedRows.filter((r) => r.action === "create").length;
  const errorsCount = parsedRows.filter((r) => r.action === "invalid").length;
  const validCount = updatesCount + createsCount;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 h-8 px-3 text-xs bg-surface-elevated hover:bg-surface border-border text-foreground rounded-lg transition-colors cursor-pointer"
      >
        <UploadCloud className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        <span>Import / Mass Upload</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-surface-elevated p-5 sm:p-6 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-accent font-semibold px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                    <FileSpreadsheet className="h-3 w-3" />
                    Mass Upload & Bulk Update
                  </span>
                </div>
                <h2 className="text-xl font-serif font-bold text-foreground mt-1">
                  Import Fragrance Products
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Generate the standard format, fill your products, and upload to batch create or mass update existing entries.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setFile(null);
                  setParsedRows([]);
                }}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* STEP 1: GENERATE FORMAT / DOWNLOAD TEMPLATE */}
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                      1
                    </span>
                    <h3 className="text-sm font-semibold text-foreground">
                      Generate Format & View Required Fields
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-7">
                    Download the pre-structured template containing exact required field markers and sample rows.
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-7 sm:ml-0">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleDownloadTemplate("xlsx")}
                    className="inline-flex items-center gap-1.5 h-8 text-xs bg-accent text-accent-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Excel Format (.xlsx)</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadTemplate("csv")}
                    className="inline-flex items-center gap-1.5 h-8 text-xs bg-surface border-border text-foreground rounded-lg hover:bg-surface-elevated cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>CSV Format</span>
                  </Button>
                </div>
              </div>

              {/* Required & Optional Fields Reference */}
              <div className="pt-2 border-t border-accent/20">
                <button
                  type="button"
                  onClick={() => setShowFieldsGuide(!showFieldsGuide)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline cursor-pointer"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>
                    {showFieldsGuide ? "Hide Format Guide" : "Show Required & Optional Fields Reference"}
                  </span>
                </button>

                {showFieldsGuide && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-surface/80 p-3 rounded-lg border border-border">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1 text-red-500 font-semibold font-mono text-[11px] uppercase tracking-wide">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>Required Fields</span>
                      </div>
                      <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                        <li>
                          <strong className="text-foreground">SKU</strong>: Product code (e.g., <code className="text-accent">CVS25</code>, <code className="text-accent">VS85-PC</code>). If SKU matches an existing item, it <span className="text-emerald-500 font-semibold">updates</span> it. If new, it <span className="text-blue-500 font-semibold">creates</span> it.
                        </li>
                        <li>
                          <strong className="text-foreground">Product Name</strong>: Full fragrance title (e.g., <code className="text-accent">VS - Vanilla Lace</code>).
                        </li>
                        <li>
                          <strong className="text-foreground">Brand</strong>: e.g., <code className="text-accent">Victoria&apos;s Secret</code>, <code className="text-accent">Bath & Body Works</code>, <code className="text-accent">SCENTS & MISTS</code>.
                        </li>
                        <li>
                          <strong className="text-foreground">Volume</strong>: Must be exactly <code className="text-accent">50ml</code>, <code className="text-accent">85ml</code>, or <code className="text-accent">100ml</code>.
                        </li>
                        <li>
                          <strong className="text-foreground">Price</strong>: Regular selling price in PHP numbers only (e.g., <code className="text-accent">135</code> or <code className="text-accent">200</code>).
                        </li>
                        <li>
                          <strong className="text-foreground">Stock</strong>: Inventory quantity count in numeric units (e.g., <code className="text-accent">20</code>, <code className="text-accent">0</code>).
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1 text-blue-400 font-semibold font-mono text-[11px] uppercase tracking-wide">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Optional Fields</span>
                      </div>
                      <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                        <li>
                          <strong className="text-foreground">Original Price</strong>: Strike-through SRP (e.g., <code className="text-accent">180</code>, <code className="text-accent">250</code>).
                        </li>
                        <li>
                          <strong className="text-foreground">Gender</strong>: <code className="text-accent">female</code>, <code className="text-accent">male</code>, or <code className="text-accent">unisex</code> (default: female).
                        </li>
                        <li>
                          <strong className="text-foreground">Status</strong>: <code className="text-accent">in_stock</code>, <code className="text-accent">low_stock</code>, or <code className="text-accent">out_of_stock</code> (automatically computed from stock if omitted).
                        </li>
                        <li>
                          <strong className="text-foreground">Fragrance Family</strong>: Scent genre (e.g., <code className="text-accent">Floral Gourmand</code>).
                        </li>
                        <li>
                          <strong className="text-foreground">Top, Heart, Base Notes</strong>: Comma-separated notes (e.g., <code className="text-accent">Vanilla, Sugar, Amber</code>).
                        </li>
                        <li>
                          <strong className="text-foreground">Is Featured</strong>: <code className="text-accent">TRUE</code> or <code className="text-accent">FALSE</code>.
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* STEP 2: UPLOAD FILE AREA */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                  2
                </span>
                <h3 className="text-sm font-semibold text-foreground">
                  Upload Completed File
                </h3>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors text-center",
                  file
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent/60 bg-surface/60 hover:bg-surface"
                )}
              >
                <div className="h-10 w-10 rounded-full bg-surface-elevated border border-border flex items-center justify-center mb-2 text-accent">
                  {isParsing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <UploadCloud className="h-5 w-5" />
                  )}
                </div>

                {file ? (
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Selected File: <span className="text-accent font-mono">{file.name}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {(file.size / 1024).toFixed(1)} KB — Click or drop another file to replace
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Drag & Drop your completed Excel or CSV file here, or{" "}
                      <span className="text-accent underline">browse</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Accepts .xlsx, .xls, and .csv formats
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* STEP 3: REALTIME VALIDATION & PREVIEW */}
            {parsedRows.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                      3
                    </span>
                    <h3 className="text-sm font-semibold text-foreground">
                      Validation & Import Preview
                    </h3>
                  </div>

                  {/* Summary Badges */}
                  <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                    <span className="px-2 py-0.5 rounded-full bg-surface border border-border text-foreground">
                      Total: <strong>{parsedRows.length}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-semibold">
                      To Update: <strong>{updatesCount}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 font-semibold">
                      To Create: <strong>{createsCount}</strong>
                    </span>
                    {errorsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 font-semibold">
                        Errors: <strong>{errorsCount}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Table Preview */}
                <div className="max-h-60 overflow-y-auto border border-border rounded-xl bg-surface/50 text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface sticky top-0 border-b border-border text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                      <tr>
                        <th className="py-2 px-3">Action</th>
                        <th className="py-2 px-3">SKU</th>
                        <th className="py-2 px-3">Product Name</th>
                        <th className="py-2 px-3">Volume</th>
                        <th className="py-2 px-3">Price</th>
                        <th className="py-2 px-3">Stock</th>
                        <th className="py-2 px-3">Validation Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {parsedRows.map((row, idx) => {
                        const p = row.normalized;
                        const isInvalid = row.action === "invalid";
                        const isUpdate = row.action === "update";

                        return (
                          <tr
                            key={idx}
                            className={cn(
                              "hover:bg-surface transition-colors",
                              isInvalid && "bg-red-500/5 text-red-400"
                            )}
                          >
                            <td className="py-2 px-3 whitespace-nowrap">
                              {isInvalid ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-500 uppercase px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 font-mono">
                                  <XCircle className="h-3 w-3" /> Error
                                </span>
                              ) : isUpdate ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500 uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-mono">
                                  <RefreshCw className="h-3 w-3" /> Update
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-500 uppercase px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 font-mono">
                                  <CheckCircle2 className="h-3 w-3" /> New
                                </span>
                              )}
                            </td>

                            <td className="py-2 px-3 font-mono font-medium">
                              {p?.sku || (findCell(row.raw, ["sku"]) as string) || "—"}
                            </td>

                            <td className="py-2 px-3 font-serif font-medium">
                              {p?.name || (findCell(row.raw, ["name", "product name"]) as string) || "Untitled"}
                            </td>

                            <td className="py-2 px-3 font-mono text-[11px]">
                              {p?.volume || "—"}
                            </td>

                            <td className="py-2 px-3 font-mono font-semibold">
                              {p?.price !== undefined ? `₱${p.price}` : "—"}
                            </td>

                            <td className="py-2 px-3 font-mono">
                              {p?.stock !== undefined ? `${p.stock} units` : "—"}
                            </td>

                            <td className="py-2 px-3">
                              {row.errors.length > 0 ? (
                                <span className="text-red-500 text-[11px] font-medium">
                                  {row.errors.join("; ")}
                                </span>
                              ) : isUpdate ? (
                                <span className="text-emerald-500 text-[11px]">
                                  Matches existing SKU: {row.matchedSku}
                                </span>
                              ) : (
                                <span className="text-blue-500 text-[11px]">
                                  Ready to create as new catalog entry
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center sm:text-left">
                {parsedRows.length > 0 ? (
                  <span>
                    Ready to process <strong>{validCount}</strong> valid fragrances{" "}
                    {errorsCount > 0 && (
                      <span className="text-red-500">
                        ({errorsCount} rows skipped due to missing required fields)
                      </span>
                    )}
                  </span>
                ) : (
                  <span>Upload a completed format spreadsheet to preview results.</span>
                )}
              </p>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    setFile(null);
                    setParsedRows([]);
                  }}
                  disabled={isPending}
                  className="h-9 px-4 text-xs bg-surface border-border hover:bg-surface-elevated text-foreground rounded-lg cursor-pointer"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleApplyImport}
                  disabled={validCount === 0 || isPending}
                  className="inline-flex items-center gap-1.5 h-9 px-4 text-xs bg-accent text-accent-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Applying Mass Import...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-3.5 w-3.5" />
                      <span>Apply Import ({validCount} Products)</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

