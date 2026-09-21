import PropTypes from "prop-types";
import styled from "styled-components";
import { Typography } from "src/components/Typography";
import StatusBadge from "./StatusBadge";

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 12px 8px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[100]};
  }

  th {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.neutral[500]};
  }
`;

const Amount = styled.td`
  font-weight: 600;
  color: ${({ $credit, theme }) => ($credit ? theme.colors.green[700] : theme.colors.neutral[700])};
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const MovementsTable = ({ movements, emptyText, dateField, renderActions }) => {
  if (!movements.length) {
    return <Typography variant="regular">{emptyText}</Typography>;
  }

  return (
    <Table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Destino / origen</th>
          <th>Concepto</th>
          <th>Monto</th>
          <th>Estado</th>
          {renderActions && <th />}
        </tr>
      </thead>
      <tbody>
        {movements.map((movement) => (
          <tr key={movement.id}>
            <td>{movement[dateField]}</td>
            <td>{movement.contraparte || "-"}</td>
            <td>{movement.detalle || "-"}</td>
            <Amount $credit={movement.esCredito}>
              {movement.montoFormateado}
            </Amount>
            <td>
              <StatusBadge estado={movement.estado ?? undefined} />
            </td>
            {renderActions && (
              <td>
                <Actions>{renderActions(movement)}</Actions>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

MovementsTable.propTypes = {
  movements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      contraparte: PropTypes.string,
      detalle: PropTypes.string,
      montoFormateado: PropTypes.string,
      esCredito: PropTypes.bool,
      estado: PropTypes.string,
    })
  ).isRequired,
  emptyText: PropTypes.string.isRequired,
  dateField: PropTypes.oneOf(["fechaTexto", "fechaEjecucionTexto"]).isRequired,
  renderActions: PropTypes.func,
};

export default MovementsTable;
