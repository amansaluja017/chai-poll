import { createSlice } from "@reduxjs/toolkit";

const initialState = { status: false, accessToken: null };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.status = false;
      state.accessToken = null;
    },
    refresh: (state, action) => {
      state.accessToken = action.payload;
      state.status = true;
    }
  },
});

export const { logout, refresh } = userSlice.actions;

export default userSlice.reducer;
