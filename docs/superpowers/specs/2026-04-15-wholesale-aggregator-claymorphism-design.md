# Wholesale Aggregator — Claymorphism UI + Dark Mode + Order Consolidation + Email Notifications

**Date:** 2026-04-15
**Status:** Finalized
**Version:** 1.0

---

## 1. Visual Design System — Claymorphism

### 1.1 Design Philosophy

High-Fidelity Claymorphism simulates premium digital clay — tactile, dense, and physically reactive. Every element evokes holding a matte-finish vinyl toy or soft silicone object. Key principles:

- **Materiality**: Soft-touch matte silicone, marshmallow foam, injection-molded plastic
- **Lighting**: Soft diffused overhead light (top-left), deep ambient occlusion below objects
- **Shadow Architecture**: 4-layer shadow stacks for genuine depth, not flat extrusion
- **Sensory Feel**: Playful candy-store colors, bouncy organic motion, zero sharp corners

### 1.2 Color Palette

```
Background:
  canvas:       #F4F1FA  (cool lavender-white — never pure white)

Foreground:
  text-primary: #332F3A  (Soft Charcoal — high contrast but softer than black)
  text-muted:   #635F69  (Dark Lavender-Gray — minimum for accessibility)

Accents:
  primary:      #7C3AED  (Vivid Violet — CTAs, links, brand)
  secondary:    #DB2777  (Hot Pink — gradients, emphasis)
  tertiary:     #0EA5E9  (Sky Blue — informational)
  success:      #10B981  (Emerald — positive indicators)
  warning:      #F59E0B  (Amber — alerts, ratings)

Dark Mode Palette:
  canvas-dark:       #1A1625  (deep violet-black)
  card-bg-dark:      rgba(30,25,45,0.8)
  foreground-dark:   #E8E4F0  (soft lavender-white)
  muted-dark:        #9B97A5
  accent-dark:       #A78BFA  (lighter violet for dark context)
```

### 1.3 Typography

| Role | Font | Weights | Usage |
|------|------|---------|-------|
| Headings | Nunito | 700/800/900 | All headings, stat numbers, emphasis |
| Body | DM Sans | 400/500/700 | Body text, labels, metadata |

**Scale (Mobile-First):**
- Hero: `text-5xl → sm:text-6xl → md:text-7xl → lg:text-8xl`, font-black, tracking-tight
- Section titles: `text-3xl → sm:text-4xl → md:text-5xl`, font-extrabold
- Card titles: `text-xl → text-2xl`, font-bold
- Body: `text-base → text-lg`, font-medium, leading-relaxed
- Small/Labels: `text-sm → text-xs`, tracking-wide

### 1.4 Shapes & Radii

| Element | Radius |
|---------|--------|
| Hero containers | `rounded-[48px]` to `rounded-[60px]` |
| Standard cards | `rounded-[32px]` |
| Medium elements | `rounded-[24px]` |
| Buttons & inputs | `rounded-[20px]` |
| Icon containers | `rounded-2xl` (16px) or `rounded-full` |
| Small badges | `rounded-full` |

**Critical:** Never use `rounded-md` (4px) or `rounded-sm`. Minimum radius is `rounded-[20px]`.

### 1.5 Shadow System (4-Layer Stacks)

```css
/* Clay Card (Floating) */
box-shadow:
  16px 16px 32px rgba(160, 150, 180, 0.2),
  -10px -10px 24px rgba(255, 255, 255, 0.9),
  inset 6px 6px 12px rgba(139, 92, 246, 0.03),
  inset -6px -6px 12px rgba(255, 255, 255, 1);

/* Clay Button (Convex) */
box-shadow:
  12px 12px 24px rgba(139, 92, 246, 0.3),
  -8px -8px 16px rgba(255, 255, 255, 0.4),
  inset 4px 4px 8px rgba(255, 255, 255, 0.4),
  inset -4px -4px 8px rgba(0, 0, 0, 0.1);

/* Clay Pressed (Recessed) */
box-shadow:
  inset 10px 10px 20px #d9d4e3,
  inset -10px -10px 20px #ffffff;

/* Dark Mode Variants — adjusted for deep backgrounds */
--shadow-clay-card-dark:
  16px 16px 32px rgba(0, 0, 0, 0.4),
  -10px -10px 24px rgba(60, 50, 80, 0.3),
  inset 6px 6px 12px rgba(0, 0, 0, 0.1),
  inset -6px -6px 12px rgba(255, 255, 255, 0.05);
```

