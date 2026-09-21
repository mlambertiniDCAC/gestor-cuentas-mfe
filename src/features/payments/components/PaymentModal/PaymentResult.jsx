import PropTypes from "prop-types";
import styled from "styled-components";
import { Button } from "src/components/Button";
import { Typography } from "src/components/Typography";
import { RESULT_KIND } from "../../lib/constants";

const TITLES = {
  [RESULT_KIND.SENT]: "Pago enviado",
  [RESULT_KIND.SCHEDULED]: "Pago programado",
  [RESULT_KIND.PENDING]: "Pago pendiente de autorización",
};

const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px;
  text-align: center;
`;

const PaymentResult = ({ kind, fechaTexto, onDone }) => (
  <Body>
    <Typography variant="h3" textAlign="center">
      {TITLES[kind]}
    </Typography>
    {kind === RESULT_KIND.SCHEDULED && (
      <Typography variant="regular" textAlign="center">
        Se va a ejecutar el {fechaTexto}.
      </Typography>
    )}
    {kind === RESULT_KIND.PENDING && (
      <Typography variant="regular" textAlign="center">
        Podés autorizarlo o cancelarlo desde Pagos.
      </Typography>
    )}
    <Button tone="brand" role="primary" type="button" onClick={onDone}>
      Listo
    </Button>
  </Body>
);

PaymentResult.propTypes = {
  kind: PropTypes.oneOf(Object.values(RESULT_KIND)).isRequired,
  fechaTexto: PropTypes.string,
  onDone: PropTypes.func.isRequired,
};

export default PaymentResult;
