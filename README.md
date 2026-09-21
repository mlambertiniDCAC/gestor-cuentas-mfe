# gestor-cuentas-mfe

MFE de billetera virtual PSP: login, cuenta CVU (saldo, CVU, alias), edición de alias, pagos inmediatos y programados, pendientes de autorización e historial (incluye ingresos). Consume exclusivamente apigateway-psp.

## Requisitos

- Node 20+
- apigateway-psp corriendo (local `http://localhost:8010`) con `CORS_ORIGINS` que incluya `http://localhost:5176`
- onboarding-psp (opcional, local `http://localhost:5175`) para el CTA "Activar cuenta CVU"

## Variables de entorno

Sin prefijo `VITE_`; se inyectan vía `define` en `vite.config.js`.

| Variable             | Uso                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| `APIGW_PSP_URL`      | Base de apigateway-psp, sin `/v1`. Un build de producción sin valor falla.                       |
| `ONBOARDING_PSP_URL` | Destino del CTA de activación cuando el usuario no tiene cuenta o su sesión sigue en onboarding. Un build de producción sin valor falla. |

## Desarrollo

```bash
npm install
npm run dev
npm test
npm run lint
```

## Endpoints usados

`POST /v1/auth/login` · `POST /v1/auth/logout` · `POST /v1/auth/refresh` · `GET /v1/cuentas/me` · `PATCH /v1/cuentas/:cuentaIdExterno` · `GET /v1/motivos-pago` · `GET /v1/movimientos?cuentaCvuId=` · `POST /v1/movimientos` · `POST /v1/movimientos/:id/autorizar` · `POST /v1/movimientos/:id/cancelar`

## Fuera de alcance

Creación de cuentas (la hace el alta de compliance), delegación de usuarios, comprobantes, ejecución del cron de programados y configuración del webhook de ingresos.

## Build

```bash
docker build -f Dockerfile.prod -t gestor-cuentas-mfe .
```

## QA manual

Con apigateway-psp y ms-psp levantados (`CORS_ORIGINS` incluye `http://localhost:5176`) y `npm run dev`:

1. Login con un usuario sin cuenta → aparece "Activar cuenta CVU" y el botón lleva a `ONBOARDING_PSP_URL`.
2. Login con un usuario en scope onboarding → "Tu cuenta todavía está en proceso de alta".
3. Login con un usuario con cuenta → saldo, CVU y alias; ocultar/mostrar saldo.
4. "Ver datos / Recibir" → copiar CVU y alias; "Editar" → alias nuevo válido → el alias cambia en la tarjeta. Volver a editar → aparece el aviso de freeze con fecha y hora.
5. "Pagar" a un alias sin fecha → resumen con retención → "Autorizar" → "Pago enviado"; en `/pagos › Historial` aparece el débito.
6. "Pagar" con fecha futura → "Autorizar" → "Pago programado"; aparece en `/pagos › Programados` sin acciones.
7. "Pagar" → "Dejar pendiente" → aparece en `/pagos › Pendientes`; "Cancelar" lo saca; otro pendiente → "Autorizar" lo ejecuta.
8. Con el webhook de ingresos configurado, una transferencia al CVU aparece como `+ $` en Historial y actualiza el saldo.
9. Cerrar sesión → vuelve al login y `localStorage` no tiene claves `gestor_cuentas_*`.