### 1.6 Animation System (GSAP)

```javascript
// Clay Float — zero-gravity drift (8s)
@keyframes clay-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
}

// Clay Breathe — inflate/deflate (6s)
@keyframes clay-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
```

**Interaction Animations:**
- Hover lift: `hover:-translate-y-2` (8px) + enhanced shadow
- Active press: `active:scale-[0.92]` + `shadow-clayPressed` (squish)
- Stat orbs: `hover:scale-110` (10% growth)
- All transitions: `duration-500` for smooth premium feel
- Respect `prefers-reduced-motion`

### 1.7 Component Specs

**Stat Orbs**
- Shape: `rounded-full` (perfect circles)
- Size: `h-32 w-32`
- Background: Gradient from light pastel (400) to saturated (600)
- Number: Nunito Black `text-4xl`
- Label: DM Sans `text-sm tracking-wide`
- Hover: `scale-110` + enhanced shadow

**Buttons**
- Height: `h-14` default, `h-16` for lg
- Primary: `bg-gradient-to-br from-[#A78BFA] to-[#7C3AED]` + `shadow-clayButton`
- Secondary: white bg + `shadow-clayButton`
- Hover: `hover:-translate-y-1` (lift)
- Active: `active:scale-[0.92]` + `shadow-clayPressed` (squish)
- Focus: `focus-visible:ring-4 focus-visible:ring-clay-accent/30`

**Cards**
- Background: `bg-white/60 backdrop-blur-xl`
- Border-radius: `rounded-[32px]`
- Padding: `p-8`
- Shadow: `shadow-clayCard`
- Hover: `hover:-translate-y-2` + enhanced shadow

**Inputs**
- Height: `h-16`
- Background: `bg-[#EFEBF5]` (recessed clay)
- Border-radius: `rounded-[20px]`
- Shadow: `shadow-clayPressed`
- Focus: transforms to `bg-white` + `ring-4 focus:ring-clay-accent/20`

**Background Blobs**
- Size: `h-[60vh] w-[60vh]`
- Opacity: `/10` (10%)
- Blur: `blur-3xl`
- Colors: violet, pink, sky blue
- Animation: clay-float with staggered delays

---

## 2. Dark Mode

### 2.1 Theme Architecture

```
CSS Custom Properties (all tokens)
       ↓
data-theme="light" / data-theme="dark" on <html>
       ↓
Tailwind darkMode: ['selector', '[data-theme="dark"]']
```

### 2.2 Toggle Component

- **Position:** Top-right of header/navbar
- **Icon:** Moon/Sun with GSAP morph transition
- **Persistence:** `localStorage.setItem('theme-preference', 'dark' | 'light' | 'system')`
- **OS Sync:** `prefers-color-scheme` media query

### 2.3 Theme Persistence Flow

```
Page Load:
  1. Read localStorage 'theme-preference'
  2. If 'system' → read prefers-color-scheme
  3. Apply data-theme attribute BEFORE render (prevent flicker)
  4. Hydrate React app with correct theme
```

### 2.4 Dark Mode CSS Variable Mapping

| Token | Light | Dark |
|-------|-------|------|
| `--clay-canvas` | `#F4F1FA` | `#1A1625` |
| `--clay-card-bg` | `rgba(255,255,255,0.6)` | `rgba(30,25,45,0.8)` |
| `--clay-foreground` | `#332F3A` | `#E8E4F0` |
| `--clay-muted` | `#635F69` | `#9B97A5` |
| `--clay-accent` | `#7C3AED` | `#A78BFA` |
| `--clay-shadow` | (standard) | (deep, saturated) |

---

## 3. Order Consolidation

### 3.1 Three Consolidation Modes

**Mode 1: Manual Batch Merge**
- User selects 2+ orders → clicks "Consolidate" button
- Modal shows grouped preview of combined items
- Creates new "Consolidated Order" with references to original orders
- Original orders marked as `merged` (read-only)

