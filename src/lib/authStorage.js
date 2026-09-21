const TOKEN_KEY = "gestor_cuentas_token";
const SUJETO_ID_KEY = "gestor_cuentas_sujeto_id";
const SCOPE_KEY = "gestor_cuentas_scope";

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  getSujetoId: () => localStorage.getItem(SUJETO_ID_KEY),
  setSujetoId: (sujetoId) =>
    sujetoId
      ? localStorage.setItem(SUJETO_ID_KEY, sujetoId)
      : localStorage.removeItem(SUJETO_ID_KEY),
  getScope: () => localStorage.getItem(SCOPE_KEY),
  setScope: (scope) =>
    scope
      ? localStorage.setItem(SCOPE_KEY, scope)
      : localStorage.removeItem(SCOPE_KEY),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SUJETO_ID_KEY);
    localStorage.removeItem(SCOPE_KEY);
  },
};
