/** Temps relatif en français pour la liste des conversations. */
export function formatRelativeFr(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMs = date.getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
  const absMin = Math.abs(Math.round(diffMs / 60000));
  if (absMin < 60) {
    return rtf.format(Math.round(diffMs / 60000), "minute");
  }
  const absH = Math.abs(Math.round(diffMs / 3600000));
  if (absH < 48) {
    return rtf.format(Math.round(diffMs / 3600000), "hour");
  }
  return rtf.format(Math.round(diffMs / 86400000), "day");
}
