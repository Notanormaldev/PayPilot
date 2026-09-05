import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService } from '../services/dashboardService';

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const [kpis, trends] = await Promise.all([
        dashboardService.fetchKpis().catch(() => ({ data: null })),
        dashboardService.fetchTrends().catch(() => ({ data: [] })),
      ]);
      return { kpis: kpis?.data, trends: trends?.data || [] };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  kpis: null,
  trends: [],
  loading: false,
  error: null,
  selectedMonth: 'September 2026',
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setSelectedMonth: (state, action) => {
      state.selectedMonth = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.kpis) state.kpis = action.payload.kpis;
        state.trends = action.payload.trends;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedMonth } = dashboardSlice.actions;
export default dashboardSlice.reducer;