**Mode 2: Auto-Group by Vendor**
- Items added to cart from same vendor auto-group
- Cart shows vendor分组 headers with subtotals
- One shipment per vendor group
- User toggle in settings to disable

**Mode 3: Scheduled Auto-Consolidation (Phase 2)**
- Admin config: `consolidation_window_hours` (default: 24)
- Backend cron job runs hourly
- Groups orders by vendor + status `pending`
- Creates `Consolidated Order` at window close
- Original orders marked `scheduled_consolidation`
- Email notification sent to vendor

### 3.2 Data Model Changes

```typescript
// Order model extensions
interface Order {
  // ... existing fields
  status: 'draft' | 'pending' | 'consolidated' | 'merged' | 'shipped' | 'delivered' | 'cancelled';
  consolidation_type: 'manual' | 'auto_group' | 'scheduled' | null;
  parent_order_ids: string[];  // for merged orders
  vendor_id: string;
  scheduled_consolidation_at?: Date;  // for Mode 3
}
```

### 3.3 API Endpoints

```
POST   /api/orders/:id/consolidate         → Manual consolidation trigger
GET    /api/orders/consolidation-preview  → Preview what would be consolidated
PUT    /api/orders/:id/auto-group         → Enable/disable auto-group for vendor
GET    /api/orders/grouped                → Get orders grouped by vendor
```

### 3.4 Implementation Phases

| Phase | Feature | Deliverable |
|-------|---------|-------------|
| 1 | Manual Merge | Selection UI, consolidation modal, merge logic |
| 2 | Auto-Group by Vendor | Cart grouping, vendor toggle |
| 3 | Scheduled Batching | Cron job, admin config, email triggers |

---

## 4. Email Notifications

### 4.1 Trigger Events

| Event | Recipients | Description |
|-------|-----------|-------------|
| `order.confirmed` | Buyer | Order confirmation with details |
| `order.shipped` | Buyer | Tracking info, carrier |
| `order.delivered` | Buyer | Delivery confirmation |
| `order.cancelled` | Buyer | Cancellation notice |
| `order.consolidated` | Buyer + Vendor | Consolidated order details |
| `consolidated.order.created` | Vendor | New consolidated order summary |
| `payment.ready` | Vendor | Payment amount, due date |

### 4.2 Email Template Structure

```
┌────────────────────────────────────────┐
│  [Logo]  Wholesale Aggregator          │  ← Nunito Black header
├────────────────────────────────────────┤
│                                        │
│  Hi {buyer_name},                      │  ← DM Sans body
│                                        │
│  Your order #{order_id} has been       │
│  confirmed.                            │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  [View Order Details]            │  │  ← Violet gradient button
│  └──────────────────────────────────┘  │
│                                        │
│  Order Summary:                        │
│  • Vendor: {vendor_name}               │
│  • Items: {item_count}                 │
│  • Total: ${total}                     │
│                                        │
├────────────────────────────────────────┤
│  Unsubscribe | Manage Preferences      │  ← Muted footer
└────────────────────────────────────────┘
```

### 4.3 Notification Preferences UI

- Location: Settings page → "Email Notifications" section
- Toggle switches per notification type
- Visual: `rounded-[20px]` track, `rounded-full` thumb
- States: enabled (violet), disabled (gray pressed)

### 4.4 Implementation Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Order Service                                             │
│     │                                                     │
│     ├── EventEmitter ('order.confirmed', 'order.shipped',  │
│     │            'order.consolidated', etc.)               │
│     │                                                     │
│  ┌──┴──────────────────────────────────────────────────┐  │
│  │  Notification Worker (background job/queue)         │  │
│  │     │                                               │  │
│  │     ├── Email Service (nodemailer/SendGrid)          │  │
│  │     ├── NotificationPreferences lookup (DB)          │  │
│  │     ├── Template Renderer (email-templates)        │  │
│  │     └── Rate Limiter                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 4.5 API Endpoints

```
GET    /api/notifications/preferences    → Get user's email prefs
PUT    /api/notifications/preferences    → Update preferences
POST   /api/notifications/test-email     → Send test email (dev)
```

