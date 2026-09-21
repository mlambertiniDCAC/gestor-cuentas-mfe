import { createSelector, createSlice } from "@reduxjs/toolkit";
import {
  authorizePayment,
  cancelPayment,
  fetchMotivos,
  fetchMovements,
} from "./paymentsActions";
import { splitMovements } from "./paymentsAdapters";

const initialState = {
  motivos: [],
  movements: [],
  status: "idle",
  error: null,
  actionError: null,
  lastRequestedCuentaCvuId: undefined,
};

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    clearActionError: (state) => {
      state.actionError = null;
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
        state.lastRequestedCuentaCvuId = action.meta.arg;
      })
      .addCase(fetchMovements.fulfilled, (state, action) => {
        if (action.meta.arg !== state.lastRequestedCuentaCvuId) return;
        state.status = "succeeded";
        state.movements = action.payload;
      })
      .addCase(fetchMovements.rejected, (state, action) => {
        if (action.meta.arg !== state.lastRequestedCuentaCvuId) return;
        state.status = "failed";
        state.error = action.payload ?? null;
      })
      .addCase(authorizePayment.pending, (state) => {
        state.actionError = null;
      })
      .addCase(cancelPayment.pending, (state) => {
        state.actionError = null;
      })
      .addCase(authorizePayment.rejected, (state, action) => {
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

export const { clearActionError } = paymentsSlice.actions;
export default paymentsSlice.reducer;
