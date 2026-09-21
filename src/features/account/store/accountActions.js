import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "src/lib/axiosInstance";
import { unwrap } from "src/lib/apiResponse";
import { getApiErrorMessage, isOnboardingScopeError } from "src/lib/apiError";
import { adaptAccounts } from "./accountAdapters";

export const fetchMyAccounts = createAsyncThunk(
  "account/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/v1/cuentas/me");
      return adaptAccounts(unwrap(response));
    } catch (error) {
      return rejectWithValue({
        message: getApiErrorMessage(error),
        onboarding: isOnboardingScopeError(error),
      });
    }
  }
);

export const updateAlias = createAsyncThunk(
  "account/updateAlias",
  async ({ cuentaIdExterno, alias }, { rejectWithValue }) => {
    try {
      await axiosInstance.patch(`/v1/cuentas/${cuentaIdExterno}`, { alias });
      return { cuentaIdExterno, alias };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);
