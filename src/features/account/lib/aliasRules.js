import * as Yup from "yup";
import { escapeRegex } from "src/lib/regex";

export const buildAliasRules = (currentAlias = "") => [
  { id: "length", label: "Usá entre 6 y 20 caracteres.", regex: /^.{6,20}$/ },
  {
    id: "allowed-chars",
    label: "Podés usar letras, números, punto y guión medio.",
    regex: /^[a-zA-Z0-9.-]+$/,
  },
  { id: "no-enie", label: 'No podés usar la letra "ñ".', regex: /^[^ñÑ]*$/ },
  {
    id: "not-current",
    label: "No podés usar tu alias actual.",
    regex: currentAlias
      ? new RegExp(`^(?!${escapeRegex(currentAlias)}$).+$`)
      : /^.+$/,
  },
];

export const buildAliasValidationSchema = (currentAlias = "") => {
  let aliasSchema = Yup.string().trim().required("Ingresá un alias");
  buildAliasRules(currentAlias).forEach((rule) => {
    aliasSchema = aliasSchema.matches(rule.regex, { message: rule.label });
  });
  return Yup.object({ alias: aliasSchema });
};
