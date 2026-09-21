import PropTypes from "prop-types";
import styled from "styled-components";
import { Typography } from "src/components/Typography";

const Wrapper = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;

  select {
    height: 36px;
    padding: 0 8px;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  }
`;

const AccountSelector = ({ accounts, selectedId, onChange }) => (
  <Wrapper>
    <Typography variant="small">Cuenta</Typography>
    <select
      aria-label="Cuenta"
      value={selectedId ?? ""}
      onChange={(e) => onChange(e.target.value)}
    >
      {accounts.map((account) => (
        <option key={account.cuentaIdExterno} value={account.cuentaIdExterno}>
          {account.alias || account.cvu}
        </option>
      ))}
    </select>
  </Wrapper>
);

AccountSelector.propTypes = {
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      cuentaIdExterno: PropTypes.string.isRequired,
      alias: PropTypes.string,
      cvu: PropTypes.string,
    })
  ).isRequired,
  selectedId: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default AccountSelector;
