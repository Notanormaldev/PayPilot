import { useState, useEffect, useCallback, useRef } from 'react';
import { attendanceService } from '../../attendance/services/attendanceService';

const SHIFT_TARGET_SEC = 8 * 3600; // 8.0 Hours = 28,800 seconds
const MONTH_MAX_OT_SEC = 20 * 3600; // 20.0 Hours = 72,000 seconds
const HOURLY_RATE = 781.25; // ₹781.25 / hr (₹1,25,000 / 160h standard month)

export const useShiftAttendance = (employeeCode = 'EMP-8492') => {
  // 1. Checked In state
  const [checkedIn, setCheckedIn] = useState(() => {
    const saved = localStorage.getItem('paypilot_shift_checked_in');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // 2. Check In timestamp (ms)
  const [checkInTime, setCheckInTime] = useState(() => {
    const saved = localStorage.getItem('paypilot_shift_start');
    // Default initial mock check-in time: ~3h 44m 20s ago
    return saved ? parseInt(saved, 10) : Date.now() - (3 * 3600 + 44 * 60 + 20) * 1000;
  });

  // 3. Shift Completed Flag
  const [shiftCompleted, setShiftCompleted] = useState(() => {
    const saved = localStorage.getItem('paypilot_shift_today_completed');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // 4. Overtime Active Flag
  const [isOvertimeActive, setIsOvertimeActive] = useState(() => {
    const saved = localStorage.getItem('paypilot_is_overtime');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // 5. Overtime Start Time (ms)
  const [overtimeStartTime, setOvertimeStartTime] = useState(() => {
    const saved = localStorage.getItem('paypilot_overtime_start');
    return saved ? parseInt(saved, 10) : null;
  });

  // 6. Cumulative Overtime this month (in seconds)
  const [savedMonthOtSec, setSavedMonthOtSec] = useState(() => {
    const saved = localStorage.getItem('paypilot_month_overtime_sec');
    return saved ? parseInt(saved, 10) : 0; // Starts at 0 sec
  });

  // 7. Overtime Modal Trigger State
  const [overtimeModalOpen, setOvertimeModalOpen] = useState(false);
  const [punching, setPunching] = useState(false);

  // Live timer states
  const [nowTs, setNowTs] = useState(Date.now());
  const promptedRef = useRef(false);

  // Interval loop updating nowTs every second
  useEffect(() => {
    let interval = null;
    if (checkedIn) {
      interval = setInterval(() => {
        setNowTs(Date.now());
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [checkedIn]);

  // Calculations
  const rawElapsedSec = checkedIn && checkInTime ? Math.max(0, Math.floor((nowTs - checkInTime) / 1000)) : 0;

  // Regular shift elapsed is capped at 8 hours if in overtime mode
  const regularShiftSec = isOvertimeActive
    ? SHIFT_TARGET_SEC
    : Math.min(SHIFT_TARGET_SEC, rawElapsedSec);

  // Live Overtime seconds today
  let liveTodayOtSec = 0;
  if (isOvertimeActive && overtimeStartTime) {
    liveTodayOtSec = Math.max(0, Math.floor((nowTs - overtimeStartTime) / 1000));
  } else if (rawElapsedSec > SHIFT_TARGET_SEC) {
    // If worked > 8h but haven't officially clicked yes to OT
    liveTodayOtSec = 0;
  }

  // Total month overtime (saved previous sessions + current active OT)
  const totalMonthOtSec = Math.min(MONTH_MAX_OT_SEC, savedMonthOtSec + liveTodayOtSec);
  const remainingOtSec = Math.max(0, MONTH_MAX_OT_SEC - totalMonthOtSec);

  // Percentages
  const shiftPercent = Math.min(100, Math.round((regularShiftSec / SHIFT_TARGET_SEC) * 100));
  const overtimePercent = Math.min(100, Math.round((totalMonthOtSec / MONTH_MAX_OT_SEC) * 100));

  // Overtime Earnings (₹)
  const overtimeHours = (totalMonthOtSec / 3600);
  const overtimeEarnings = (overtimeHours * HOURLY_RATE).toFixed(2);
  const todayOtHours = (liveTodayOtSec / 3600).toFixed(2);
  const todayOtEarnings = ((liveTodayOtSec / 3600) * HOURLY_RATE).toFixed(2);

  // Auto-detect when shift completes (>= 8.0h) while employee is still logged in and not yet in OT
  useEffect(() => {
    if (checkedIn && rawElapsedSec >= SHIFT_TARGET_SEC && !isOvertimeActive) {
      const todayKey = `paypilot_ot_prompted_${new Date().toDateString()}`;
      const alreadyPrompted = localStorage.getItem(todayKey);
      if (!alreadyPrompted && !promptedRef.current) {
        promptedRef.current = true;
        setOvertimeModalOpen(true);
        localStorage.setItem(todayKey, 'true');
      }
    }
  }, [checkedIn, rawElapsedSec, isOvertimeActive]);

  // Start Overtime Action
  const startOvertime = useCallback(() => {
    const now = Date.now();
    setIsOvertimeActive(true);
    setOvertimeStartTime(now);
    setOvertimeModalOpen(false);

    localStorage.setItem('paypilot_is_overtime', 'true');
    localStorage.setItem('paypilot_overtime_start', now.toString());
  }, []);

  // Stop / Pause Overtime Action
  const stopOvertime = useCallback(() => {
    if (isOvertimeActive && overtimeStartTime) {
      const sessionOtSec = Math.max(0, Math.floor((Date.now() - overtimeStartTime) / 1000));
      const newMonthOt = Math.min(MONTH_MAX_OT_SEC, savedMonthOtSec + sessionOtSec);
      setSavedMonthOtSec(newMonthOt);
      localStorage.setItem('paypilot_month_overtime_sec', newMonthOt.toString());
    }
    setIsOvertimeActive(false);
    setOvertimeStartTime(null);
    localStorage.setItem('paypilot_is_overtime', 'false');
    localStorage.removeItem('paypilot_overtime_start');
  }, [isOvertimeActive, overtimeStartTime, savedMonthOtSec]);

  // Toggle Punch (Clock In / Clock Out)
  const togglePunch = useCallback(async () => {
    setPunching(true);
    const newCheckedIn = !checkedIn;
    const now = Date.now();

    try {
      await attendanceService.recordPunch(employeeCode, newCheckedIn ? 'CHECK_IN' : 'CHECK_OUT');
    } catch (e) {
      console.warn('Punch recording fallback:', e.message);
    } finally {
      setPunching(false);
    }

    if (!newCheckedIn) {
      // Punching OUT
      if (isOvertimeActive && overtimeStartTime) {
        const sessionOtSec = Math.max(0, Math.floor((now - overtimeStartTime) / 1000));
        const newMonthOt = Math.min(MONTH_MAX_OT_SEC, savedMonthOtSec + sessionOtSec);
        setSavedMonthOtSec(newMonthOt);
        localStorage.setItem('paypilot_month_overtime_sec', newMonthOt.toString());
      }
      setCheckedIn(false);
      setShiftCompleted(true);
      setIsOvertimeActive(false);
      setOvertimeStartTime(null);

      localStorage.setItem('paypilot_shift_checked_in', 'false');
      localStorage.setItem('paypilot_shift_today_completed', 'true');
      localStorage.setItem('paypilot_is_overtime', 'false');
      localStorage.removeItem('paypilot_shift_start');
      localStorage.removeItem('paypilot_overtime_start');
    } else {
      // Punching IN
      setCheckedIn(true);
      setShiftCompleted(false);
      setCheckInTime(now);
      setIsOvertimeActive(false);
      setOvertimeStartTime(null);

      localStorage.setItem('paypilot_shift_checked_in', 'true');
      localStorage.setItem('paypilot_shift_today_completed', 'false');
      localStorage.setItem('paypilot_shift_start', now.toString());
      localStorage.setItem('paypilot_is_overtime', 'false');
      localStorage.removeItem('paypilot_overtime_start');
    }
  }, [checkedIn, isOvertimeActive, overtimeStartTime, savedMonthOtSec, employeeCode]);

  // Testing & Simulation Helpers
  const simulateShiftCompleted = useCallback(() => {
    // Fast-forward checkin time so elapsedSec = 8h 00m 05s
    const targetCheckIn = Date.now() - (8 * 3600 + 5) * 1000;
    setCheckInTime(targetCheckIn);
    setCheckedIn(true);
    setShiftCompleted(false);
    setIsOvertimeActive(false);
    localStorage.setItem('paypilot_shift_checked_in', 'true');
    localStorage.setItem('paypilot_shift_start', targetCheckIn.toString());
    localStorage.removeItem(`paypilot_ot_prompted_${new Date().toDateString()}`);
    promptedRef.current = false;
    setOvertimeModalOpen(true);
  }, []);

  const resetMonthOvertime = useCallback(() => {
    setSavedMonthOtSec(0);
    setIsOvertimeActive(false);
    setOvertimeStartTime(null);
    localStorage.setItem('paypilot_month_overtime_sec', '0');
    localStorage.setItem('paypilot_is_overtime', 'false');
    localStorage.removeItem('paypilot_overtime_start');
  }, []);

  // Formatters
  const formatTimer = (totalSec) => {
    const hrs = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSec % 60).padStart(2, '0');
    return `${hrs} : ${mins} : ${secs}`;
  };

  const formatHoursMinutes = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')} Hours`;
  };

  const checkInDisplayStr = checkInTime && checkedIn
    ? new Date(checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '09:30 AM';

  return {
    checkedIn,
    checkInTime,
    checkInDisplayStr,
    shiftCompleted,
    rawElapsedSec,
    regularShiftSec,
    isOvertimeActive,
    overtimeStartTime,
    liveTodayOtSec,
    totalMonthOtSec,
    remainingOtSec,
    shiftPercent,
    overtimePercent,
    overtimeHours: overtimeHours.toFixed(1),
    remainingOtHours: (remainingOtSec / 3600).toFixed(1),
    overtimeEarnings,
    todayOtHours,
    todayOtEarnings,
    hourlyRate: HOURLY_RATE,
    punching,
    overtimeModalOpen,
    setOvertimeModalOpen,
    startOvertime,
    stopOvertime,
    togglePunch,
    simulateShiftCompleted,
    resetMonthOvertime,
    formatTimer,
    formatHoursMinutes,
  };
};
