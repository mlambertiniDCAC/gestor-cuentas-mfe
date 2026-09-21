import { useState } from "react";
import PropTypes from "prop-types";
import styled, { useTheme } from "styled-components";
import { Typography } from "src/components/Typography";
import { CopySVG } from "src/assets/SVGLibrarie";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.neutral[100]};
  background: ${({ theme }) => theme.colors.neutral[0]};
`;

const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const ValueRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const EditButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.lightBlue[500]};
  font-weight: 600;
  font-size: 14px;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: ${({ theme }) => theme.colors.lightBlue[100]};
  border: 1px solid ${({ theme }) => theme.colors.neutral[100]};
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
`;

const AccountDetailField = ({ label, value, onEdit }) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator?.clipboard?.writeText?.(value ?? "")?.catch?.(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Container>
      <TextBlock>
        <Typography variant="small" color={theme.colors.neutral[500]}>
          {label}
        </Typography>
        <ValueRow>
          <Typography variant="regular" fontWeight="bold">
            {value || "-"}
          </Typography>
          {onEdit && (
            <EditButton type="button" onClick={onEdit}>
              Editar
            </EditButton>
          )}
        </ValueRow>
      </TextBlock>
      <IconButton
        type="button"
        onClick={handleCopy}
        aria-label={`Copiar ${label}`}
        title={copied ? "Copiado" : "Copiar"}
      >
        <CopySVG fill={theme.colors.blue[700]} />
      </IconButton>
    </Container>
  );
};

AccountDetailField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onEdit: PropTypes.func,
};

export default AccountDetailField;
