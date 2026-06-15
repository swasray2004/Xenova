import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor(diff / 60000);
  if (days > 1) return `${days}d ago`;
  if (hours > 1) return `${hours}h ago`;
  if (mins > 1) return `${mins}m ago`;
  return "Just now";
}

export function personalizeMessage(message: string, name: string): string {
  return message.replace(/\{\{name\}\}/g, name.split(" ")[0]);
}

export const CHANNEL_ICONS: Record<string, string> = {
  whatsapp: "💬",
  sms: "📱",
  email: "✉️",
  rcs: "🌐",
};

export const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: "#25D366",
  sms: "#FB923C",
  email: "#7C3AED",
  rcs: "#06B6D4",
};

export const STATUS_COLORS: Record<string, string> = {
  pending: "#6B7280",
  sent: "#A78BFA",
  delivered: "#34D399",
  failed: "#F43F5E",
  opened: "#60A5FA",
  read: "#52a3f7",
  clicked: "#FBBF24",
  converted: "#34D399",
};
