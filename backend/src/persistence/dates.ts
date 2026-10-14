export const addDays = (dateIso: string, days: number): string => {
  const date = new Date(dateIso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
};

export const toIso = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

export const toIsoOrNull = (value: Date | string | null | undefined): string | null => {
  if (value == null) {
    return null;
  }
  return toIso(value);
};
