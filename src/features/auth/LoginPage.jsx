import { useEffect } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import { Typography } from "src/components/Typography";
import { Button } from "src/components/Button";
import { InfoMessage } from "src/components/common/InfoMessage";
import { login } from "./authSlice";

const Wrapper = styled.div`
  display: flex;
  min-height: 80vh;
  align-items: center;
  justify-content: center;
`;

const Card = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 360px;
  padding: 32px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.neutral[0]};
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};

  input {
    height: 40px;
    padding: 0 12px;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  }
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const lightError = "#c0392b";

const validationSchema = Yup.object({
  mail: Yup.string().email("Mail inválido").required("Ingresá tu mail"),
  password: Yup.string().required("Ingresá tu contraseña"),
});

const OnboardingLink = styled.a`
  align-self: center;
  color: ${({ theme }) => theme.colors.blue[500]};
  font-weight: 600;
`;

const LoginPage = () => {
  const dispatch = useDispatch();
  const { status, error, needsOnboarding } = useSelector((state) => state.auth);

  useEffect(() => {
    if (needsOnboarding) {
      window.open(__ONBOARDING_PSP_URL__, "_blank", "noopener,noreferrer");
    }
  }, [needsOnboarding]);

  return (
    <Wrapper>
      <Formik
        initialValues={{ mail: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={(values) => dispatch(login(values))}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
        }) => (
          <Card onSubmit={handleSubmit} noValidate>
            <Typography variant="h3">Mi cuenta CVU</Typography>
            <Field>
              <Typography variant="small">Mail</Typography>
              <input
                aria-label="Mail"
                type="email"
                name="mail"
                value={values.mail}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.mail && errors.mail && (
                <Typography variant="small" color={lightError}>
                  {errors.mail}
                </Typography>
              )}
            </Field>
            <Field>
              <Typography variant="small">Contraseña</Typography>
              <input
                aria-label="Contraseña"
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.password && errors.password && (
                <Typography variant="small" color={lightError}>
                  {errors.password}
                </Typography>
              )}
            </Field>
            {error && <InfoMessage variant="danger" message={error} />}
            {needsOnboarding && (
              <OnboardingLink
                href={__ONBOARDING_PSP_URL__}
                target="_blank"
                rel="noopener noreferrer"
              >
                Crear mi cuenta PSP
              </OnboardingLink>
            )}
            <Button
              tone="brand"
              role="primary"
              type="submit"
              loading={status === "loading"}
              disabled={status === "loading"}
            >
              Ingresar
            </Button>
          </Card>
        )}
      </Formik>
    </Wrapper>
  );
};

export default LoginPage;
