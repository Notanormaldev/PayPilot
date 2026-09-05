import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceService } from '../services/attendanceService';

export const fetchAttendanceData = createAsyncThunk(
  'attendance/fetchData',
  async () => {
    const [att, leaves] = await Promise.all([
      attendanceService.fetchAttendance().catch(() => ({ data: [] })),
      attendanceService.fetchLeaveRequests().catch(() => ({ data: [] })),
    ]);
    return { attendance: att.data || [], leaves: leaves.data || [] };
  }
);

export const approveLeave = createAsyncThunk(
  'attendance/approveLeave',
  async (requestId) => {
    await attendanceService.approveLeave(requestId);
    return requestId;
  }
);

export const punchAttendance = createAsyncThunk(
  'attendance/punch',
  async ({ employeeId, type }) => {
    const res = await attendanceService.recordPunch(employeeId, type);
    return res.data;
  }
);

const initialState = {
  attendances: [],
  leaveRequests: [],
  loading: false,
  approvingId: null,
  error: null,
};

export const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendanceData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAttendanceData.fulfilled, (state, action) => {
        state.loading = false;
        state.attendances = action.payload.attendance;
        state.leaveRequests = action.payload.leaves;
      })
      .addCase(fetchAttendanceData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(approveLeave.pending, (state, action) => {
        state.approvingId = action.meta.arg;
      })
      .addCase(approveLeave.fulfilled, (state, action) => {
        state.approvingId = null;
        state.leaveRequests = state.leaveRequests.map((r) =>
          r.id === action.payload ? { ...r, status: 'APPROVED' } : r
        );
      })
      .addCase(approveLeave.rejected, (state) => {
        state.approvingId = null;
      });
  },
});

export default attendanceSlice.reducer;
