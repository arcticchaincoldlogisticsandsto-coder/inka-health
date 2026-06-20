export function formatTzs(amount: number): string {
  return new Intl.NumberFormat("en-US").format(amount) + " TZS";
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (err) {
    return isoString;
  }
}
