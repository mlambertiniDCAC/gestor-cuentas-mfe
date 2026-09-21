import { createSlice } from "@reduxjs/toolkit";
import { fetchMyAccounts, updateAlias } from "./accountActions";
import { pickDefaultAccountId } from "./accountAdapters";

const initialState = {
  items: [],
  selectedId: null,
  status: "idle",
  error: null,
  aliasStatus: "idle",
  aliasError: null,
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    selectAccount: (state, action) => {
      state.selectedId = action.payload;
    },
    resetAliasState: (state) => {
      state.aliasStatus = "idle";
      state.aliasError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAccounts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMyAccounts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "succeeded";
        const stillExists = action.payload.some(
          (a) => a.cuentaIdExterno === state.selectedId
        );
        if (!stillExists)
          state.selectedId = pickDefaultAccountId(action.payload);
      })
      .addCase(fetchMyAccounts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message ?? null;
      })
      .addCase(updateAlias.pending, (state) => {
        state.aliasStatus = "loading";
        state.aliasError = null;
      })
      .addCase(updateAlias.fulfilled, (state) => {
        state.aliasStatus = "idle";
      })
      .addCase(updateAlias.rejected, (state, action) => {
        state.aliasStatus = "failed";
        state.aliasError = action.payload ?? null;
      });
  },
});

export const selectSelectedAccount = (state) =>
  state.account.items.find(
    (a) => a.cuentaIdExterno === state.account.selectedId
  ) ?? null;

export const { selectAccount, resetAliasState } = accountSlice.actions;
export default accountSlice.reducer;
