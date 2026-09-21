import PropTypes from "prop-types";
import styled, { useTheme } from "styled-components";
import { ArrowForwardSVG, OutlineWalletSVG } from "src/assets/SVGLibrarie";
import { Typography } from "src/components/Typography";

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.lightBlue[500]};
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.lightBlue[700]};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
`;

const ActivateCvuCard = ({ onActivate }) => {
  const theme = useTheme();

  return (
    <MainContainer>
      <ContentContainer>
        <HeaderRow>
          <OutlineWalletSVG
            width={24}
            height={24}
            fill={theme.colors.neutral[0]}
          />
          <Typography
            variant="regular"
            fontWeight="bold"
            color={theme.colors.neutral[0]}
          >
            Todavía no tenés una cuenta CVU
          </Typography>
        </HeaderRow>
        <Typography variant="small" color={theme.colors.lightBlue[100]}>
          Activá tu cuenta CVU para recibir dinero, transferir y programar
          pagos.
        </Typography>
      </ContentContainer>
      <ActionButton type="button" onClick={onActivate}>
        <Typography
          variant="regular"
          fontWeight="bold"
          color={theme.colors.neutral[0]}
        >
          Activar cuenta CVU
        </Typography>
        <ArrowForwardSVG
          width={24}
          height={24}
          fill={theme.colors.neutral[0]}
        />
      </ActionButton>
    </MainContainer>
  );
};

ActivateCvuCard.propTypes = {
  onActivate: PropTypes.func.isRequired,
};

export default ActivateCvuCard;
