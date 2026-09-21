import { useState } from "react";
import PropTypes from "prop-types";
import styled, { useTheme } from "styled-components";
import { EyeClosed, EyeOpen } from "src/assets/SVGLibrarie";
import { Typography } from "src/components/Typography";
import { Button } from "src/components/Button";

const OuterCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.neutral[50]};
`;

const InnerCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.neutral[0]};
`;

const BalanceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  border: 0;
  padding: 4px;
  background: transparent;
  cursor: pointer;
`;

const DataGrid = styled.dl`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 16px;
  margin: 0;

  dd {
    margin: 0;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

export const HIDDEN_BALANCE = "$ ••••••";

const WalletCard = ({ account, onShowDetails, onPay, onGoToPayments }) => {
  const theme = useTheme();
  const [hidden, setHidden] = useState(false);

  return (
    <OuterCard>
      <Typography
        variant="small"
        fontWeight="bold"
        color={theme.colors.neutral[600]}
      >
        Saldo disponible
      </Typography>
      <InnerCard>
        <BalanceRow>
          <Typography variant="h2">
            {hidden ? HIDDEN_BALANCE : `$ ${account.saldoFormateado}`}
          </Typography>
          <IconButton
            type="button"
            aria-label={hidden ? "Mostrar saldo" : "Ocultar saldo"}
            onClick={() => setHidden((prev) => !prev)}
          >
            {hidden ? <EyeClosed /> : <EyeOpen />}
          </IconButton>
        </BalanceRow>
        <DataGrid>
          <dt>
            <Typography variant="small" color={theme.colors.neutral[500]}>
              CVU
            </Typography>
          </dt>
          <dd>
            <Typography variant="regular" fontWeight="bold">
              {account.cvu}
            </Typography>
          </dd>
          <dt>
            <Typography variant="small" color={theme.colors.neutral[500]}>
              Alias
            </Typography>
          </dt>
          <dd>
            <Typography variant="regular" fontWeight="bold">
              {account.alias || "-"}
            </Typography>
          </dd>
        </DataGrid>
        <Actions>
          <Button
            tone="brand"
            role="secondary"
            type="button"
            onClick={onShowDetails}
          >
            Ver datos / Recibir
          </Button>
          <Button tone="brand" role="primary" type="button" onClick={onPay}>
            Pagar
          </Button>
          <Button
            tone="neutral"
            role="secondary"
            type="button"
            onClick={onGoToPayments}
          >
            Ver pagos
          </Button>
        </Actions>
      </InnerCard>
    </OuterCard>
  );
};

WalletCard.propTypes = {
  account: PropTypes.shape({
    cvu: PropTypes.string,
    alias: PropTypes.string,
    saldoFormateado: PropTypes.string,
  }).isRequired,
  onShowDetails: PropTypes.func.isRequired,
  onPay: PropTypes.func.isRequired,
  onGoToPayments: PropTypes.func.isRequired,
};

export default WalletCard;
