const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
};

const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
};

/** Normalize locale output so SSR and client hydration match (Intl uses U+202F on some runtimes). */
function normalizeLocaleString(value: string): string {
  return value.replace(/\u202f/g, " ").replace(/\u00a0/g, " ");
}

export function formatDateTime(iso: string): string {
  return normalizeLocaleString(
    new Intl.DateTimeFormat("es-EC", DATE_TIME_OPTIONS).format(new Date(iso)),
  );
}

export function formatTime(iso: string): string {
  return normalizeLocaleString(
    new Intl.DateTimeFormat("es-EC", TIME_OPTIONS).format(new Date(iso)),
  );
}
