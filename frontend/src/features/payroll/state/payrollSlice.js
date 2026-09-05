import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { payrollService } from '../services/payrollService';

export const fetchPayruns = createAsyncThunk('payroll/fetchPayruns', async () => {
  const res = await payrollService.fetchPayruns();
  return res.data || [];
});

export const computePayrun = createAsyncThunk('payroll/computePayrun', async (payrunId) => {
  const res = await payrollService.computePayrun(payrunId);
  return res.data;
});

const initialState = {
  payruns: [],
  loading: false,
  computing: false,
  error: null,
};

export const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayruns.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPayruns.fulfilled, (state, action) => {
        state.loading = false;
        state.payruns = action.payload;
      })
      .addCase(fetchPayruns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(computePayrun.pending, (state) => {
        state.computing = true;
      })
      .addCase(computePayrun.fulfilled, (state) => {
        state.computing = false;
      })
      .addCase(computePayrun.rejected, (state) => {
        state.computing = false;
      });
  },
});

export default payrollSlice.reducer;