### 4.6 Database Schema

```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  email_order_confirmed BOOLEAN DEFAULT true,
  email_order_shipped BOOLEAN DEFAULT true,
  email_order_delivered BOOLEAN DEFAULT true,
  email_order_cancelled BOOLEAN DEFAULT true,
  email_order_consolidated BOOLEAN DEFAULT true,
  email_vendor_new_order BOOLEAN DEFAULT true,
  email_vendor_payment_ready BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## 5. Implementation Checklist

### Visual System
- [ ] Background: Canvas `#F4F1FA` + Animated Blobs
- [ ] CSS: 4-layer box-shadow variables in `:root`
- [ ] Typography: Nunito + DM Sans fonts loaded
- [ ] Buttons: Gradient, rounded-[20px], GSAP squish on click
- [ ] Cards: white/60%, backdrop-blur, rounded-[32px]
- [ ] Stat Orbs: rounded-full, gradient fills, hover scale
- [ ] Inputs: Recessed clay style with focus ring
- [ ] Responsive: Mobile-first with progressive enhancement

### Dark Mode
- [ ] CSS variables for dark palette
- [ ] `data-theme` attribute on `<html>`
- [ ] Theme toggle component in header
- [ ] localStorage persistence
- [ ] OS `prefers-color-scheme` sync
- [ ] No-flash render (inline script before body)

### Order Consolidation
- [ ] Order selection UI (checkboxes)
- [ ] Consolidation modal with preview
- [ ] Merge logic (creates parent order)
- [ ] Status update to `merged`
- [ ] Cart auto-group by vendor
- [ ] Vendor group headers in cart
- [ ] Settings toggle for auto-group
- [ ] Scheduled consolidation cron job (Phase 3)
- [ ] Admin config for `consolidation_window_hours` (Phase 3)

### Email Notifications
- [ ] Email service integration (nodemailer/SendGrid)
- [ ] Email templates (transactional HTML)
- [ ] Event emitter in Order Service
- [ ] Notification worker (background job)
- [ ] Notification preferences table + API
- [ ] Settings UI with toggle switches
- [ ] Rate limiting per user

---

## 6. File Structure

```
frontend/
├── src/
│   ├── styles/
│   │   ├── claymorphism.css       # CSS variables, shadows
│   │   ├── animations.css        # GSAP keyframes
│   │   └── dark-mode.css         # Dark theme overrides
│   ├── components/
│   │   ├── ui/
│   │   │   ├── ClayButton.tsx
│   │   │   ├── ClayCard.tsx
│   │   │   ├── ClayInput.tsx
│   │   │   ├── ClayToggle.tsx
│   │   │   ├── StatOrb.tsx
│   │   │   └── BackgroundBlobs.tsx
│   │   ├── layout/
│   │   │   └── Layout.tsx         # Header with theme toggle
│   │   └── theme/
│   │       └── ThemeProvider.tsx  # Theme context + toggle
│   ├── pages/
│   │   ├── Orders.tsx            # Orders list + consolidation
│   │   ├── Cart.tsx              # Cart with vendor grouping
│   │   └── Settings.tsx          # Notification preferences
│   └── store/
│       └── themeSlice.ts         # Redux theme state

services/
├── order-service/
│   ├── src/
│   │   ├── services/
│   │   │   ├── consolidation.ts  # Merge/group logic
│   │   └── notifications.ts      # Email triggers
│   │   ├── routes/
│   │   │   ├── orders.ts
│   │   │   └── notifications.ts
│   │   └── models/
│   │       └── order.ts          # Updated Order model
│   └── emails/
│       ├── confirmation.html
│       ├── shipped.html
│       └── consolidated.html
└── gateway/
    └── src/
        └── routes/
            └── notification-preferences.ts
```

---

## 7. Dependencies

```json
{
  "frontend": {
    "gsap": "^3.12.0",
    "@reduxjs/toolkit": "^2.0.0",
    "react-redux": "^9.0.0"
  },
  "order-service": {
    "nodemailer": "^6.9.0",
    "node-cron": "^3.0.0",
    "p-queue": "^8.0.0"
  }
}
```

---

*Spec version 1.0 — Finalized 2026-04-15*