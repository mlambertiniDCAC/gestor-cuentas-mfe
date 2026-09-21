import { useMemo } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Formik, Form } from "formik";
import Modal from "src/components/Modal/Modal";
import { Button } from "src/components/Button";
import { InputForm } from "src/components/Form/InputForm";
import { InfoMessage } from "src/components/common/InfoMessage";
import CheckerAliasContainer from "./CheckerAliasContainer";
import { buildAliasValidationSchema } from "../lib/aliasRules";

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px;
  margin: 0 20px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.neutral[50]};
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  gap: 12px;
`;

const EditAliasModal = ({
  open,
  onClose,
  onBack,
  onSubmit,
  initialAlias = "",
  error,
  submitting,
}) => {
  const validationSchema = useMemo(
    () => buildAliasValidationSchema(initialAlias),
    [initialAlias]
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Modificar alias"
      minWidth="560px"
    >
      <Formik
        initialValues={{ alias: "" }}
        validationSchema={validationSchema}
        validateOnMount
        onSubmit={(values) => onSubmit(values.alias.trim())}
      >
        {({ values, setFieldValue, isValid, dirty }) => (
          <Form>
            <Body>
              <InputForm
                type="text"
                name="alias"
                label="Alias"
                value={values.alias}
                onChange={(name, value) => setFieldValue(name, value)}
                placeholder="Ingresá tu nuevo alias"
                description="Ingresá un alias que no hayas usado el último año."
              />
              <CheckerAliasContainer
                value={values.alias}
                currentAlias={initialAlias}
              />
              {error && <InfoMessage variant="danger" message={error} />}
            </Body>
            <Footer>
              <Button type="button" role="tiny" tone="brand" onClick={onBack}>
                Volver
              </Button>
              <Button
                type="submit"
                role="primary"
                tone="brand"
                size="medium"
                loading={submitting}
                disabled={!isValid || !dirty || submitting}
              >
                Modificar alias
              </Button>
            </Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

EditAliasModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialAlias: PropTypes.string,
  error: PropTypes.string,
  submitting: PropTypes.bool,
};

export default EditAliasModal;
