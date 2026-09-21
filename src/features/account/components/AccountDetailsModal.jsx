import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import styled, { useTheme } from "styled-components";
import Modal from "src/components/Modal/Modal";
import { Button } from "src/components/Button";
import { InfoMessage } from "src/components/common/InfoMessage";
import { Typography } from "src/components/Typography";
import AccountDetailField from "./AccountDetailField";

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 32px;
  margin: 0 20px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.neutral[50]};
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 20px;
`;

const buildFreezeMessage = (habilitadoTexto) =>
  habilitadoTexto
    ? `Vas a poder cambiar tu alias el ${habilitadoTexto}.`
    : "Modificaste tu alias hace poco. Vas a poder cambiarlo nuevamente en unos días.";

const AccountDetailsModal = ({
  open,
  onClose,
  alias,
  cvu,
  aliasFreeze,
  aliasHabilitadoTexto,
  onEditAlias,
}) => {
  const theme = useTheme();
  const [showFreezeWarning, setShowFreezeWarning] = useState(false);

  useEffect(() => {
    if (!open) setShowFreezeWarning(false);
  }, [open]);

  const handleEditAlias = () => {
    if (aliasFreeze) {
      setShowFreezeWarning(true);
      return;
    }
    onEditAlias();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Datos de tu cuenta CVU"
      minWidth="560px"
      backgroundColor={theme.colors.neutral[0]}
    >
      <Body>
        <Typography variant="small">
          Compartí estos datos para recibir transferencias.
        </Typography>
        <AccountDetailField
          label="Alias"
          value={alias}
          onEdit={handleEditAlias}
        />
        <AccountDetailField label="CVU" value={cvu} />
        {showFreezeWarning && (
          <InfoMessage
            variant="warning"
            message={buildFreezeMessage(aliasHabilitadoTexto)}
          />
        )}
      </Body>
      <Footer>
        <Button
          onClick={onClose}
          tone="brand"
          role="primary"
          size="medium"
          type="button"
        >
          Entendido
        </Button>
      </Footer>
    </Modal>
  );
};

AccountDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  alias: PropTypes.string,
  cvu: PropTypes.string,
  aliasFreeze: PropTypes.bool,
  aliasHabilitadoTexto: PropTypes.string,
  onEditAlias: PropTypes.func.isRequired,
};

export default AccountDetailsModal;
