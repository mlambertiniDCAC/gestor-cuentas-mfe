import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "src/lib/axiosInstance";
import { unwrap } from "src/lib/apiResponse";
import {
  PERMISSION_MOTIVO,
  getApiErrorMessage,
  getPermissionMotivo,
  isForbidden,
} from "src/lib/apiError";
import { TRACKING_EVENTS, trackEvent } from "src/lib/tracking";
import {
  adaptBatchResult,
  adaptCreateResult,
  adaptMovement,
  buildCreatePayload,
} from "./paymentsAdapters";

const withApiError =
  (fn, onError) =>
  async (arg, { rejectWithValue }) => {
    try {
      return await fn(arg);
    } catch (error) {
      onError?.(error, arg);
      return rejectWithValue(getApiErrorMessage(error), {
        motivo: getPermissionMotivo(error),
        forbidden: isForbidden(error),
      });
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
  withApiError(
    async (id) => {
      trackEvent(TRACKING_EVENTS.authorizeClick());
      await axiosInstance.post(`/v1/movimientos/${id}/autorizar`);
      trackEvent(TRACKING_EVENTS.paymentReleased());
      return id;
    },
    (error) => {
      if (
        getPermissionMotivo(error) === PERMISSION_MOTIVO.USUARIO_SIN_PERMISO
      ) {
        trackEvent(TRACKING_EVENTS.authorizationRejected());
      }
    }
  )
);

export const authorizeBatch = createAsyncThunk(
  "payments/authorizeBatch",
  withApiError(async (ids) => {
    trackEvent(TRACKING_EVENTS.authorizeClick());
    const response = await axiosInstance.post(
      "/v1/movimientos/autorizar/batch",
      { ids }
    );
    const result = adaptBatchResult(unwrap(response));
    result.authorized.forEach(() =>
      trackEvent(TRACKING_EVENTS.paymentReleased())
    );
    result.rejected.forEach(() =>
      trackEvent(TRACKING_EVENTS.authorizationRejected())
    );
    return result;
  })
);

export const cancelPayment = createAsyncThunk(
  "payments/cancel",
  withApiError(async (id) => {
    await axiosInstance.post(`/v1/movimientos/${id}/cancelar`);
    return id;
  })
);
