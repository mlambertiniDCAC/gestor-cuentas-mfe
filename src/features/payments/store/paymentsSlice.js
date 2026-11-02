import { createSelector, createSlice } from "@reduxjs/toolkit";
import {
  AUTHORIZE_REJECTED_MESSAGE,
  PERMISSION_MOTIVO,
} from "src/lib/apiError";
import { MOVEMENT_STATUS } from "../lib/constants";
import {
  authorizeBatch,
  authorizePayment,
  cancelPayment,
  fetchMotivos,
  fetchMovements,
} from "./paymentsActions";
import { buildBatchMessage, splitMovements } from "./paymentsAdapters";

const initialState = {
  motivos: [],
  movements: [],
  status: "idle",
  error: null,
  errorForbidden: false,
  actionError: null,
  permissionRejected: {},
  lastRequestedCuentaCvuId: undefined,
};

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    clearActionError: (state) => {
      state.actionError = null;
    },
    clearPermissionRejected: (state) => {
      state.permissionRejected = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMotivos.fulfilled, (state, action) => {
        state.motivos = action.payload;
      })
      .addCase(fetchMovements.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.errorForbidden = false;
        if (action.meta.arg !== state.lastRequestedCuentaCvuId) {
          state.permissionRejected = {};
        }
        state.lastRequestedCuentaCvuId = action.meta.arg;
      })
      .addCase(fetchMovements.fulfilled, (state, action) => {
        if (action.meta.arg !== state.lastRequestedCuentaCvuId) return;
        state.status = "succeeded";
        state.movements = action.payload;
        const pendingIds = new Set(
          action.payload
            .filter((m) => m.estado === MOVEMENT_STATUS.EN_PROGRESO)
            .map((m) => String(m.id))
        );
        Object.keys(state.permissionRejected).forEach((id) => {
          if (!pendingIds.has(id)) delete state.permissionRejected[id];
        });
      })
      .addCase(fetchMovements.rejected, (state, action) => {
        if (action.meta.arg !== state.lastRequestedCuentaCvuId) return;
        state.status = "failed";
        state.error = action.payload ?? null;
        state.errorForbidden = action.meta.forbidden ?? false;
      })
      .addCase(authorizePayment.pending, (state) => {
        state.actionError = null;
      })
      .addCase(cancelPayment.pending, (state) => {
        state.actionError = null;
      })
      .addCase(authorizePayment.fulfilled, (state, action) => {
        delete state.permissionRejected[action.payload];
      })
      .addCase(authorizePayment.rejected, (state, action) => {
        state.actionError = action.payload ?? null;
        if (action.meta.motivo !== PERMISSION_MOTIVO.USUARIO_SIN_PERMISO) {
          return;
        }
        if (state.permissionRejected[action.meta.arg]) {
          state.actionError = AUTHORIZE_REJECTED_MESSAGE;
        }
        state.permissionRejected[action.meta.arg] = action.meta.motivo;
      })
      .addCase(authorizeBatch.pending, (state) => {
        state.actionError = null;
      })
      .addCase(authorizeBatch.fulfilled, (state, action) => {
        const { authorized, rejected } = action.payload;
        authorized.forEach((id) => delete state.permissionRejected[id]);
        rejected.forEach(({ id, motivo }) => {
          state.permissionRejected[id] = motivo;
        });
        state.actionError = buildBatchMessage(action.payload);
      })
      .addCase(authorizeBatch.rejected, (state, action) => {
        state.actionError = action.payload ?? null;
      })
      .addCase(cancelPayment.rejected, (state, action) => {
        state.actionError = action.payload ?? null;
      });
  },
});

export const selectSplitMovements = createSelector(
  (state) => state.payments.movements,
  (movements) => splitMovements(movements)
);

export const { clearActionError, clearPermissionRejected } =
  paymentsSlice.actions;
export default paymentsSlice.reducer;
