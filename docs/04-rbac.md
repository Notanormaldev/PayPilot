# HRMS OXP — RBAC (Role-Based Access Control)

> Defines the five roles, their permissions per resource, and the implementation strategy using **Clerk** for identity and a custom **Express middleware** for enforcement.

---

## 1. The Five Roles

Exact names from the hackathon brief — used everywhere (database, UI, middleware, seed data).

| Role | Enum Value | Description |
|---|---|---|
| **Employee** | `EMPLOYEE` | Self-service: own attendance, leave, payslips |
| **HR Manager** | `HR_MANAGER` | Full HR operations: employees, contracts, schedules, attendance, leave approvals |
| **HR Payroll User** | `HR_PAYROLL_USER` | HR Manager capabilities + payrun processing |
| **HR Payroll Manager** | `HR_PAYROLL_MANAGER` | Payroll User capabilities + salary structure/rule config + Mark Paid |
| **Admin** | `ADMIN` | Full access + user management |

> **Inheritance:** Each role is a strict superset of the role above it, except Employee ↔ HR Manager (parallel paths that converge at Payroll User).

```
Admin
  └── HR Payroll Manager
        └── HR Payroll User
              ├── HR Manager
              └── (Payroll-specific capabilities)
```

---

## 2. Permission Matrix

### Core HR

| Resource | Action | EMPLOYEE | HR_MANAGER | HR_PAYROLL_USER | HR_PAYROLL_MANAGER | ADMIN |
|---|---|:---:|:---:|:---:|:---:|:---:|
| Employee | Read all | ✗ | ✓ | ✓ | ✓ | ✓ |
| Employee | Read own | ✓ | ✓ | ✓ | ✓ | ✓ |
| Employee | Create/Update/Delete | ✗ | ✓ | ✓ | ✓ | ✓ |
| Contract | Read all | ✗ | ✓ | ✓ | ✓ | ✓ |
| Contract | Read own | ✓ | ✓ | ✓ | ✓ | ✓ |
| Contract | Create/Update | ✗ | ✓ | ✓ | ✓ | ✓ |
| Contract | Delete | ✗ | ✗ | ✗ | ✓ | ✓ |
| Working Schedule | Read | ✗ | ✓ | ✓ | ✓ | ✓ |
| Working Schedule | Create/Update/Delete | ✗ | ✓ | ✓ | ✓ | ✓ |

### Attendance & Time Off

| Resource | Action | EMPLOYEE | HR_MANAGER | HR_PAYROLL_USER | HR_PAYROLL_MANAGER | ADMIN |
|---|---|:---:|:---:|:---:|:---:|:---:|
| Attendance | Read all | ✗ | ✓ | ✓ | ✓ | ✓ |
| Attendance | Read own | ✓ | ✓ | ✓ | ✓ | ✓ |
| Attendance | Check-in/out (own) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Attendance | Correct (any) | ✗ | ✓ | ✓ | ✓ | ✓ |
| Time Off Type | Read | ✓ | ✓ | ✓ | ✓ | ✓ |
| Time Off Type | Create/Update/Delete | ✗ | ✓ | ✓ | ✓ | ✓ |
| Time Off Allocation | Read own | ✓ | ✓ | ✓ | ✓ | ✓ |
| Time Off Allocation | Manage (all) | ✗ | ✓ | ✓ | ✓ | ✓ |
| Time Off Request | Create (own) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Time Off Request | Read (own) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Time Off Request | Read (all) | ✗ | ✓ | ✓ | ✓ | ✓ |
| Time Off Request | Approve/Refuse | ✗ | ✓ | ✓ | ✓ | ✓ |

### Payroll

| Resource | Action | EMPLOYEE | HR_MANAGER | HR_PAYROLL_USER | HR_PAYROLL_MANAGER | ADMIN |
|---|---|:---:|:---:|:---:|:---:|:---:|
| Salary Structure | Read | ✗ | ✗ | ✓ (read-only) | ✓ | ✓ |
| Salary Structure | Create/Update/Delete | ✗ | ✗ | ✗ | ✓ | ✓ |
| Salary Rule | Read | ✗ | ✗ | ✓ (read-only) | ✓ | ✓ |
| Salary Rule | Create/Update/Delete | ✗ | ✗ | ✗ | ✓ | ✓ |
| Payrun | Create | ✗ | ✗ | ✓ | ✓ | ✓ |
| Payrun | Compute | ✗ | ✗ | ✓ | ✓ | ✓ |
| Payrun | Validate (run Sentinel) | ✗ | ✗ | ✓ | ✓ | ✓ |
| Payrun | Mark Paid | ✗ | ✗ | ✗ | ✓ | ✓ |
| Payrun | Send Payslips | ✗ | ✗ | ✓ | ✓ | ✓ |
| Payslip | Read all | ✗ | ✗ | ✓ | ✓ | ✓ |
| Payslip | Read own | ✓ | ✓ | ✓ | ✓ | ✓ |
| Payslip | Download PDF (own) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Payslip | Explain (own) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Sentinel Flag | Resolve | ✗ | ✗ | ✓ | ✓ | ✓ |
| Sentinel Flag | Override | ✗ | ✗ | ✗ | ✓ | ✓ |
| Dashboard | View | ✗ | ✗ | ✓ | ✓ | ✓ |
| Dashboard Copilot | Query | ✗ | ✗ | ✓ | ✓ | ✓ |
| Audit Log | View | ✗ | ✗ | ✗ | ✓ | ✓ |

### Administration

