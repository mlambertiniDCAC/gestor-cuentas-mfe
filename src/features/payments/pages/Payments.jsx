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
  authorizePayment,
  cancelPayment,
  fetchMovements,
} from "../store/paymentsActions";
import { clearActionError, selectSplitMovements } from "../store/paymentsSlice";
import MovementsTable from "../components/MovementsTable";

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TAB = { PENDING: "pending", SCHEDULED: "scheduled", HISTORY: "history" };

const Payments = () => {
  const dispatch = useDispatch();
  const account = useSelector(selectSelectedAccount);
  const accountStatus = useSelector((state) => state.account.status);
  const { status, error, actionError } = useSelector((state) => state.payments);
  const { pending, scheduled, history } = useSelector(selectSplitMovements);
  const [activeTab, setActiveTab] = useState(TAB.PENDING);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (accountStatus === "idle") dispatch(fetchMyAccounts());
  }, [accountStatus, dispatch]);

  useEffect(() => {
    if (account?.id) dispatch(fetchMovements(account.id));
  }, [account?.id, dispatch]);

  useEffect(() => () => dispatch(clearActionError()), [dispatch]);

  const runAction = async (thunk, id) => {
    setBusyId(id);
    const result = await dispatch(thunk(id));
    setBusyId(null);
    if (thunk.fulfilled.match(result)) {
      dispatch(fetchMovements(account.id));
      dispatch(fetchMyAccounts());
    }
  };

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
      {status === "failed" && (
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
        <MovementsTable
          movements={pending}
          emptyText="No tenés pagos pendientes de autorizar."
          dateField="fechaTexto"
          renderActions={renderPendingActions}
        />
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
