import PropTypes from "prop-types";
import styled from "styled-components";
import { STATUS_LABEL, STATUS_TONE } from "../lib/constants";

const palette = (theme) => ({
  success: [theme.colors.green[50], theme.colors.green[700]],
  danger: [theme.colors.red[50], theme.colors.red[700]],
  warning: [theme.colors.yellow[50], theme.colors.yellow[900]],
  info: [theme.colors.lightBlue[50], theme.colors.lightBlue[900]],
  neutral: [theme.colors.neutral[100], theme.colors.neutral[700]],
});

const Badge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ theme, $tone }) => palette(theme)[$tone][0]};
  color: ${({ theme, $tone }) => palette(theme)[$tone][1]};
`;

const StatusBadge = ({ estado }) => (
  <Badge $tone={STATUS_TONE[estado] ?? "neutral"}>
    {STATUS_LABEL[estado] ?? estado ?? "-"}
  </Badge>
);

StatusBadge.propTypes = {
  estado: PropTypes.string,
};

export default StatusBadge;
