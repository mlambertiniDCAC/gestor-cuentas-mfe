export const GENERIC_ERROR_MESSAGE =
  "No pudimos completar la operación. Probá de nuevo en unos minutos.";

const ONBOARDING_SCOPE_MESSAGE = "la sesión todavía está en onboarding";
const MISSING_PSP_IDENTITY_MESSAGE = "no existe una cuenta PSP para ese mail";

const rawMessage = (error) =>
  error?.response?.data?.error?.message ?? error?.response?.data?.message;

export const PERMISSION_MOTIVO = {
  SUJETO_SIN_CVU: "SUJETO_SIN_CVU",
  SUJETO_SIN_CREDITOS: "SUJETO_SIN_CREDITOS",
  USUARIO_SIN_PERMISO: "USUARIO_SIN_PERMISO",
  KYC_PENDIENTE: "KYC_PENDIENTE",
};

export const PERMISSION_MESSAGES = {
  SUJETO_SIN_CVU: "Tu sociedad no tiene PSP habilitado.",
  USUARIO_SIN_PERMISO: "No tenés permiso para realizar esta acción.",
  SUJETO_SIN_CREDITOS: "Tu sociedad no tiene créditos habilitados.",
  KYC_PENDIENTE:
    "Tenés que completar la validación de tu identidad para operar.",
};

export const AUTHORIZE_REJECTED_MESSAGE =
  "No tenés permisos suficientes para autorizar estos pagos";

export const isPermissionMotivo = (motivo) =>
  typeof motivo === "string" &&
  Object.prototype.hasOwnProperty.call(PERMISSION_MESSAGES, motivo);

export const isForbidden = (error) => error?.response?.status === 403;

export const getPermissionMotivo = (error) => {
  if (error?.response?.status !== 403) return null;
  const motivo = error.response.data?.error?.motivo;
  return isPermissionMotivo(motivo) ? motivo : null;
};

export const getApiErrorMessage = (error) => {
  const response = error?.response;
  if (!response || response.status >= 500) return GENERIC_ERROR_MESSAGE;
  const motivo = getPermissionMotivo(error);
  if (motivo) return PERMISSION_MESSAGES[motivo];
  const raw = rawMessage(error);
  if (Array.isArray(raw) && raw.length) return raw.join(". ");
  if (typeof raw === "string" && raw.trim()) return raw;
  return GENERIC_ERROR_MESSAGE;
};

export const isOnboardingScopeError = (error) =>
  error?.response?.status === 403 &&
  String(rawMessage(error) ?? "").includes(ONBOARDING_SCOPE_MESSAGE);

export const isMissingPspIdentityError = (error) =>
  error?.response?.status === 401 &&
  String(rawMessage(error) ?? "").includes(MISSING_PSP_IDENTITY_MESSAGE);
