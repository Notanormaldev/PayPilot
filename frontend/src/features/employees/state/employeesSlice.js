import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeeService } from '../services/employeeService';

export const fetchEmployees = createAsyncThunk('employees/fetchEmployees', async () => {
  const res = await employeeService.fetchEmployees();
  return res.data || [];
});

const initialState = {
  employees: [],
  selectedEmployee: null,
  loading: false,
  error: null,
};

export const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    selectEmployee: (state, action) => {
      state.selectedEmployee = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { selectEmployee } = employeesSlice.actions;
export default employeesSlice.reducer;
