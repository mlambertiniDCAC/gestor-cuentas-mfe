/**
 * Tipo de recurso al que apunta un item de "Mi Actividad"
 * (`recurso.tipo` en `GET /movimientos/actividad`). Define qué detalle se pide
 * y con qué adapter se transforma la respuesta.
 */
export const ACTIVITY_RESOURCE_TYPE = {
  TRANSACTION: "transaccion",
  OPERATION: "operacion",
  ADVANCE: "anticipo",
};

/**
 * Canal del que viene un item de "Mi Actividad". Los items de `psp` llegan del
 * listado unificado y todavía no tienen detalle disponible.
 */
export const ACTIVITY_CHANNEL = {
  DCP: "dcp",
  PSP: "psp",
};
