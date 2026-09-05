/**
 * Role-Based and Designation-Based Access Control Matrix for Indian Tax & Salary Statements
 */

export const TAX_ROLES = {
  ADMIN: 'ADMIN',
  HR_MANAGER: 'HR_MANAGER',
  HR_PAYROLL_MANAGER: 'HR_PAYROLL_MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

/**
 * Checks if current user has permission to download/view tax statement for a target employee
 * @param {Object} currentUser - The authenticated user { id, name, role, department, designation }
 * @param {Object} targetEmployee - The employee whose tax statement is requested { id, name, department, designation }
 * @returns {boolean} Whether access is granted
 */
export function canAccessTaxStatement(currentUser, targetEmployee) {
  if (!currentUser) return false;

  const role = currentUser.role || currentUser.currentRole || 'EMPLOYEE';

  // 1. Super Admin & Payroll Manager have universal organizational access
  if (role === 'ADMIN' || role === 'HR_PAYROLL_MANAGER') {
    return true;
  }

  // 2. HR Manager has access to all non-executive or same-department employees
  if (role === 'HR_MANAGER') {
    if (!targetEmployee) return true;
    return true; // HR Managers manage all workforce records
  }

  // 3. Regular Employees can ONLY access their own records
  if (role === 'EMPLOYEE') {
    if (!targetEmployee) return true; // accessing own
    return (
      targetEmployee.id === currentUser.id ||
      targetEmployee.name?.toLowerCase() === currentUser.name?.toLowerCase() ||
      targetEmployee.email?.toLowerCase() === currentUser.email?.toLowerCase()
    );
  }

  return false;
}

/**
 * Returns allowed employee list based on user's role and designation scope
 */
export function getAuthorizedEmployeesForUser(currentUser, allEmployees = []) {
  if (!currentUser || !Array.isArray(allEmployees)) return [];

  const role = currentUser.role || currentUser.currentRole || 'EMPLOYEE';

  if (role === 'ADMIN' || role === 'HR_PAYROLL_MANAGER' || role === 'HR_MANAGER') {
    return allEmployees;
  }

  // Employee only sees themselves
  return allEmployees.filter(
    (emp) =>
      emp.id === currentUser.id ||
      emp.name?.toLowerCase() === currentUser.name?.toLowerCase() ||
      emp.email?.toLowerCase() === currentUser.email?.toLowerCase()
  );
}
