export function formatKES(n: number | string) {
  const v = typeof n === "string" ? Number(n) : n;
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(v);
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
}

export function normalizeKenyanPhone(input: string): string | null {
  const cleaned = input.replace(/\D/g, "");
  if (cleaned.startsWith("254") && cleaned.length === 12) return cleaned;
  if (cleaned.startsWith("0") && cleaned.length === 10) return "254" + cleaned.slice(1);
  if (cleaned.startsWith("7") && cleaned.length === 9) return "254" + cleaned;
  if (cleaned.startsWith("1") && cleaned.length === 9) return "254" + cleaned;
  return null;
}
