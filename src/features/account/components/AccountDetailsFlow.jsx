import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import AccountDetailsModal from "./AccountDetailsModal";
import EditAliasModal from "./EditAliasModal";
import { fetchMyAccounts, updateAlias } from "../store/accountActions";
import { resetAliasState } from "../store/accountSlice";

const AccountDetailsFlow = ({ open, onClose, account }) => {
  const dispatch = useDispatch();
  const { aliasStatus, aliasError } = useSelector((state) => state.account);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!open) {
      setEditing(false);
      dispatch(resetAliasState());
    }
  }, [open, dispatch]);

  const handleSubmit = async (alias) => {
    const result = await dispatch(
      updateAlias({ cuentaIdExterno: account.cuentaIdExterno, alias })
    );
    if (updateAlias.fulfilled.match(result)) {
      dispatch(fetchMyAccounts());
      onClose();
    }
  };

  return (
    <>
      <AccountDetailsModal
        open={open && !editing}
        onClose={onClose}
        alias={account.alias}
        cvu={account.cvu}
        aliasFreeze={account.aliasFreeze}
        aliasHabilitadoTexto={account.aliasHabilitadoTexto ?? undefined}
        onEditAlias={() => setEditing(true)}
      />
      <EditAliasModal
        open={open && editing}
        onClose={onClose}
        onBack={() => {
          dispatch(resetAliasState());
          setEditing(false);
        }}
        onSubmit={handleSubmit}
        initialAlias={account.alias}
        error={aliasError ?? undefined}
        submitting={aliasStatus === "loading"}
      />
    </>
  );
};

AccountDetailsFlow.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  account: PropTypes.shape({
    cuentaIdExterno: PropTypes.string.isRequired,
    alias: PropTypes.string,
    cvu: PropTypes.string,
    aliasFreeze: PropTypes.bool,
    aliasHabilitadoTexto: PropTypes.string,
  }).isRequired,
};

export default AccountDetailsFlow;
