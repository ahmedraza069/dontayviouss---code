# L&D Trailers — High-Converting Trailer Rental Website

Modern, heavy-duty industrial trailer rental website and reservation management system for **L&D Trailers**, located in **Corinth, Mississippi**.

---

## 🚀 Live Demo & Local Server
- **Server:** Node.js (Zero-dependency HTTP server & REST API)
- **Local URL:** `http://localhost:3000`
- **Owner Admin Dashboard:** `http://localhost:3000/admin.html`

To start the server locally:
```bash
node server.js
```

---

## 🎨 Brand Identity & Design System
- **Brand Vibe:** Heavy-duty, industrial, rugged, modern motorsport/utility aesthetic with high-contrast dark mode, subtle carbon-fiber/diamond-plate accents, and metallic silver borders.
- **Color Palette:**
  - `Pitch Carbon Black`: `#0A0A0C` (Main Background)
  - `Gunmetal Charcoal`: `#141619` (Card Surface)
  - `Aggressive Crimson Red`: `#E60000` (Hover: `#FF1A1A`) (Primary Accent & CTAs)
  - `Brushed Metallic Silver`: `#C0C5CE` to `#8E95A5` (Borders & Badges)
  - `Pure White`: `#FFFFFF` (Headings & Rates)
  - `Silver Gray`: `#B0B6C0` (Body Text)
- **Typography:**
  - **Headings (H1, H2, H3):** *Chakra Petch* & *Russo One* (Bold, Uppercase)
  - **Rental Rates & Numbers:** *Montserrat* (ExtraBold 800/900)
  - **Body & Policies:** *Inter* (Clean, readable 16px–18px)

---

## 📄 Site Structure (Full Multi-Page Architecture)
1. `index.html` — **Homepage:** Streamlined 8 core elements (Hero with brand artwork, About strip with 3 image cards, Featured fleet showcase, 5-tier pricing preview, Customer reviews, Corinth MS location & map, and Call Now CTA).
2. `trailers.html` — **Our Trailers:** Commercial fleet listings with full interactive specs and a 4-card hauling applications gallery.
3. `trailer-1.html` — **Trailer #1 Listing:** 6x12 Utility Trailer, tandem axle, chrome wheels, ramp gate, 4-photo gallery, and specs table.
4. `trailer-2.html` — **Trailer #2 Listing:** 6x12 Utility Trailer, stained hardwood plank deck, tie-down D-rings, spring-assist ramp, and 4-photo gallery.
5. `pricing.html` — **Rental Pricing & Deposits:** Full 5-tier pricing grid, refundable security deposit schedule, pre-trip inspection documentation, and 8 rental requirements.
6. `about.html` — **About Us:** Verbatim company story, 3 core pillars, mascot artwork, and 4-photo Corinth depot showcase.
7. `policies.html` — **Rental Policies:** All 7 official policies verbatim (Payment, Deposit, Late Return, Cancellation, Damage with inspection photos, Cleaning, and Prohibited Use with safety chains photos).
8. `service-area.html` — **Service Area:** Corinth MS primary depot, 7 surrounding communities (Glen, Booneville, Rienzi, Farmington, Iuka, Burnsville, Walnut), and embedded interactive Google Map.
9. `contact.html` — **Contact Us:** Corinth dispatch yard photo, location, phone, email, Facebook, full-width `[CALL NOW]` button, and 4-field inquiry form.
10. `booking.html` — **Online Booking System:** 10-field reservation form, dynamic price calculator with separate line items (Rental Fee vs. Refundable Security Deposit), approval disclaimer, and mock Stripe/Wix checkout.
11. `admin.html` — **Owner Dashboard:** Manage reservation requests (Approve/Decline), add new trailers to fleet CMS (expandable to 5+ trailers), and block calendar dates.
12. `terms-conditions.html` & `privacy-policy.html` — Legal pages.

---

## 🛠️ Wix Studio / Velo Backend
Full production code for Wix Studio / Velo is included in the `wix-velo/` directory:
- `backend/bookings.jsw`: Backend approval workflow, database insertion, and automated notification emails.
- `backend/pay.jsw`: Stripe / Wix Payments transaction handler with separated rental fees and refundable deposits.
- `page-code/bookingPage.js`: Frontend dynamic price calculation and client-side validation.
- `README.md`: Step-by-step Wix Studio setup and CMS collection schemas.

---

## 📱 Mobile Responsiveness (4 Breakpoints)
- **Large Desktop (1441px+):** 1600px Max-Width container, 5-column pricing grid.
- **Laptop (1024px – 1440px):** 3-column responsive grid.
- **Tablet (768px – 1023px):** 2-column layout, sticky header converts to mobile navigation drawer.
- **Mobile (320px – 767px):** Single-column layout, full-width touch buttons, zero horizontal overflow.
