import axios from "axios";

const CATEGORY = { NAVIGATION: "Navegación", INTERACTION: "Interacción" };

export const TRACKING_EVENTS = {
  authorizeClick: () => ({
    category: CATEGORY.INTERACTION,
    action: "Autorizar Pagos",
  }),
  paymentReleased: () => ({
    category: CATEGORY.NAVIGATION,
    action: "PagoLiberado",
  }),
  authorizationRejected: () => ({
    category: CATEGORY.INTERACTION,
    action: "AutorizacionRechazada",
  }),
};

export const trackEvent = ({ category, action }) => {
  try {
    const base = import.meta.env.VITE_MATOMO_URL;
    const siteId = import.meta.env.VITE_MATOMO_SITE_ID;
    if (!base || !siteId) return;
    const query = new URLSearchParams({
      idsite: siteId,
      rec: "1",
      e_c: category,
      e_a: action,
    });
    axios.post(`${base}?${query.toString()}`).catch(() => undefined);
  } catch {
    return;
  }
};