| Resource | Action | EMPLOYEE | HR_MANAGER | HR_PAYROLL_USER | HR_PAYROLL_MANAGER | ADMIN |
|---|---|:---:|:---:|:---:|:---:|:---:|
| User | List | ✗ | ✗ | ✗ | ✗ | ✓ |
| User | Create | ✗ | ✗ | ✗ | ✗ | ✓ |
| User | Assign Role | ✗ | ✗ | ✗ | ✗ | ✓ |
| User | Deactivate | ✗ | ✗ | ✗ | ✗ | ✓ |

---

## 3. Field-Level Restrictions

Some responses strip sensitive fields based on role — enforced at the **serializer layer**, not just route-level gating.

| Field | Excluded For |
|---|---|
| `Employee.bankAccount` | `EMPLOYEE` (own), `HR_MANAGER` |
| `Employee.bankName` | `EMPLOYEE` (own), `HR_MANAGER` |
| `Contract.wage` | `EMPLOYEE` (own record) |
| `User.clerkId` | All non-Admin roles |

> **Why field-level matters:** A route guard prevents the wrong role from *calling* the endpoint. Field-level filtering ensures that even if an endpoint returns an Employee object in a nested relation, sensitive fields are absent from the response JSON.

---

## 4. Implementation

### Clerk Integration

```typescript
// middleware/authenticate.ts
import { clerkClient } from '@clerk/clerk-sdk-node';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const payload = await clerkClient.verifyToken(token);
    // Sync role from internal User table (not from Clerk metadata)
    const user = await prisma.user.findUnique({ where: { clerkId: payload.sub } });
    if (!user || !user.isActive) return res.status(401).json({ error: 'User not found or inactive' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Role Authorization Middleware

```typescript
// middleware/authorize.ts
import { Role } from '@prisma/client';

// Role hierarchy for superset checks
const ROLE_HIERARCHY: Role[] = [
  'EMPLOYEE',
  'HR_MANAGER',
  'HR_PAYROLL_USER',
  'HR_PAYROLL_MANAGER',
  'ADMIN',
];

export function requireRole(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user.role;
    if (allowedRoles.includes(userRole)) return next();
    return res.status(403).json({
      error: 'Forbidden',
      message: `This action requires one of: ${allowedRoles.join(', ')}`,
    });
  };
}

// Convenience aliases used in routers
export const requirePayrollUser = requireRole(['HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN']);
export const requirePayrollManager = requireRole(['HR_PAYROLL_MANAGER', 'ADMIN']);
export const requireHRManager = requireRole(['HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN']);
export const requireAdmin = requireRole(['ADMIN']);
```

### Usage in Routes

```typescript
// modules/payroll/payroll.router.ts
router.post('/:id/mark-paid', authenticate, requirePayrollManager, markPaidHandler);
router.post('/:id/validate', authenticate, requirePayrollUser, validateHandler);
router.get('/:id', authenticate, requirePayrollUser, getPayrunHandler);
```

### Self-Access Guard (Resource Ownership)

For routes where a user can only access their own resources:

```typescript
// Ensures an Employee can only read their own payslips
export function requireSelfOrRole(allowedRoles: Role[], getResourceOwnerId: (req: Request) => Promise<string>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (allowedRoles.includes(req.user.role)) return next();
    const ownerId = await getResourceOwnerId(req);
    if (req.user.employeeId === ownerId) return next();
    return res.status(403).json({ error: 'Forbidden: can only access own resources' });
  };
}
```

---

## 5. Clerk Webhook — User Sync

When a user is created in Clerk (by an Admin), a webhook fires to sync the record into the internal `User` table and assign the default role.

```typescript
// modules/auth/auth.router.ts
router.post('/webhooks/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  const event = validateClerkWebhook(req); // Verify Clerk-Signature header
  if (event.type === 'user.created') {
    await prisma.user.create({
      data: {
        clerkId: event.data.id,
        email: event.data.email_addresses[0].email_address,
        role: 'EMPLOYEE', // Admin assigns role separately via /users/:id/role
      },
    });
  }
  res.json({ received: true });
});
```

---

## 6. Security Rules

1. **No self-elevation.** The `/users/:id/role` endpoint is Admin-only. No role can change its own role or elevate to a higher one.
2. **Paid records are immutable.** Once a `Payrun` reaches `PAID` status, no update is allowed (enforced in the service layer with a guard: `if (payrun.status === 'PAID') throw new ForbiddenError('Paid payrun is immutable')`).
3. **Salary data is never returned to Employee role.** Field-level serializer strips `wage`, `bankAccount`, `bankName` from Employee-role responses.
4. **HR Manager cannot access payroll routes.** Server-side role check; hiding nav items in the UI is cosmetic only.
5. **Sentinel override is Payroll Manager-only.** The `RESOLVE` action (which triggers recompute) is available to Payroll Users. The `OVERRIDE with note` action (acknowledging without fixing) is restricted to Payroll Managers.

---

## 7. Frontend Role Guards

Role guards in the UI are **never** the security boundary — they only prevent showing irrelevant UI. The server always re-checks.

```typescript
// hooks/usePermissions.ts
export function usePermissions() {
  const { user } = useAuth(); // From Clerk + internal role
  return {
    canAccessPayroll: ['HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN'].includes(user.role),
    canConfigureSalary: ['HR_PAYROLL_MANAGER', 'ADMIN'].includes(user.role),
    canMarkPaid: ['HR_PAYROLL_MANAGER', 'ADMIN'].includes(user.role),
    canManageUsers: user.role === 'ADMIN',
    canApproveLeave: ['HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN'].includes(user.role),
  };
}
```

```tsx
// Usage in component
const { canMarkPaid } = usePermissions();
return (
  <Button disabled={!canMarkPaid} onClick={handleMarkPaid}>
    Mark Paid
  </Button>
);
```
