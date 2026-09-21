import PropTypes from "prop-types";
import styled from "styled-components";
import Checker from "src/components/Checker";
import { buildAliasRules } from "../lib/aliasRules";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
`;

const CheckerAliasContainer = ({ value = "", currentAlias = "" }) => (
  <Container>
    {buildAliasRules(currentAlias).map((rule) => (
      <Checker
        key={rule.id}
        value={value}
        regex={rule.regex}
        label={rule.label}
      />
    ))}
  </Container>
);

CheckerAliasContainer.propTypes = {
  value: PropTypes.string,
  currentAlias: PropTypes.string,
};

export default CheckerAliasContainer;
