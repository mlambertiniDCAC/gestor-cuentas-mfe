import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "src/lib/axiosInstance";
import { unwrap } from "src/lib/apiResponse";
import { getApiErrorMessage } from "src/lib/apiError";
import {
  adaptCreateResult,
  adaptMovement,
  buildCreatePayload,
} from "./paymentsAdapters";

const withApiError =
  (fn) =>
  async (arg, { rejectWithValue }) => {
    try {
      return await fn(arg);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  };

export const fetchMotivos = createAsyncThunk(
  "payments/fetchMotivos",
  withApiError(async () => {
    const response = await axiosInstance.get("/v1/motivos-pago");
    return unwrap(response) ?? [];
  })
);

export const fetchMovements = createAsyncThunk(
  "payments/fetchMovements",
  withApiError(async (cuentaCvuId) => {
    const response = await axiosInstance.get("/v1/movimientos", {
      params: { cuentaCvuId },
    });
    const list = unwrap(response);
    return Array.isArray(list) ? list.map(adaptMovement) : [];
  })
);

export const createPayment = createAsyncThunk(
  "payments/create",
  withApiError(async ({ values, cuentaCvuId }) => {
    const response = await axiosInstance.post(
      "/v1/movimientos",
      buildCreatePayload(values, cuentaCvuId)
    );
    return adaptCreateResult(unwrap(response));
  })
);

export const authorizePayment = createAsyncThunk(
  "payments/authorize",
  withApiError(async (id) => {
    await axiosInstance.post(`/v1/movimientos/${id}/autorizar`);
    return id;
  })
);

export const cancelPayment = createAsyncThunk(
  "payments/cancel",
  withApiError(async (id) => {
    await axiosInstance.post(`/v1/movimientos/${id}/cancelar`);
    return id;
  })
);
