import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import accountReducer from "../features/account/store/accountSlice";
import paymentsReducer from "../features/payments/store/paymentsSlice";
import { login, logout } from "../features/auth/authSlice";

const appReducer = combineReducers({
  auth: authReducer,
  account: accountReducer,
  payments: paymentsReducer,
});

export const rootReducer = (state, action) => {
  const reset =
    action.type === logout.fulfilled.type ||
    action.type === login.fulfilled.type;
  return appReducer(reset ? { auth: state?.auth } : state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.DEV,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
