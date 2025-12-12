import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FiltersState {
  selectedDate: string | null;
  status: string | null;
  productId: string | null;   // <--- NUEVO
}

const initialState: FiltersState = {
  selectedDate: null,
  status: null,
  productId: null,             // <--- NUEVO
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
    setProductId(state, action: PayloadAction<string | null>) {  // <--- NUEVO
      state.productId = action.payload;
    },
    resetFilters(state) {
      state.selectedDate = null;
      state.status = null;
      state.productId = null;     // <--- NUEVO
    }
  }
});

export const { setDate, setStatus, setProductId, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;
