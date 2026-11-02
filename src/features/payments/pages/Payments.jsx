import { useEffect, useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import Skeleton from "src/components/common/Skeleton";
import { InfoMessage } from "src/components/common/InfoMessage";
import { Button } from "src/components/Button";
import { Typography } from "src/components/Typography";
import Tabs from "src/components/Tabs";
import { fetchMyAccounts } from "src/features/account/store/accountActions";
import { selectSelectedAccount } from "src/features/account/store/accountSlice";
import {
  authorizeBatch,
  authorizePayment,
  cancelPayment,
  fetchMovements,
} from "../store/paymentsActions";
import {
  clearActionError,
  clearPermissionRejected,
  selectSplitMovements,
} from "../store/paymentsSlice";
import MovementsTable from "../components/MovementsTable";

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BATCH_BUSY = "batch";

const TAB = { PENDING: "pending", SCHEDULED: "scheduled", HISTORY: "history" };

const Payments = () => {
  const dispatch = useDispatch();
  const account = useSelector(selectSelectedAccount);
  const accountStatus = useSelector((state) => state.account.status);
  const accountError = useSelector((state) => state.account.error);
  const accountErrorForbidden = useSelector(
    (state) => state.account.errorForbidden
  );
  const { status, error, errorForbidden, actionError, permissionRejected } =
    useSelector((state) => state.payments);
  const { pending, scheduled, history } = useSelector(selectSplitMovements);
  const [activeTab, setActiveTab] = useState(TAB.PENDING);
  const [busyId, setBusyId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const selectedPending = selectedIds.filter((id) =>
    pending.some((m) => m.id === id)
  );

  useEffect(() => {
    if (accountStatus === "idle") dispatch(fetchMyAccounts());
  }, [accountStatus, dispatch]);

  useEffect(() => {
    if (account?.id) dispatch(fetchMovements(account.id));
  }, [account?.id, dispatch]);

  useEffect(() => () => dispatch(clearActionError()), [dispatch]);

  useEffect(() => () => dispatch(clearPermissionRejected()), [dispatch]);

  const toggleSelected = (id) =>
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );

  const toggleAll = () =>
    setSelectedIds(
      selectedPending.length === pending.length ? [] : pending.map((m) => m.id)
    );

  const runBatch = async () => {
    if (!selectedPending.length) return;
    setBusyId(BATCH_BUSY);
    const result = await dispatch(authorizeBatch(selectedPending));
    setBusyId(null);
    if (authorizeBatch.fulfilled.match(result)) {
      setSelectedIds([]);
      dispatch(fetchMovements(account.id));
      dispatch(fetchMyAccounts());
    }
  };

  const noteFor = (movement) =>
    permissionRejected[movement.id]
      ? "No autorizable por falta de permiso"
      : null;

  const runAction = async (thunk, id) => {
    setBusyId(id);
    const result = await dispatch(thunk(id));
    setBusyId(null);
    if (thunk.fulfilled.match(result)) {
      dispatch(fetchMovements(account.id));
      dispatch(fetchMyAccounts());
    }
  };

  const forbiddenMessage =
    accountStatus === "failed" && accountErrorForbidden
      ? accountError
      : status === "failed" && errorForbidden
        ? error
        : null;

  if (forbiddenMessage) {
    return (
      <Column>
        <Typography variant="h3">Pagos</Typography>
        <InfoMessage variant="warning" message={forbiddenMessage} />
      </Column>
    );
  }

  if (accountStatus !== "succeeded" && !account) {
    return <Skeleton width="100%" height="240px" />;
  }

  if (!account) {
    return (
      <Typography variant="regular">
        Todavía no tenés una cuenta CVU activa.
      </Typography>
    );
  }

  const tabs = [
    {
      id: TAB.PENDING,
      label: "Pendientes de autorizar",
      count: pending.length,
    },
    { id: TAB.SCHEDULED, label: "Programados", count: scheduled.length },
    { id: TAB.HISTORY, label: "Historial" },
  ];

  const renderPendingActions = (movement) => (
    <>
      <Button
        tone="brand"
        role="primary"
        size="small"
        type="button"
        loading={busyId === movement.id}
        disabled={busyId !== null}
        onClick={() => runAction(authorizePayment, movement.id)}
      >
        Autorizar
      </Button>
      <Button
        tone="neutral"
        role="secondary"
        size="small"
        type="button"
        disabled={busyId !== null}
        onClick={() => runAction(cancelPayment, movement.id)}
      >
        Cancelar
      </Button>
    </>
  );

  return (
    <Column>
      <Typography variant="h3">Pagos</Typography>
      <Tabs tabs={tabs} activeId={activeTab} onChange={setActiveTab} />
      {actionError && <InfoMessage variant="danger" message={actionError} />}
      {status === "failed" && !errorForbidden && (
        <Column>
          <InfoMessage variant="danger" message={error} />
          <Button
            tone="brand"
            role="secondary"
            type="button"
            onClick={() => dispatch(fetchMovements(account.id))}
          >
            Reintentar
          </Button>
        </Column>
      )}
      {status === "loading" &&
        !pending.length &&
        !scheduled.length &&
        !history.length && <Skeleton width="100%" height="160px" />}
      {status === "succeeded" && activeTab === TAB.PENDING && (
        <>
          {pending.length > 0 && (
            <Button
              tone="brand"
              role="primary"
              size="small"
              type="button"
              loading={busyId === BATCH_BUSY}
              disabled={busyId !== null}
              onClick={runBatch}
            >
              Autorizar seleccionados
            </Button>
          )}
          <MovementsTable
            movements={pending}
            emptyText="No tenés pagos pendientes de autorizar."
            dateField="fechaTexto"
            renderActions={renderPendingActions}
            noteFor={noteFor}
            selection={{
              selectedIds: selectedPending,
              onToggle: toggleSelected,
              onToggleAll: toggleAll,
              disabled: busyId !== null,
            }}
          />
        </>
      )}
      {status === "succeeded" && activeTab === TAB.SCHEDULED && (
        <MovementsTable
          movements={scheduled}
          emptyText="No tenés pagos programados."
          dateField="fechaEjecucionTexto"
        />
      )}
      {status === "succeeded" && activeTab === TAB.HISTORY && (
        <MovementsTable
          movements={history}
          emptyText="Todavía no hay movimientos."
          dateField="fechaTexto"
        />
      )}
    </Column>
  );
};

export default Payments;
