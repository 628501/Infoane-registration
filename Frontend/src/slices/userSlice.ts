import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  name: string | null;
  email: string | null;
  token: string | null;
}

const initialState: UserState = {
  name: localStorage.getItem("UserName") || null,
  email: localStorage.getItem("UserEmail") || null,
  token: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
      localStorage.setItem("UserName", action.payload);
    },
    setUserEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
      localStorage.setItem("UserEmail", action.payload);
    },
    clearUser: (state) => {
      state.name = null;
      state.token = null;
      localStorage.removeItem("UserName");
      localStorage.removeItem("UserEmail");
    },
    tokenAcess: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
});

export const { setUser, clearUser, setUserEmail, tokenAcess } = userSlice.actions;
export default userSlice.reducer;
