import * as Yup from "yup";
import { regexAlias, regexCbuCvu } from "src/lib/regex";
import { DESTINO_TIPO } from "./constants";

export const PAYMENT_INITIAL_VALUES = {
  destinoTipo: DESTINO_TIPO.ALIAS,
  destino: "",
  monto: "",
  motivoPago: "",
  metodoDePago: "2",
  detalle: "",
  fechaProgramada: "",
  emails: "",
};

const toDayString = (date) => date.toISOString().slice(0, 10);

export const isFutureDate = (value, today = new Date()) =>
  Boolean(value) && value > toDayString(today);

const emailSchema = Yup.string().email();

export const buildPaymentSchema = () =>
  Yup.object({
    destinoTipo: Yup.string().oneOf(Object.values(DESTINO_TIPO)).required(),
    destino: Yup.string()
      .trim()
      .required("Ingresá el destino")
      .when("destinoTipo", {
        is: DESTINO_TIPO.CBU,
        then: (schema) =>
          schema.matches(regexCbuCvu, "El CBU/CVU debe tener 22 dígitos"),
        otherwise: (schema) =>
          schema.matches(
            regexAlias,
            "El alias debe tener entre 6 y 20 caracteres: letras, números, punto o guión"
          ),
      }),
    monto: Yup.number()
      .typeError("Ingresá un monto")
      .required("Ingresá un monto")
      .positive("El monto debe ser mayor a 0"),
    motivoPago: Yup.string().required("Elegí un motivo"),
    metodoDePago: Yup.string().oneOf(["1", "2"]).required(),
    detalle: Yup.string().max(100, "Máximo 100 caracteres"),
    fechaProgramada: Yup.string(),
    emails: Yup.string().test(
      "emails",
      "Ingresá mails válidos separados por coma",
      (value) =>
        !value ||
        value
          .split(",")
          .map((mail) => mail.trim())
          .filter(Boolean)
          .every((mail) => emailSchema.isValidSync(mail))
    ),
  });
