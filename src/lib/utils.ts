import type { RiskLevel, Severity } from "./types";

export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

interface SeverityStyle {
  label: string;
  badge: string;
  dot: string;
  bar: string;
  panel: string;
  text: string;
}

export const SEVERITY: Record<Severity, SeverityStyle> = {
  critical: {
    label: "Critical",
    badge: "border-[#fecdca] bg-[#fef3f2] text-[#b42318]",
    dot: "bg-[#d92d20]",
    bar: "bg-[#d92d20]",
    panel: "border-[#fecdca] bg-[#fffbfa]",
    text: "text-[#b42318]",
  },
  high: {
    label: "High",
    badge: "border-[#fed7aa] bg-[#fff6ed] text-[#c4320a]",
    dot: "bg-[#ef6820]",
    bar: "bg-[#ef6820]",
    panel: "border-[#fed7aa] bg-[#fffcf9]",
    text: "text-[#c4320a]",
  },
  medium: {
    label: "Medium",
    badge: "border-[#fde68a] bg-[#fefce8] text-[#8a6100]",
    dot: "bg-[#eaaa08]",
    bar: "bg-[#eaaa08]",
    panel: "border-[#fde68a] bg-[#fffef5]",
    text: "text-[#8a6100]",
  },
  low: {
    label: "Low",
    badge: "border-[#bbdec9] bg-[#edf7f1] text-[#1f6b4a]",
    dot: "bg-[#3f9c72]",
    bar: "bg-[#3f9c72]",
    panel: "border-[#bbdec9] bg-[#f7fcf9]",
    text: "text-[#1f6b4a]",
  },
};

export const RISK: Record<
  RiskLevel,
  { label: string; short: string; color: string; soft: string }
> = {
  low: {
    label: "Low risk",
    short: "Low",
    color: "#2f7a5b",
    soft: "#edf7f1",
  },
  medium: {
    label: "Moderate risk",
    short: "Moderate",
    color: "#a8780a",
    soft: "#fdf8e7",
  },
  high: {
    label: "High risk",
    short: "High",
    color: "#c85a1e",
    soft: "#fff4ed",
  },
  critical: {
    label: "Critical risk",
    short: "Critical",
    color: "#c0362c",
    soft: "#fef3f2",
  },
};

export const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}
