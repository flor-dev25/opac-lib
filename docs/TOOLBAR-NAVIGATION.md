# 🧭 Toolbar Navigation Architecture

> **Author:** Senior UI/UX Agent  
> **Last Updated:** 2026-05-09  
> **Status:** Design Document — Implementation Pending

---

## 1. Problem Statement

The current Advanced Mode toolbar is a **flat, horizontal ribbon** containing 20+ buttons in a single row. This causes:

| Issue | Impact |
|---|---|
| **Cognitive overload** | Users can't locate tools quickly when all 20+ icons are visible simultaneously |
| **No logical grouping** | Circulation tools sit next to data import tools with no visual hierarchy |
| **Horizontal overflow** | On smaller screens, buttons overflow and require horizontal scrolling |
| **No discoverability** | New users don't understand what tools are available without clicking "Adv. Mode" |
| **Boss is angry** | 😤 |

---

## 2. Solution: Grouped Command Bar (shadcn-inspired)

Replace the flat ribbon with a **compact, grouped command bar** that organizes tools into logical categories using **dropdown menus**. This follows the shadcn/ui `NavigationMenu` pattern: a top-level bar with category triggers that reveal grouped tool panels on hover/click.

### 2.1 Design Principles

1. **Grouped by Workflow** — Tools are organized by the task the user is performing
2. **Progressive Disclosure** — Only category labels are visible; tools appear on interaction
3. **Keyboard Accessible** — All menus navigable via arrow keys and keyboard shortcuts
4. **Theme-Aware** — Full dark/light mode support using existing design tokens
5. **Retro-Premium Fusion** — Win95/98 beveled aesthetic meets modern dropdown UX

---

## 3. Menu Structure

### 3.1 Category Map

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 📚 Catalog ▾ │ 👥 Accounts ▾ │ 🔄 Circulation ▾ │ 📊 Reports ▾ │ ⚙️ System ▾ │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Detailed Breakdown

#### 📚 Catalog
| Item | Icon | Action | Shortcut |
|---|---|---|---|
| Browse Catalog | `LayoutDashboard` | Navigate to `/dashboard` | `Ctrl+1` |
| New Record | `FilePlus` | Navigate to `/catalog/new` | `Ctrl+N` |
| Edit Record | `Edit` | Open EditCatalogDialog | `Ctrl+E` |
| Delete Record | `Trash2` | Open DeleteDialog | `Del` |
| Authority Files | `BookOpen` | Open AuthorityDialog | — |
| Export Data | `Download` | Open ExportDialog | `Ctrl+Shift+E` |
| Import Legacy (.mdb) | `DatabaseBackup` | Open ImportMdbDialog | — |

#### 👥 Accounts
| Item | Icon | Action | Shortcut |
|---|---|---|---|
| Manage Accounts | `Users` | Navigate to `/patrons` | `Ctrl+2` |
| New Account | `UserPlus` | Navigate to `/patrons/new` | — |
| Import CSV | `UserPlus` | Open file picker → ImportAccountsDialog | — |
| Attendance Dashboard | `UserCheck` | Open AttendanceDashboard | — |

#### 🔄 Circulation
| Item | Icon | Action | Shortcut |
|---|---|---|---|
| Borrow (Checkout) | `ArrowUpRight` | Open CheckoutDialog | `Ctrl+B` |
| Return | `ArrowDownLeft` | Open ReturnDialog | `Ctrl+R` |
| Reserve | `BookmarkPlus` | Open ReservationDialog | — |
| Pay Fine | `Wallet` | Open PaymentDialog | — |
| Circulation Overview | `Activity` | Open CirculationDashboard | — |

#### 📊 Reports
| Item | Icon | Action | Shortcut |
|---|---|---|---|
| Financial Reports | `TrendingUp` | Open FinancialReportsDialog | — |
| Inventory Audit | `ScanBarcode` | Open AuditDialog | — |
| New Acquisitions | `BookPlus` | Open AcquisitionsDialog | — |

#### ⚙️ System
| Item | Icon | Action | Shortcut |
|---|---|---|---|
| Settings | `Settings` | Open SettingsPage | `Ctrl+,` |
| Sync Now | `RefreshCw` | Trigger sync | — |
| Sync Logs | `FileText` | Open SyncLogsDialog | — |
| About infoLib | `Info` | Open AboutDialog | — |
| Exit | `LogOut` | Quit application | `Alt+F4` |

---

## 4. Visual Specification

### 4.1 Command Bar (Top-Level)

```
┌───────────────────────────────────────────────────────────────────────┐
│ [📚 Catalog ▾] [👥 Accounts ▾] [🔄 Circulation ▾] ...  ⚙  [infoLib.]│
│                                                                       │
│ ┌─────────────────────┐                                               │
│ │ ▸ Browse Catalog     │  ← Dropdown panel (beveled border)           │
│ │ ▸ New Record         │                                               │
│ │ ────────────────     │  ← Separator (etched line)                   │
│ │ ▸ Edit Record        │                                               │
│ │ ▸ Delete Record      │                                               │
│ │ ────────────────     │                                               │
│ │ ▸ Authority Files    │                                               │
│ │ ▸ Export Data        │                                               │
│ │ ▸ Import Legacy      │                                               │
│ └─────────────────────┘                                               │
└───────────────────────────────────────────────────────────────────────┘
```

