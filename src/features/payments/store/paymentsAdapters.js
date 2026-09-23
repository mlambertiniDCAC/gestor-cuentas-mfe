import { format } from "date-fns";
import { formatCurrency } from "src/lib/formatters";
import { DESTINO_TIPO, MOVEMENT_STATUS } from "../lib/constants";
import { isFutureDate } from "../lib/paymentSchema";

const toAmount = (value) => {
  const parsed = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDate = (iso) => {
  if (!iso) return "-";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "-" : format(date, "dd/MM/yyyy");
};

const money = (value) => `$ ${formatCurrency(toAmount(value))}`;

export const adaptMovement = (raw) => {
  const monto = toAmount(raw.monto);
  const esCredito = raw.tipo === "CREDITO";
  const detalle = raw.transferenciaDetalle ?? null;
  const esHijo =
    raw.movimientoPadreId !== null && raw.movimientoPadreId !== undefined;
  const contraparte =
    detalle?.cuentaDestinoAlias || detalle?.cuentaDestinoCvu || "";
  return {
    id: raw.id,
    esHijo,
    esCredito,
    monto,
    montoFormateado: `${esCredito ? "+" : "-"} ${money(monto)}`,
    detalle: raw.detalle ?? "",
    estado: raw.estado ?? null,
    fechaCreacion: raw.fechaCreacion,
    fechaEjecucion: raw.fechaEjecucion ?? null,
    fechaTexto: formatDate(raw.fechaCreacion),
    fechaEjecucionTexto: formatDate(raw.fechaEjecucion),
    contraparte: esHijo && !contraparte ? "Retención impositiva" : contraparte,
  };
};

const byDateDesc = (a, b) =>
  new Date(b.fechaCreacion) - new Date(a.fechaCreacion);

export const splitMovements = (movements) => ({
  pending: movements.filter(
    (m) => !m.esHijo && m.estado === MOVEMENT_STATUS.EN_PROGRESO
  ),
  scheduled: movements.filter(
    (m) => !m.esHijo && m.estado === MOVEMENT_STATUS.PROGRAMADO
  ),
  history: movements
    .filter(
      (m) =>
        m.estado !== MOVEMENT_STATUS.EN_PROGRESO &&
        m.estado !== MOVEMENT_STATUS.PROGRAMADO
    )
    .sort(byDateDesc),
});

export const adaptCreateResult = (raw) => ({
  movimientoId: raw.movimientoId,
  montoTransferencia: toAmount(raw.montoTransferencia),
  montoRetencion: toAmount(raw.montoRetencion),
  montoTotal: toAmount(raw.montoTotal),
  montoTransferenciaTexto: money(raw.montoTransferencia),
  montoRetencionTexto: money(raw.montoRetencion),
  montoTotalTexto: money(raw.montoTotal),
});

const parseEmails = (emails) =>
  (emails ?? "")
    .split(",")
    .map((mail) => mail.trim())
    .filter(Boolean);

export const buildCreatePayload = (values, cuentaCvuId) => {
  const destino = values.destino.trim();
  const emails = parseEmails(values.emails);
  return {
    cuentaCvuId,
    monto: Number(values.monto),
    destino:
      values.destinoTipo === DESTINO_TIPO.CBU
        ? { cbu: destino }
        : { alias: destino },
    motivo: "TRANSFERENCIA",
    metodoDePago: Number(values.metodoDePago),
    motivoPago: values.motivoPago,
    ...(values.detalle?.trim() ? { detalle: values.detalle.trim() } : {}),
    ...(isFutureDate(values.fechaProgramada)
      ? { fechaProgramada: values.fechaProgramada }
      : {}),
    ...(emails.length ? { emails } : {}),
  };
};
