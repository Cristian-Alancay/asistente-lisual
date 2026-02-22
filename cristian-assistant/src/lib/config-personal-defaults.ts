export type PersonalConfigKey =
  | "timezone"
  | "recordatorios_activos"
  | "hora_recordatorio"
  | "notas_por_pagina";

export type PersonalConfig = Record<PersonalConfigKey, string>;

export const DEFAULT_VALUES: PersonalConfig = {
  timezone: "America/Argentina/Buenos_Aires",
  recordatorios_activos: "true",
  hora_recordatorio: "09:00",
  notas_por_pagina: "20",
};
