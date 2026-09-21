import { useEffect, useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Skeleton from "src/components/common/Skeleton";
import { InfoMessage } from "src/components/common/InfoMessage";
import { Button } from "src/components/Button";
import { fetchMyAccounts } from "../store/accountActions";
import { selectAccount, selectSelectedAccount } from "../store/accountSlice";
import WalletCard from "../components/WalletCard";
import ActivateCvuCard from "../components/ActivateCvuCard";
import AccountSelector from "../components/AccountSelector";
import AccountDetailsFlow from "../components/AccountDetailsFlow";
import PaymentModal from "src/features/payments/components/PaymentModal/PaymentModal";
import { openOnboarding } from "src/lib/onboarding";

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, selectedId, status, error } = useSelector(
    (state) => state.account
  );
  const account = useSelector(selectSelectedAccount);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMyAccounts());
  }, [dispatch]);

  if (status === "idle" || (status === "loading" && !items.length)) {
    return <Skeleton width="100%" height="240px" />;
  }

  if (status === "failed") {
    return (
      <Column>
        <InfoMessage variant="danger" message={error} />
        <Button
          tone="brand"
          role="secondary"
          type="button"
          onClick={() => dispatch(fetchMyAccounts())}
        >
          Reintentar
        </Button>
      </Column>
    );
  }

  if (!account) {
    return <ActivateCvuCard onActivate={openOnboarding} />;
  }

  return (
    <Column>
      {items.length > 1 && (
        <AccountSelector
          accounts={items}
          selectedId={selectedId}
          onChange={(id) => dispatch(selectAccount(id))}
        />
      )}
      <WalletCard
        account={account}
        onShowDetails={() => setDetailsOpen(true)}
        onPay={() => setPayOpen(true)}
        onGoToPayments={() => navigate("/pagos")}
      />
      <AccountDetailsFlow
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        account={account}
      />
      <PaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        account={account}
      />
    </Column>
  );
};

export default Home;
