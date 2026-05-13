import { createSlice } from "@reduxjs/toolkit";

const localData = sessionStorage.getItem("userData")
  ? JSON.parse(sessionStorage.getItem("userData") as string)
  : null;
const localStatus = sessionStorage.getItem("status")
  ? JSON.parse(sessionStorage.getItem("status") as string)
  : false;

const initialState = { userData: localData, status: localStatus, accessToken: null };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.userData = action.payload.user;
      state.status = true;
      state.accessToken = action.payload.accessToken;
      sessionStorage.setItem("userData", JSON.stringify(action.payload.user));
      sessionStorage.setItem("status", JSON.stringify(true));
    },
    logout: (state) => {
      state.userData = null;
      state.status = false;
      state.accessToken = null;
      sessionStorage.clear();
      sessionStorage.setItem("status", JSON.stringify(false));
    },
    Update: (state, action) => {
      state.userData = action.payload;
      sessionStorage.setItem("userData", JSON.stringify(action.payload));
    },
    refresh: (state, action) => {
      state.accessToken = action.payload;
    }
  },
});

export const { login, logout, Update, refresh } = userSlice.actions;

export default userSlice.reducer;
