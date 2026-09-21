import { useEffect } from "react";
import styled, { ThemeProvider } from "styled-components";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import { lightTheme } from "./assets/themes";
import { ensureFonts } from "./lib/ensureFonts";
import Header from "./components/Layout/Header";
import LoginPage from "./features/auth/LoginPage";
import OnboardingPendingPage from "./features/auth/OnboardingPendingPage";
import Home from "./features/account/pages/Home";
import Payments from "./features/payments/pages/Payments";

const Main = styled.main`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
`;

const AuthenticatedApp = () => (
  <>
    <Header />
    <Main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pagos" element={<Payments />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Main>
  </>
);

const App = () => {
  const token = useSelector((state) => state.auth.token);
  const scope = useSelector((state) => state.auth.scope);

  useEffect(() => {
    ensureFonts();
  }, []);

  let content = <AuthenticatedApp />;
  if (!token) content = <LoginPage />;
  else if (scope === "onboarding") content = <OnboardingPendingPage />;

  return <ThemeProvider theme={lightTheme}>{content}</ThemeProvider>;
};

export default App;
