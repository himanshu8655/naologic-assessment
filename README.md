# Work Order Schedule Timeline — Naologic Frontend Assessment

A pixel-perfect Angular 17+ Work Order Schedule Timeline component built for the Naologic Frontend Technical Test.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Angular CLI 17+

```bash
npm install -g @angular/cli
```

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd naologic-assessment

# Install dependencies
npm install
```

### Running the Application

```bash
ng serve
```

Open your browser and navigate to `http://localhost:4200/`

---

## 📦 Libraries Used

| Library | Version | Purpose |
|---|---|---|
| `@angular/core` | 17+ | Framework |
| `@ng-bootstrap/ng-bootstrap` | latest | `ngb-datepicker` for date picking (required) |
| `@ng-select/ng-select` | latest | Status dropdown (required) |
| `rxjs` | 7+ | Reactive state management |

---

## 🏗️ Architecture & Approach

### Component Structure

```
src/app/
├── models/
│   └── work-order.models.ts          # TypeScript interfaces + status types
├── data/
│   └── sample-data.ts                # Hardcoded work centers + work orders
├── services/
│   ├── date-utils.service.ts         # Date calculation helpers
│   └── work-order.service.ts         # Signal-based state management
└── components/
    ├── timeline/                      # Main timeline grid (host component)
    ├── timescale-dropdown/            # Day/Week/Month zoom selector
    ├── work-order-bar/                # Individual bar with status + three-dot menu
    └── work-order-panel/              # Slide-out create/edit panel
```

### Key Decisions

**Signals over RxJS Subjects**
Angular 17 signals were used for local component state (`isHovered`, `menuOpen`, `panelOpen`) to avoid unnecessary subscriptions and keep change detection efficient with `OnPush`.

**Standalone Components**
All components are standalone, using direct imports instead of NgModules. This aligns with Angular 17+ best practices and avoids the `NgbDatepickerModule`/`NgSelectModule` import issues in standalone context (individual class imports required).

**Inline `NgbDatepicker` instead of popup**
The `NgbInputDatepicker` popup directive requires `exportAs 'ngbDatepicker'` which conflicts with standalone imports. Instead, the inline `NgbDatepicker` component is shown/hidden using a signal — more reliable and easier to style.

**`ViewEncapsulation.None` on Panel**
The slide-out panel uses `ViewEncapsulation.None` so that ng-select dropdown styles (deep DOM) can be overridden from the component's SCSS file without `::ng-deep`.

**Date Positioning**
Bar positions are calculated as:
```
x = (startDate - rangeStart) / totalRangeDays * totalWidth
width = (endDate - startDate) / totalRangeDays * totalWidth
```
Column widths vary by zoom level (Day = 40px, Week = 120px, Month = 160px).

**Overlap Detection**
Before creating or saving a work order, the service checks all orders on the same `workCenterId` for date range intersection, excluding the order being edited in edit mode.

---

## ✅ Features Implemented

- [x] Timeline grid with Day / Week / Month zoom levels
- [x] Fixed left panel (work center names) with horizontally scrollable grid
- [x] Today indicator (vertical blue line)
- [x] Current period pill label in header
- [x] Work order bars with name + status badge + three-dot menu
- [x] All 4 status styles: Open, In Progress, Complete, Blocked
- [x] Create panel — slides in from right, click-outside closes
- [x] Edit panel — pre-populated, Save button
- [x] Start date pre-filled from click position
- [x] `ngb-datepicker` inline date pickers for start/end date
- [x] `ng-select` status dropdown with badge display
- [x] Form validation (required fields, end after start)
- [x] Overlap detection with error message
- [x] Delete work order from three-dot menu
- [x] "Click to add dates" tooltip on row hover
- [x] Pixel-perfect design matching Sketch file
- [x] Circular Std font via Naologic CDN
- [x] `OnPush` change detection throughout
- [x] `trackBy` on all `ngFor` loops

---

## 📋 Sample Data

5 work centers with 2 non-overlapping work orders each, covering all 4 statuses, each order spanning 3–5 months:

| Work Center | Order 1 | Order 2 |
|---|---|---|
| Genesis Hardware | Complete (Aug–Nov 2025) | In Progress (Jan–Apr 2026) |
| Rodriques Electrics | In Progress (Sep–Dec 2025) | Blocked (Feb–May 2026) |
| Konsulting Inc | Open (Aug–Nov 2025) | In Progress (Jan–May 2026) |
| McMarrow Distribution | Blocked (Sep–Dec 2025) | Complete (Feb–Jun 2026) |
| Spartan Manufacturing | Complete (Aug–Nov 2025) | Open (Jan–Apr 2026) |

---

## 🎨 Design Notes

- Font: **Circular Std** loaded from `naologic-com-assets.naologic.com`
- Page background: `#F1F3F8` (grey)
- Timeline card: white with subtle elevation shadow
- Status colors extracted directly from Sketch file inspect panel
- All badge/bar colors match Sketch exactly

---

## 🔧 Build

```bash
ng build
```

Output in `dist/` directory.

---

## 📝 Notes

- No localStorage persistence (base requirement only)
- No automated tests (time constraints)
- AI tools were used for styling assistance, date calculation logic, and debugging Angular standalone import issues
