import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  name: string | null;
  auth: string | null;
}

const initialState: UserState = {
  name: localStorage.getItem("UserName") || null,
  auth: localStorage.getItem("isAuthorised") || null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
      localStorage.setItem("UserName", action.payload);
    },
    clearUser: (state) => {
      state.name = null;
      localStorage.removeItem("UserName");
    },
    setAuth: (state, action: PayloadAction<string>) => {
      state.auth = action.payload;
      localStorage.setItem("isAuthorised", action.payload)
    }
  },
});

export const { setUser, clearUser, setAuth } = userSlice.actions;
export default userSlice.reducer;
