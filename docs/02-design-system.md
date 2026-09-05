# HRMS OXP — Design System

> Visual language, component tokens, and UI conventions for HRMS OXP.
> Built with **Mantine v7** on top of a custom token layer.

---

## 1. Design Principles

1. **Data-forward** — Every screen exists to present information for a decision, not to impress. Information density > decorative whitespace.
2. **Action-clear** — The primary action on any screen is always unambiguous: one prominent button, one modal, one resolution path.
3. **Status-at-a-glance** — Color and iconography communicate state (Draft / Running / Paid / Flagged) without requiring reading.
4. **Trust through consistency** — If a payslip number looks the same everywhere it appears, users build trust. No ad-hoc formatting.
5. **Dark-mode first** — The product's demo screenshots are dark; the design system treats dark as the primary theme.

---

## 2. Color Palette

### Brand Colors

| Token | Hex | Use |
|---|---|---|
| `--color-brand-primary` | `#4F6EF7` | Primary actions, active nav, links |
| `--color-brand-secondary` | `#7C3AED` | Sentinel / AI features |
| `--color-brand-accent` | `#10B981` | Positive states, success |

### Semantic Colors

| Token | Hex | Use |
|---|---|---|
| `--color-success` | `#10B981` | Paid, Approved, Resolved |
| `--color-warning` | `#F59E0B` | Pending, Computed, To Approve |
| `--color-danger` | `#EF4444` | Error, Refused, High-severity flag |
| `--color-info` | `#3B82F6` | Draft, informational badges |
| `--color-muted` | `#6B7280` | Secondary text, disabled |

### Surface Colors (Dark Theme)

| Token | Value | Use |
|---|---|---|
| `--surface-base` | `#0F1117` | Page background |
| `--surface-card` | `#1A1D27` | Cards, modals, panels |
| `--surface-elevated` | `#22263A` | Dropdowns, tooltips, popovers |
| `--surface-border` | `#2E3248` | Dividers, input borders |
| `--surface-hover` | `#252A3D` | Row/card hover state |

### Text Colors

| Token | Value | Use |
|---|---|---|
| `--text-primary` | `#F0F0F5` | Headings, primary content |
| `--text-secondary` | `#A0A8C0` | Labels, subtitles |
| `--text-muted` | `#6B7280` | Placeholder, disabled |
| `--text-inverse` | `#0F1117` | Text on bright backgrounds |

---

## 3. Typography

**Font:** `Inter` (Google Fonts) — weights 400, 500, 600, 700.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace; /* formula editor */
}
```

### Type Scale

| Token | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| `--text-xs` | 11px | 400 | 1.4 | Badges, timestamps |
| `--text-sm` | 12px | 400 | 1.5 | Table cells, secondary labels |
| `--text-base` | 14px | 400 | 1.6 | Body, form inputs |
| `--text-md` | 16px | 500 | 1.5 | Card titles, section headers |
| `--text-lg` | 20px | 600 | 1.3 | Page headings |
| `--text-xl` | 24px | 700 | 1.2 | KPI numbers, dashboard stats |
| `--text-2xl` | 32px | 700 | 1.1 | Hero numbers (total payroll cost) |

---

## 4. Spacing System

8px base grid. All spacing uses multiples of 4px.

| Token | Value | Use |
|---|---|---|
| `--space-1` | 4px | Tight gaps (icon+label) |
| `--space-2` | 8px | Between form elements |
| `--space-3` | 12px | Card padding (compact) |
| `--space-4` | 16px | Default card padding |
| `--space-5` | 20px | Section gaps |
| `--space-6` | 24px | Panel padding |
| `--space-8` | 32px | Page padding |
| `--space-10` | 40px | Page section separation |

---

## 5. Border & Shadow

```css
:root {
  --radius-sm:  4px;   /* Badges, tags */
  --radius-md:  8px;   /* Inputs, buttons */
  --radius-lg: 12px;   /* Cards, modals */
  --radius-xl: 16px;   /* Dashboard panels */

  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.5);   /* Sentinel flag card */
}
```

---

## 6. Component Conventions

### Status Badges

Every status in the system maps to exactly one badge variant. **Never use color alone** — always pair with text.

| Status | Color | Icon |
|---|---|---|
| `Draft` | `--color-info` | `○` |
| `Computed` | `--color-warning` | `⟳` |
| `Validated` | `--color-warning` | `✓` |
| `Paid` | `--color-success` | `✓✓` |
| `Running` (Contract) | `--color-success` | `●` |
| `Expired` (Contract) | `--color-muted` | `—` |
| `Approved` | `--color-success` | `✓` |
| `Refused` | `--color-danger` | `✗` |
| `To Approve` | `--color-warning` | `⏳` |
| `Incomplete` (Attendance) | `--color-danger` | `!` |
| `Corrected` | `--color-info` | `✎` |

### Sentinel Flag Cards

```
┌────────────────────────────────────────────────────────────────┐
│  🔴 HIGH  ·  Missing Bank Details                               │
│                                                                  │
│  Aarav Mehta has no bank account on file. Payment cannot be      │
│  processed for this payslip until bank details are added.        │
│                                                                  │
│  [ Resolve → Add Bank Details ]          [ Override with Note ] │
└────────────────────────────────────────────────────────────────┘
```

- Border-left: 4px solid `--color-danger` (HIGH) / `--color-warning` (MEDIUM) / `--color-info` (LOW)
- Background: `--surface-elevated`
- Resolve button: `--color-brand-primary` (solid)
- Override button: ghost/outline

### Data Tables

- Alternating row background: `--surface-card` / `--surface-hover`
- Sticky header with sort indicators
- Row hover: `--surface-hover`
- Selected row: `--color-brand-primary` at 10% opacity + left accent bar
- Empty state: centered icon + title + primary CTA
- Loading state: skeleton rows (Mantine Skeleton)
- Error state: error banner at top with retry button

### KPI Cards (Dashboard)

```
┌───────────────────────────────┐
│  Total Payroll Cost            │
│                                │
│  ₹ 18,42,500                  │
│  +4.2% vs last period ↑       │
└───────────────────────────────┘
```

- Background: `--surface-card`
- Number: `--text-2xl`, `--text-primary`
- Trend up: `--color-success`, trend down: `--color-danger`
- Border: 1px `--surface-border`

---

## 7. Navigation Structure

### Top Navigation Bar

```
[ OXP Logo ] [ Employees ▾ ] [ Attendance ] [ Time Off ▾ ] [ Payroll ▾ ] [ Dashboard ]   [ 🔔 ] [ Avatar ]
```

### Sidebar (visible on Payroll section)

```
Payroll
├── Payruns
├── Payslips
├── Salary Structures
└── Salary Rules
```

### Role-Based Nav Visibility

| Nav Item | Employee | HR Manager | Payroll User | Payroll Manager | Admin |
|---|---|---|---|---|---|
| Employees | ✗ | ✓ | ✓ | ✓ | ✓ |
| Contracts | ✗ | ✓ | ✓ | ✓ | ✓ |
| Attendance | Own only | ✓ | ✓ | ✓ | ✓ |
| Time Off | Own only | ✓ | ✓ | ✓ | ✓ |
| Payroll | ✗ | ✗ | ✓ | ✓ | ✓ |
| Salary Config | ✗ | ✗ | Read-only | ✓ | ✓ |
| Dashboard | ✗ | ✗ | ✓ | ✓ | ✓ |
| User Mgmt | ✗ | ✗ | ✗ | ✗ | ✓ |

---

## 8. Page Layout Template

```
┌──────────────────────────────────────────────────────────────────┐
│ TopNav                                                            │
├──────────────────────────────────────────────────────────────────┤
│ Page Header: [ Icon ] Page Title        [ Search ] [ + New Btn ] │
│ Breadcrumb: Home / Employees                                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  [ Filter Row: Status ▾ ] [ Department ▾ ] [ Period ▾ ]          │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  DataTable / Kanban Board / Form                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 9. Forms

