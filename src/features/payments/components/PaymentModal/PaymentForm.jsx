import PropTypes from "prop-types";
import styled from "styled-components";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Button } from "src/components/Button";
import { InfoMessage } from "src/components/common/InfoMessage";
import { Typography } from "src/components/Typography";
import {
  buildPaymentSchema,
  PAYMENT_INITIAL_VALUES,
} from "../../lib/paymentSchema";
import { DESTINO_TIPO, METODO_DE_PAGO_OPTIONS } from "../../lib/constants";

const Body = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 24px 32px;

  input,
  select {
    height: 40px;
    padding: 0 12px;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  }
`;

const FieldBox = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;
  grid-column: ${({ $full }) => ($full ? "1 / -1" : "auto")};
`;

const Radios = styled.div`
  display: flex;
  gap: 16px;
  grid-column: 1 / -1;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 32px 24px;
`;

const ErrorText = ({ name }) => (
  <ErrorMessage name={name}>
    {(message) => (
      <Typography variant="small" color="#c0392b">
        {message}
      </Typography>
    )}
  </ErrorMessage>
);

ErrorText.propTypes = { name: PropTypes.string.isRequired };

const PaymentForm = ({
  motivos,
  initialValues,
  onSubmit,
  onCancel,
  error,
  submitting,
}) => (
  <Formik
    initialValues={initialValues ?? PAYMENT_INITIAL_VALUES}
    validationSchema={buildPaymentSchema(new Date())}
    onSubmit={onSubmit}
  >
    {({ values }) => (
      <Form noValidate>
        <Body>
          <Radios role="radiogroup" aria-label="Tipo de destino">
            <label>
              <Field
                type="radio"
                name="destinoTipo"
                value={DESTINO_TIPO.ALIAS}
              />{" "}
              Alias
            </label>
            <label>
              <Field type="radio" name="destinoTipo" value={DESTINO_TIPO.CBU} />{" "}
              CBU / CVU
            </label>
          </Radios>
          <FieldBox $full>
            <Typography variant="small">
              {values.destinoTipo === DESTINO_TIPO.CBU
                ? "CBU / CVU destino"
                : "Alias destino"}
            </Typography>
            <Field
              name="destino"
              aria-label={
                values.destinoTipo === DESTINO_TIPO.CBU
                  ? "CBU / CVU destino"
                  : "Alias destino"
              }
            />
            <ErrorText name="destino" />
          </FieldBox>
          <FieldBox>
            <Typography variant="small">Monto</Typography>
            <Field
              name="monto"
              type="number"
              min="0"
              step="0.01"
              aria-label="Monto"
            />
            <ErrorText name="monto" />
          </FieldBox>
          <FieldBox>
            <Typography variant="small">Motivo</Typography>
            <Field as="select" name="motivoPago" aria-label="Motivo">
              <option value="">Elegí un motivo</option>
              {motivos.map((motivo) => (
                <option key={motivo.codigo} value={motivo.codigo}>
                  {motivo.descripcion}
                </option>
              ))}
            </Field>
            <ErrorText name="motivoPago" />
          </FieldBox>
          <FieldBox>
            <Typography variant="small">Cuenta destino</Typography>
            <Field as="select" name="metodoDePago" aria-label="Cuenta destino">
              {METODO_DE_PAGO_OPTIONS.map((option) => (
                <option key={option.value} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </Field>
          </FieldBox>
          <FieldBox>
            <Typography variant="small">Fecha de pago (opcional)</Typography>
            <Field
              name="fechaProgramada"
              type="date"
              aria-label="Fecha de pago"
            />
            <ErrorText name="fechaProgramada" />
          </FieldBox>
          <FieldBox $full>
            <Typography variant="small">Concepto (opcional)</Typography>
            <Field name="detalle" aria-label="Concepto" />
            <ErrorText name="detalle" />
          </FieldBox>
          <FieldBox $full>
            <Typography variant="small">
              Avisar por mail a (opcional, separados por coma)
            </Typography>
            <Field name="emails" aria-label="Mails de aviso" />
            <ErrorText name="emails" />
          </FieldBox>
          {error && (
            <FieldBox $full as="div">
              <InfoMessage variant="danger" message={error} />
            </FieldBox>
          )}
        </Body>
        <Footer>
          <Button
            tone="neutral"
            role="secondary"
            type="button"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            tone="brand"
            role="primary"
            type="submit"
            loading={submitting}
            disabled={submitting}
          >
            Continuar
          </Button>
        </Footer>
      </Form>
    )}
  </Formik>
);

PaymentForm.propTypes = {
  motivos: PropTypes.arrayOf(
    PropTypes.shape({ codigo: PropTypes.string, descripcion: PropTypes.string })
  ).isRequired,
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  error: PropTypes.string,
  submitting: PropTypes.bool,
};

export default PaymentForm;
