import PropTypes from "prop-types";
import styled from "styled-components";
import { Button } from "src/components/Button";
import { InfoMessage } from "src/components/common/InfoMessage";
import { Typography } from "src/components/Typography";

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 32px;
`;

const Rows = styled.dl`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px 16px;
  margin: 0;

  dd {
    margin: 0;
    text-align: right;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 32px 24px;
`;

const PaymentSummary = ({
  destino,
  fechaTexto,
  result,
  error,
  submitting,
  onAuthorize,
  onLeavePending,
}) => (
  <>
    <Body>
      <Rows>
        <dt>
          <Typography variant="small">Destino</Typography>
        </dt>
        <dd>
          <Typography variant="regular" fontWeight="bold">
            {destino}
          </Typography>
        </dd>
        <dt>
          <Typography variant="small">Fecha</Typography>
        </dt>
        <dd>
          <Typography variant="regular">{fechaTexto}</Typography>
        </dd>
        <dt>
          <Typography variant="small">Monto a transferir</Typography>
        </dt>
        <dd>
          <Typography variant="regular">
            {result.montoTransferenciaTexto}
          </Typography>
        </dd>
        <dt>
          <Typography variant="small">Retención impositiva</Typography>
        </dt>
        <dd>
          <Typography variant="regular">
            {result.montoRetencionTexto}
          </Typography>
        </dd>
        <dt>
          <Typography variant="regular" fontWeight="bold">
            Total a debitar
          </Typography>
        </dt>
        <dd>
          <Typography variant="h4">{result.montoTotalTexto}</Typography>
        </dd>
      </Rows>
      {error && <InfoMessage variant="danger" message={error} />}
      {error && (
        <InfoMessage
          variant="info"
          message="El pago quedó creado y queda pendiente de autorización. Podés reintentar ahora o autorizarlo más tarde desde Pagos."
        />
      )}
    </Body>
    <Footer>
      <Button
        tone="neutral"
        role="secondary"
        type="button"
        onClick={onLeavePending}
        disabled={submitting}
      >
        Dejar pendiente
      </Button>
      <Button
        tone="brand"
        role="primary"
        type="button"
        onClick={onAuthorize}
        loading={submitting}
        disabled={submitting}
      >
        Autorizar
      </Button>
    </Footer>
  </>
);

PaymentSummary.propTypes = {
  destino: PropTypes.string.isRequired,
  fechaTexto: PropTypes.string.isRequired,
  result: PropTypes.shape({
    montoTransferenciaTexto: PropTypes.string,
    montoRetencionTexto: PropTypes.string,
    montoTotalTexto: PropTypes.string,
  }).isRequired,
  error: PropTypes.string,
  submitting: PropTypes.bool,
  onAuthorize: PropTypes.func.isRequired,
  onLeavePending: PropTypes.func.isRequired,
};

export default PaymentSummary;
