import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type Category = 'all' | 'cafes' | 'sandwiches' | 'bebidas' | 'dulces' | 'otros'

export interface ProductFiltersState {
  category: Category
  search: string
  sort: 'name' | 'price'
}

const initialState: ProductFiltersState = {
  category: 'all',
  search: '',
  sort: 'name',
}

const productFiltersSlice = createSlice({
  name: 'productFilters',
  initialState,
  reducers: {
    setCategory(state, action: PayloadAction<Category>) {
      state.category = action.payload
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
    },
    setSort(state, action: PayloadAction<ProductFiltersState['sort']>) {
      state.sort = action.payload
    },
    resetFilters() {
      return initialState
    },
  },
})

export const { setCategory, setSearch, setSort, resetFilters } = productFiltersSlice.actions
export default productFiltersSlice.reducer
