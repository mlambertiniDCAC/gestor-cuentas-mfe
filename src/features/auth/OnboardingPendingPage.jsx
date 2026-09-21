import styled from "styled-components";
import { useDispatch } from "react-redux";
import { Typography } from "src/components/Typography";
import { Button } from "src/components/Button";
import { logout } from "./authSlice";
import { openOnboarding } from "src/lib/onboarding";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 80vh;
  padding: 24px;
  text-align: center;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
`;

const OnboardingPendingPage = () => {
  const dispatch = useDispatch();

  return (
    <Wrapper>
      <Typography variant="h3" textAlign="center">
        Tu cuenta todavía está en proceso de alta
      </Typography>
      <Typography variant="regular" textAlign="center">
        Completá el alta de tu cuenta CVU para empezar a operar.
      </Typography>
      <Actions>
        <Button
          tone="brand"
          role="primary"
          type="button"
          onClick={openOnboarding}
        >
          Completar alta
        </Button>
        <Button
          tone="neutral"
          role="secondary"
          type="button"
          onClick={() => dispatch(logout())}
        >
          Cerrar sesión
        </Button>
      </Actions>
    </Wrapper>
  );
};

export default OnboardingPendingPage;
