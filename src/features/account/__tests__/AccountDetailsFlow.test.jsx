import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { ThemeProvider } from "styled-components";
import { lightTheme } from "../../../assets/themes";

const get = vi.fn();
const patch = vi.fn();
vi.mock("../../../lib/axiosInstance", () => ({
  default: {
    get: (...a) => get(...a),
    patch: (...a) => patch(...a),
    post: vi.fn(),
  },
}));

const { rootReducer } = await import("../../../store/store");
const { default: AccountDetailsFlow } =
  await import("../components/AccountDetailsFlow");

const account = {
  id: 1,
  cuentaIdExterno: "ext-1",
  cvu: "0000003100000000000001",
  alias: "actual.alias",
  aliasFreeze: false,
  aliasHabilitadoTexto: null,
};

const renderFlow = (overrides = {}, onClose = vi.fn()) => {
  const store = configureStore({ reducer: rootReducer });
  render(
    <Provider store={store}>
      <ThemeProvider theme={lightTheme}>
        <AccountDetailsFlow
          open
          onClose={onClose}
          account={{ ...account, ...overrides }}
        />
      </ThemeProvider>
    </Provider>
  );
  return { store, onClose };
};

describe("AccountDetailsFlow", () => {
  beforeEach(() => {
    get.mockReset();
    patch.mockReset();
    get.mockResolvedValue({ data: { code: 200, data: [] } });
  });

  it("shows alias and CVU", () => {
    renderFlow();
    expect(screen.getByText("actual.alias")).toBeTruthy();
    expect(screen.getByText("0000003100000000000001")).toBeTruthy();
  });

  it("warns instead of editing when the alias is frozen", () => {
    renderFlow({
      aliasFreeze: true,
      aliasHabilitadoTexto: "24/09/2026 a las 12:30",
    });
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    expect(
      screen.getByText(
        "Vas a poder cambiar tu alias el 24/09/2026 a las 12:30."
      )
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Modificar alias" })
    ).toBeNull();
  });

  it("updates the alias and refreshes the accounts", async () => {
    patch.mockResolvedValueOnce({
      data: { code: 200, data: { success: true } },
    });
    const { onClose } = renderFlow();
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.change(screen.getByPlaceholderText("Ingresá tu nuevo alias"), {
      target: { value: "nuevo.alias" },
    });
    const submit = screen.getByRole("button", { name: "Modificar alias" });
    await waitFor(() => expect(submit.disabled).toBe(false));
    fireEvent.click(submit);
    await waitFor(() =>
      expect(patch).toHaveBeenCalledWith("/v1/cuentas/ext-1", {
        alias: "nuevo.alias",
      })
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(get).toHaveBeenCalledWith("/v1/cuentas/me");
  });

  it("shows the API error and keeps the modal open", async () => {
    patch.mockRejectedValueOnce({
      response: { status: 400, data: { message: "alias en uso" } },
    });
    const { onClose } = renderFlow();
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.change(screen.getByPlaceholderText("Ingresá tu nuevo alias"), {
      target: { value: "otro.alias" },
    });
    const submit = screen.getByRole("button", { name: "Modificar alias" });
    await waitFor(() => expect(submit.disabled).toBe(false));
    fireEvent.click(submit);
    expect(await screen.findByText("alias en uso")).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });
});
