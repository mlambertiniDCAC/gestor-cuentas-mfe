import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../lib/axiosInstance";
import { authStorage } from "../../lib/authStorage";
import {
  getApiErrorMessage,
  isMissingPspIdentityError,
} from "../../lib/apiError";
import { fetchMyAccounts } from "../account/store/accountActions";

export const login = createAsyncThunk(
  "auth/login",
  async ({ mail, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/v1/auth/login", {
        mail,
        password,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: getApiErrorMessage(error),
        needsOnboarding: isMissingPspIdentityError(error),
      });
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await axiosInstance.post("/v1/auth/logout").catch(() => null);
});

const initialState = {
  token: authStorage.getToken(),
  scope: authStorage.getScope(),
  sujetoId: authStorage.getSujetoId(),
  status: "idle",
  error: null,
  needsOnboarding: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    markOnboarding: (state) => {
      authStorage.setScope("onboarding");
      state.scope = "onboarding";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.needsOnboarding = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        const { token, scope, sujetos } = action.payload;
        const sujetoId = sujetos?.[0]?.sujetoId ?? null;
        authStorage.setToken(token);
        authStorage.setScope(scope);
        authStorage.setSujetoId(sujetoId);
        state.token = token;
        state.scope = scope ?? null;
        state.sujetoId = sujetoId;
        state.status = "idle";
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message ?? null;
        state.needsOnboarding = Boolean(action.payload?.needsOnboarding);
      })
      .addCase(logout.fulfilled, (state) => {
        authStorage.clear();
        state.token = null;
        state.scope = null;
        state.sujetoId = null;
        state.status = "idle";
        state.error = null;
      })
      .addCase(fetchMyAccounts.rejected, (state, action) => {
        if (action.payload?.onboarding) {
          authStorage.setScope("onboarding");
          state.scope = "onboarding";
        }
      });
  },
});

export const { markOnboarding } = authSlice.actions;
export default authSlice.reducer;
