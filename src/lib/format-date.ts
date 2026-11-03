import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";

export function formatDisplayDate(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
  if (!isValid(date)) return "Invalid date";
  return format(date, "MMM d, yyyy");
}

export function formatDisplayDateTime(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
  if (!isValid(date)) return "Invalid date";
  return format(date, "MMM d, yyyy • h:mm:ss a");
}

export function formatRelativeTime(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
  if (!isValid(date)) return "";
  return formatDistanceToNow(date, { addSuffix: true });
}