- **Label position:** above input (never inline placeholder as substitute for label)
- **Validation:** inline below the field, shown on blur or submit; never a global alert for field errors
- **Required fields:** asterisk `*` in label
- **Disabled state:** 50% opacity, no pointer events
- **Formula editor:** monospace font (`--font-mono`), syntax-highlighted variable tokens (BASIC, GROSS, etc.) in `--color-brand-primary`

---

## 10. Motion & Animation

| Interaction | Duration | Easing | Notes |
|---|---|---|---|
| Modal open/close | 200ms | ease-out / ease-in | Mantine default |
| Sentinel card appear | 300ms | spring (stagger 50ms per card) | Cards slide up from bottom |
| Payslip live recompute diff | 400ms | ease-out | Number counts up/down; changed rows highlight `--color-warning` for 1s then fade |
| Row hover | 150ms | ease | Background color transition |
| Button press | 100ms | ease-in | Slight scale-down (0.97) |
| Chart draw | 800ms | ease | Recharts `animationBegin=0` |

**The payslip recompute animation is the single most important motion in the product.** The before→after diff must be visually obvious and feel live, not like a page reload.

---

## 11. Iconography

Use `@tabler/icons-react` — consistent with Mantine's recommended icon set.

| Concept | Icon |
|---|---|
| Employee | `IconUsers` |
| Contract | `IconFileText` |
| Schedule | `IconCalendarTime` |
| Attendance | `IconClockHour4` |
| Time Off | `IconBeach` |
| Payroll / Payslip | `IconReceiptRupee` |
| Sentinel / Warning | `IconAlertTriangle` |
| Resolve | `IconCheck` |
| Dashboard | `IconLayoutDashboard` |
| Copilot / AI | `IconSparkles` |
| PDF | `IconFileTypePdf` |
| Email | `IconMail` |

---

## 12. Mantine Theme Config (`theme.ts`)

```typescript
import { createTheme, MantineColorsTuple } from '@mantine/core';

const brand: MantineColorsTuple = [
  '#EEF2FF', '#E0E7FF', '#C7D2FE',
  '#A5B4FC', '#818CF8', '#6366F1',
  '#4F6EF7', '#4338CA', '#3730A3', '#312E81',
];

export const theme = createTheme({
  fontFamily: 'Inter, -apple-system, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, Fira Code, monospace',
  primaryColor: 'brand',
  colors: { brand },
  defaultRadius: 'md',
  black: '#F0F0F5',
  white: '#0F1117',
  components: {
    Button: { defaultProps: { radius: 'md' } },
    Card: { defaultProps: { radius: 'lg', withBorder: true } },
    Badge: { defaultProps: { radius: 'sm', variant: 'light' } },
    Table: { defaultProps: { striped: false, highlightOnHover: true } },
    Modal: { defaultProps: { radius: 'lg', overlayProps: { blur: 4 } } },
  },
});
```