### 4.2 Styling Rules

| Element | Light Mode | Dark Mode |
|---|---|---|
| **Bar Background** | `bg-classic-grey` (`#D4D0C8`) | `bg-dark-surface` (`#2D2D2D`) |
| **Category Trigger** | Beveled button, `text-sm font-semibold` | Dark beveled, `text-dark-text` |
| **Active Trigger** | `bg-white shadow-bevel-sunken` | `bg-dark-input shadow-bevel-sunken` |
| **Dropdown Panel** | `bg-white border shadow-bevel-raised` | `bg-dark-panel border-dark-border-light` |
| **Menu Item** | `hover:bg-blue-100 text-sm` | `hover:bg-dark-selection text-dark-text` |
| **Separator** | `border-t border-gray-300` | `border-t border-dark-border-dark` |
| **Shortcut Label** | `text-xs text-gray-400 ml-auto` | `text-xs text-dark-text-muted ml-auto` |

### 4.3 Interaction States

- **Hover on trigger** → subtle highlight, no dropdown yet
- **Click on trigger** → dropdown opens, trigger pressed (sunken bevel)
- **Hover on menu item** → blue highlight (Win98 selection color)
- **Click outside** → dropdown closes
- **Escape key** → closes any open dropdown
- **Arrow keys** → navigate within open dropdown

---

## 5. Component Architecture

```
src/components/toolbar/
├── CommandBar.tsx          # Top-level bar container
├── CommandGroup.tsx        # Single dropdown category (trigger + panel)
├── CommandItem.tsx         # Individual menu item (icon + label + shortcut)
├── CommandSeparator.tsx    # Etched line separator
└── useCommandBar.ts        # Keyboard navigation & open/close state
```

### 5.1 Component Hierarchy

```
<CommandBar>
  <CommandGroup label="Catalog" icon={BookOpen}>
    <CommandItem icon={LayoutDashboard} label="Browse Catalog" onClick={...} shortcut="Ctrl+1" />
    <CommandItem icon={FilePlus} label="New Record" onClick={...} shortcut="Ctrl+N" />
    <CommandSeparator />
    <CommandItem icon={Edit} label="Edit Record" onClick={...} shortcut="Ctrl+E" />
    <CommandItem icon={Trash2} label="Delete Record" onClick={...} shortcut="Del" />
    <CommandSeparator />
    <CommandItem icon={BookOpen} label="Authority Files" onClick={...} />
    <CommandItem icon={Download} label="Export Data" onClick={...} />
    <CommandItem icon={DatabaseBackup} label="Import Legacy" onClick={...} />
  </CommandGroup>
  
  <CommandGroup label="Accounts" icon={Users}>
    ...
  </CommandGroup>
  
  {/* Spacer */}
  
  <CommandGroup label="" icon={Settings} compact />
  <BrandingLogo />
</CommandBar>
```

### 5.2 State Management

- **No new Zustand store needed** — dropdown open/close is local component state
- **Existing dialog state** stays in `MainLayout.tsx` (unchanged)
- The `CommandBar` receives the same callback props as the current `Toolbar`

---

## 6. Migration Strategy

| Phase | Action |
|---|---|
| **Phase 1** | Build `CommandBar` components alongside existing `Toolbar` |
| **Phase 2** | Wire `CommandBar` into `MainLayout` (replace `<Toolbar>` in Advanced Mode) |
| **Phase 3** | Keep Basic Mode toolbar unchanged (existing `<Toolbar>` with `isAdvanced=false`) |
| **Phase 4** | Remove dead code from old Advanced Mode toolbar items |

### 6.1 Backward Compatibility

- **Basic Mode** remains unchanged — same flat toolbar with New, Delete, Export, Authority, About, Exit
- **Advanced Mode** switches to the new `CommandBar`
- All dialog callbacks remain in `MainLayout.tsx` — no state migration needed

---

## 7. Files to Create / Modify

| File | Action |
|---|---|
| `src/components/toolbar/CommandBar.tsx` | **CREATE** — Main bar |
| `src/components/toolbar/CommandGroup.tsx` | **CREATE** — Dropdown category |
| `src/components/toolbar/CommandItem.tsx` | **CREATE** — Menu item |
| `src/components/toolbar/CommandSeparator.tsx` | **CREATE** — Divider |
| `src/components/toolbar/useCommandBar.ts` | **CREATE** — Keyboard hook |
| `src/components/dashboard/Toolbar.tsx` | **MODIFY** — Swap Advanced Mode to `<CommandBar>` |
| `src/index.css` | **MODIFY** — Add dropdown animation styles |
| `docs/PROJECT-TRACKER.md` | **MODIFY** — Track new milestone |

---

## 8. Accessibility Checklist

- [x] All triggers have `aria-haspopup="menu"` and `aria-expanded`
- [x] Dropdown panels have `role="menu"`, items have `role="menuitem"`
- [x] Focus trap inside open dropdown
- [x] `Escape` closes dropdown and returns focus to trigger
- [x] Arrow key navigation between menu items
- [x] Keyboard shortcuts displayed in menu items for discoverability
