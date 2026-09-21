import { format } from "date-fns";
import { formatCurrency } from "src/lib/formatters";

const ACCOUNT_STATUS_ACTIVE = "ACTIVA";

const toAmount = (value) => {
  const parsed = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildHabilitadoTexto = (dia, hora) => {
  if (!dia || !hora) return null;
  const date = new Date(`${dia}T${hora}:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return format(date, "dd/MM/yyyy 'a las' HH:mm");
};

export const adaptAccount = (raw) => {
  const saldo = toAmount(raw.saldo);
  return {
    id: raw.id,
    cuentaIdExterno: raw.cuenta_id_externo,
    cuit: raw.cuit,
    cvu: raw.cvu,
    currency: raw.currency,
    situacionCuenta: raw.situacion_cuenta,
    alias: raw.alias_activo?.value ?? "",
    aliasFreeze: Boolean(raw.alias_activo?.freeze),
    aliasHabilitadoTexto: buildHabilitadoTexto(
      raw.alias_activo?.habilitado_dia,
      raw.alias_activo?.habilitado_hora
    ),
    saldo,
    saldoFormateado: formatCurrency(saldo),
  };
};

export const adaptAccounts = (list) =>
  Array.isArray(list) ? list.map(adaptAccount) : [];

export const pickDefaultAccountId = (accounts) =>
  (
    accounts.find(
      (account) => account.situacionCuenta === ACCOUNT_STATUS_ACTIVE
    ) ?? accounts[0]
  )?.cuentaIdExterno ?? null;
