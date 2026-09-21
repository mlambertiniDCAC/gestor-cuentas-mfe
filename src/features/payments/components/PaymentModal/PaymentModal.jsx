import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { format, parseISO } from "date-fns";
import Modal from "src/components/Modal/Modal";
import PaymentForm from "./PaymentForm";
import PaymentSummary from "./PaymentSummary";
import PaymentResult from "./PaymentResult";
import {
  authorizePayment,
  createPayment,
  fetchMotivos,
  fetchMovements,
} from "../../store/paymentsActions";
import { fetchMyAccounts } from "src/features/account/store/accountActions";
import { isFutureDate } from "../../lib/paymentSchema";
import { RESULT_KIND } from "../../lib/constants";

const STEP = { FORM: "form", SUMMARY: "summary", RESULT: "result" };

const fechaTexto = (fechaProgramada) =>
  fechaProgramada ? format(parseISO(fechaProgramada), "dd/MM/yyyy") : "Hoy";

const PaymentModal = ({ open, onClose, account }) => {
  const dispatch = useDispatch();
  const motivos = useSelector((state) => state.payments.motivos);
  const [step, setStep] = useState(STEP.FORM);
  const [values, setValues] = useState(null);
  const [created, setCreated] = useState(null);
  const [resultKind, setResultKind] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && !motivos.length) dispatch(fetchMotivos());
  }, [open, motivos.length, dispatch]);

  const reset = () => {
    setStep(STEP.FORM);
    setValues(null);
    setCreated(null);
    setResultKind(null);
    setError(null);
    setSubmitting(false);
  };

  const handleClose = () => {
    if (created) {
      dispatch(fetchMyAccounts());
      dispatch(fetchMovements(account.id));
    }
    reset();
    onClose();
  };

  const handleCreate = async (formValues) => {
    setError(null);
    setSubmitting(true);
    const result = await dispatch(
      createPayment({ values: formValues, cuentaCvuId: account.id })
    );
    setSubmitting(false);
    setValues(formValues);
    if (createPayment.fulfilled.match(result)) {
      setCreated(result.payload);
      setStep(STEP.SUMMARY);
      return;
    }
    setError(result.payload);
  };

  const handleAuthorize = async () => {
    setError(null);
    setSubmitting(true);
    const result = await dispatch(authorizePayment(created.movimientoId));
    setSubmitting(false);
    if (authorizePayment.fulfilled.match(result)) {
      setResultKind(
        isFutureDate(values.fechaProgramada)
          ? RESULT_KIND.SCHEDULED
          : RESULT_KIND.SENT
      );
      setStep(STEP.RESULT);
      return;
    }
    setError(result.payload);
  };

  const handleLeavePending = () => {
    setError(null);
    setResultKind(RESULT_KIND.PENDING);
    setStep(STEP.RESULT);
  };

  return (
    <Modal open={open} onClose={handleClose} title="Pagar" minWidth="640px">
      {step === STEP.FORM && (
        <PaymentForm
          motivos={motivos}
          initialValues={values ?? undefined}
          onSubmit={handleCreate}
          onCancel={handleClose}
          error={error ?? undefined}
          submitting={submitting}
        />
      )}
      {step === STEP.SUMMARY && (
        <PaymentSummary
          destino={values.destino.trim()}
          fechaTexto={fechaTexto(values.fechaProgramada)}
          result={created}
          error={error ?? undefined}
          submitting={submitting}
          onAuthorize={handleAuthorize}
          onLeavePending={handleLeavePending}
        />
      )}
      {step === STEP.RESULT && (
        <PaymentResult
          kind={resultKind}
          fechaTexto={fechaTexto(values.fechaProgramada)}
          onDone={handleClose}
        />
      )}
    </Modal>
  );
};

PaymentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  account: PropTypes.shape({ id: PropTypes.number.isRequired }).isRequired,
};

export default PaymentModal;
