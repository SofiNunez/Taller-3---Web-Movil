import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FiltersState {
  selectedDate: string | null;
  status: string | null;
}

const initialState: FiltersState = {
  selectedDate: null,
  status: null,
};

export const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setDate(state, action: PayloadAction<string | null>) {
      state.selectedDate = action.payload;
    },
    setStatus(state, action: PayloadAction<string | null>) {
      state.status = action.payload;
    },
    resetFilters(state) {
      state.selectedDate = null;
      state.status = null;
    }
  }
});

export const { setDate, setStatus, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;
