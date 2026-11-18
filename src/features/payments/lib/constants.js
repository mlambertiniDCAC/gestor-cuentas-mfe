export const MOVEMENT_STATUS = {
  PENDIENTE_AUTORIZACION: "PENDIENTE_AUTORIZACION",
  PROGRAMADO: "PROGRAMADO",
};

export const PENDING_STATUSES = [
  MOVEMENT_STATUS.PENDIENTE_AUTORIZACION,
  "EN_PROGRESO",
];

export const STATUS_LABEL = {
  ENVIADO: "Iniciado",
  PENDIENTE_AUTORIZACION: "Pendiente de autorización",
  PROGRAMADO: "Programado",
  REALIZADO: "Completado",
  RECHAZADO: "Fallido",
  CANCELADO: "Cancelado",
  INICIADO: "Iniciado",
  EN_PROGRESO: "Pendiente de autorización",
  COMPLETADO: "Completado",
  FALLIDO: "Fallido",
  IN_PROGRESS: "En proceso",
  COMPLETED: "Completado",
  FAILED: "Fallido",
  UNKNOWN: "En verificación",
};

export const STATUS_TONE = {
  ENVIADO: "info",
  PENDIENTE_AUTORIZACION: "warning",
  PROGRAMADO: "info",
  REALIZADO: "success",
  RECHAZADO: "danger",
  CANCELADO: "neutral",
  INICIADO: "info",
  EN_PROGRESO: "warning",
  COMPLETADO: "success",
  FALLIDO: "danger",
  IN_PROGRESS: "info",
  COMPLETED: "success",
  FAILED: "danger",
  UNKNOWN: "warning",
};

export const DESTINO_TIPO = {
  CBU: "cbu",
  ALIAS: "alias",
};

export const CUANDO_PAGAR = {
  HOY: "hoy",
  FECHA: "fecha",
};

export const RESULT_KIND = {
  SENT: "sent",
  SCHEDULED: "scheduled",
  PENDING: "pending",
};
