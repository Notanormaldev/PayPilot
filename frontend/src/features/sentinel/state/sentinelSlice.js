import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sentinelService } from '../services/sentinelService';

export const fetchFlags = createAsyncThunk('sentinel/fetchFlags', async (status = 'OPEN') => {
  const res = await sentinelService.fetchFlags(status);
  return res.data || [];
});

export const resolveFlag = createAsyncThunk(
  'sentinel/resolveFlag',
  async ({ flagId, resolutionNotes }) => {
    await sentinelService.resolveFlag(flagId, resolutionNotes);
    return flagId;
  }
);

const initialState = {
  flags: [],
  loading: false,
  resolvingId: null,
  error: null,
};

export const sentinelSlice = createSlice({
  name: 'sentinel',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlags.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFlags.fulfilled, (state, action) => {
        state.loading = false;
        state.flags = action.payload;
      })
      .addCase(fetchFlags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(resolveFlag.pending, (state, action) => {
        state.resolvingId = action.meta.arg.flagId;
      })
      .addCase(resolveFlag.fulfilled, (state, action) => {
        state.resolvingId = null;
        state.flags = state.flags.filter((f) => f.id !== action.payload);
      })
      .addCase(resolveFlag.rejected, (state) => {
        state.resolvingId = null;
      });
  },
});

export default sentinelSlice.reducer;
