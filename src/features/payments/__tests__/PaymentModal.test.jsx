import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { ThemeProvider } from "styled-components";
import { addDays, format, parseISO } from "date-fns";
import { lightTheme } from "../../../assets/themes";

const get = vi.fn();
const post = vi.fn();
vi.mock("../../../lib/axiosInstance", () => ({
  default: {
    get: (...a) => get(...a),
    post: (...a) => post(...a),
    patch: vi.fn(),
  },
}));

const { rootReducer } = await import("../../../store/store");
const { default: PaymentModal } =
  await import("../components/PaymentModal/PaymentModal");

const account = {
  id: 7,
  cuentaIdExterno: "ext-7",
  cvu: "0000003100000000000007",
  alias: "mi.alias",
};

const renderModal = (onClose = vi.fn()) => {
  const store = configureStore({ reducer: rootReducer });
  render(
    <Provider store={store}>
      <ThemeProvider theme={lightTheme}>
        <PaymentModal open onClose={onClose} account={account} />
      </ThemeProvider>
    </Provider>
  );
  return { onClose };
};

const fillForm = async () => {
  await screen.findByRole("option", { name: "Honorarios" });
  fireEvent.change(screen.getByLabelText("Alias destino"), {
    target: { value: "prov.alias" },
  });
  fireEvent.change(screen.getByLabelText("Monto"), {
    target: { value: "100" },
  });
  fireEvent.change(screen.getByLabelText("Motivo"), {
    target: { value: "HON" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
};

describe("PaymentModal", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    get.mockImplementation((url) =>
      Promise.resolve(
        url === "/v1/motivos-pago"
          ? {
              data: {
                code: 200,
                data: [{ codigo: "HON", descripcion: "Honorarios" }],
              },
            }
          : { data: { code: 200, data: [] } }
      )
    );
  });

  it("creates, summarizes and authorizes an immediate payment", async () => {
    post.mockResolvedValueOnce({
      data: {
        code: 201,
        data: {
          movimientoId: 9,
          montoTransferencia: 100,
          montoRetencion: 3,
          montoTotal: 103,
        },
      },
    });
    post.mockResolvedValueOnce({
      data: { code: 200, data: { message: "ok" } },
    });
    renderModal();
    await fillForm();
    expect(await screen.findByText("$ 103,00")).toBeTruthy();
    expect(screen.getByText("$ 3,00")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Autorizar" }));
    expect(await screen.findByText("Pago enviado")).toBeTruthy();
    expect(post).toHaveBeenLastCalledWith("/v1/movimientos/9/autorizar");
  });

  it("leaves the payment pending", async () => {
    post.mockResolvedValueOnce({
      data: {
        code: 201,
        data: {
          movimientoId: 9,
          montoTransferencia: 100,
          montoRetencion: 0,
          montoTotal: 100,
        },
      },
    });
    renderModal();
    await fillForm();
    fireEvent.click(
      await screen.findByRole("button", { name: "Dejar pendiente" })
    );
    expect(
      await screen.findByText("Pago pendiente de autorización")
    ).toBeTruthy();
    expect(post).toHaveBeenCalledTimes(1);
  });

  it("shows the create error on the form", async () => {
    post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          message:
            "Error al procesar la retención impositiva. El movimiento ha sido cancelado.",
        },
      },
    });
    renderModal();
    await fillForm();
    expect(
      await screen.findByText(
        "Error al procesar la retención impositiva. El movimiento ha sido cancelado."
      )
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeTruthy();
  });

  it("keeps the summary when authorize fails", async () => {
    post.mockResolvedValueOnce({
      data: {
        code: 201,
        data: {
          movimientoId: 9,
          montoTransferencia: 100,
          montoRetencion: 0,
          montoTotal: 100,
        },
      },
    });
    post.mockRejectedValueOnce({
      response: { status: 400, data: { message: "Saldo insuficiente" } },
    });
    renderModal();
    await fillForm();
    fireEvent.click(await screen.findByRole("button", { name: "Autorizar" }));
    expect(await screen.findByText("Saldo insuficiente")).toBeTruthy();
    expect(screen.getByText(/queda pendiente de autorización/)).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Dejar pendiente" })
    ).toBeTruthy();
  });

  it("schedules a future payment when authorized", async () => {
    const fechaProgramada = format(addDays(new Date(), 5), "yyyy-MM-dd");
    post.mockResolvedValueOnce({
      data: {
        code: 201,
        data: {
          movimientoId: 9,
          montoTransferencia: 100,
          montoRetencion: 0,
          montoTotal: 100,
        },
      },
    });
    post.mockResolvedValueOnce({
      data: { code: 200, data: { message: "ok" } },
    });
    renderModal();
    await screen.findByRole("option", { name: "Honorarios" });
    fireEvent.change(screen.getByLabelText("Alias destino"), {
      target: { value: "prov.alias" },
    });
    fireEvent.change(screen.getByLabelText("Monto"), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText("Motivo"), {
      target: { value: "HON" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Elegir fecha" }));
    fireEvent.change(screen.getByLabelText("Fecha de pago"), {
      target: { value: fechaProgramada },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(await screen.findByRole("button", { name: "Autorizar" }));
    expect(await screen.findByText("Pago programado")).toBeTruthy();
    const fechaTexto = format(parseISO(fechaProgramada), "dd/MM/yyyy");
    expect(screen.getByText(`Se va a ejecutar el ${fechaTexto}.`)).toBeTruthy();
    expect(post.mock.calls[0][1]).toMatchObject({ fechaProgramada });
  });

  it("vuelve a Hoy y no manda la fecha que había quedado elegida", async () => {
    post.mockResolvedValueOnce({
      data: {
        code: 201,
        data: {
          movimientoId: 9,
          montoTransferencia: 100,
          montoRetencion: 0,
          montoTotal: 100,
        },
      },
    });
    post.mockResolvedValueOnce({
      data: { code: 200, data: { message: "ok" } },
    });
    renderModal();
    await screen.findByRole("option", { name: "Honorarios" });
    fireEvent.change(screen.getByLabelText("Alias destino"), {
      target: { value: "prov.alias" },
    });
    fireEvent.change(screen.getByLabelText("Monto"), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText("Motivo"), {
      target: { value: "HON" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Elegir fecha" }));
    fireEvent.change(screen.getByLabelText("Fecha de pago"), {
      target: { value: format(addDays(new Date(), 5), "yyyy-MM-dd") },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Hoy" }));
    expect(screen.queryByLabelText("Fecha de pago")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(await screen.findByRole("button", { name: "Autorizar" }));
    expect(await screen.findByText("Pago enviado")).toBeTruthy();
    expect(post.mock.calls[0][1]).not.toHaveProperty("fechaProgramada");
  });

  it("arranca en Hoy y pide la fecha cuando se elige programarlo", async () => {
    renderModal();
    await screen.findByRole("option", { name: "Honorarios" });
    expect(screen.getByRole("radio", { name: "Hoy" }).checked).toBe(true);
    expect(screen.queryByLabelText("Fecha de pago")).toBeNull();

    fireEvent.change(screen.getByLabelText("Alias destino"), {
      target: { value: "prov.alias" },
    });
    fireEvent.change(screen.getByLabelText("Monto"), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText("Motivo"), {
      target: { value: "HON" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Elegir fecha" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByText("Elegí una fecha")).toBeTruthy();
    expect(post).not.toHaveBeenCalled();
  });

  it("no muestra el selector de cuenta destino", async () => {
    renderModal();
    await screen.findByRole("option", { name: "Honorarios" });
    expect(screen.queryByLabelText("Cuenta destino")).toBeNull();
  });

  it("refreshes account and movements when closing after creating", async () => {
    post.mockResolvedValueOnce({
      data: {
        code: 201,
        data: {
          movimientoId: 9,
          montoTransferencia: 100,
          montoRetencion: 0,
          montoTotal: 100,
        },
      },
    });
    const { onClose } = renderModal();
    await fillForm();
    fireEvent.click(
      await screen.findByRole("button", { name: "Dejar pendiente" })
    );
    fireEvent.click(await screen.findByRole("button", { name: "Listo" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(get).toHaveBeenCalledWith("/v1/cuentas/me");
    expect(get).toHaveBeenCalledWith("/v1/movimientos", {
      params: { cuentaCvuId: 7 },
    });
  });
});
