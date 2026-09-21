import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Typography } from "src/components/Typography";
import { Button } from "src/components/Button";
import { logout } from "src/features/auth/authSlice";

const Bar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 24px;
  background: ${({ theme }) => theme.colors.neutral[0]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[100]};
`;

const Nav = styled.nav`
  display: flex;
  gap: 16px;

  a {
    color: ${({ theme }) => theme.colors.neutral[600]};
    text-decoration: none;
    font-weight: 600;
  }

  a.active {
    color: ${({ theme }) => theme.colors.blue[500]};
  }
`;

const Header = () => {
  const dispatch = useDispatch();

  return (
    <Bar>
      <Typography variant="h4">Mi cuenta CVU</Typography>
      <Nav>
        <NavLink to="/" end>
          Inicio
        </NavLink>
        <NavLink to="/pagos">Pagos</NavLink>
      </Nav>
      <Button
        tone="neutral"
        role="secondary"
        size="small"
        type="button"
        onClick={() => dispatch(logout())}
      >
        Cerrar sesión
      </Button>
    </Bar>
  );
};

export default Header;
