# L&D Trailers — Wix Studio Dynamic Page & Full Booking CMS Guide

This guide explains how to set up the **Trailers Dynamic Item Page** (`/trailers/{slug}`) and connect the **Full Booking System** using Wix CMS.

---

## 1. Quick CSV Import (1-Click Setup)
In your workspace, find: `wix-cms/trailers-wix-cms.csv`.

1. Go to your **Wix Studio Dashboard** ➔ **CMS** ➔ **Collections**.
2. Click **+ Add Collection** and name it **`Trailers`**.
3. In the collection view, click the **More Actions (•••)** menu at top-right ➔ **Import Items**.
4. Upload `wix-cms/trailers-wix-cms.csv`.
5. Wix will automatically map all columns to CMS fields!

---

## 2. Trailers Collection Field Schema (For Dynamic Page)

| Field Key | Field Name | Wix Field Type | Used on Dynamic Page For |
| :--- | :--- | :--- | :--- |
| `title` | Trailer Name | Text | Main Page H1 Title |
| `slug` | URL Slug | Text (URL) | Dynamic Page URL (`/trailers/trailer-1`) |
| `trailerNumber` | Trailer # | Number | Trailer identifier badge (#1, #2, etc.) |
| `badge` | Promo Badge | Text | Red badge ("Introductory Pricing — $45/Day") |
| `size` | Size | Text | Card summary ("6ft x 12ft") |
| `dimensions` | Full Dimensions | Text | Specs table & header |
| `type` | Trailer Type | Text | "Commercial Utility Trailer" |
| `rateDaily` | Daily Rate | Number | Pricing table: $45 |
| `rateWeekend` | Weekend Rate | Number | Pricing table: $85 |
| `rate3Day` | 3-Day Rate | Number | Pricing table: $115 |
| `rateWeekly` | Weekly Rate | Number | Pricing table: $225 |
| `rateMonthly` | Monthly Rate | Number | Pricing table: $550 |
| `depositDaily` | Daily Deposit | Number | $100 |
| `depositWeekly` | Weekly Deposit | Number | $150 |
| `depositMonthly` | Monthly Deposit | Number | $200 |
| `fullDescription` | Full Description | Rich Text / Text | Main marketing paragraph |
| `deckDimensions` | Deck Dimensions | Text | Specs row 1 |
| `sideRail` | Side Rail Height | Text | Specs row 2 |
| `loadingRamp` | Loading Ramp | Text | Specs row 3 |
| `deckSurface` | Deck Surface | Text | Specs row 4 |
| `axleSetup` | Axles & Wheels | Text | Specs row 5 |
| `couplerSize` | Coupler & Ball | Text | Specs row 6 |
| `electricalPlug` | Electrical Harness | Text | Specs row 7 |
| `tongueJack` | Tongue Jack | Text | Specs row 8 |
| `tieDownPoints` | Tie-Down Anchor Points| Text | Specs row 9 |
| `recommendedUses` | Recommended Uses | Rich Text / Text | "Best Suited For" bullet points |
| `primaryImage` | Primary Photo | Image | Main hero photo |
| `galleryImages` | Media Gallery | MediaGallery / Image | 3-photo gallery carousel |
| `status` | Fleet Status | Text | "Available" / "Booked" |

---

## 3. Creating the Dynamic Item Page in Wix Studio
1. In Wix Studio Editor, click **Pages & Menu** ➔ **Dynamic Pages** ➔ **+ Add Dynamic Page**.
2. Select your **`Trailers`** collection.
3. Choose **Item Page** (Single Item).
4. Set the URL pattern to: `/trailers/{slug}`.
5. Drag and drop elements onto the page and connect them to the **`#dynamicDataset`**:
   - Page Heading ➔ Connects to `title`
   - Promo Tag ➔ Connects to `badge`
   - Hero Image ➔ Connects to `primaryImage`
   - Description Paragraph ➔ Connects to `fullDescription`
   - Specs Table/List ➔ Connects to `deckDimensions`, `sideRail`, `loadingRamp`, `axleSetup`, etc.
   - Price Display ➔ Connects to `rateDaily`
   - "BOOK THIS TRAILER" Button ➔ Connects to `/booking?trailer={slug}`

---

## 4. Connecting the Full Booking System via CMS

### Create Collection: `Bookings`
In Wix CMS, click **+ Add Collection** ➔ Name it **`Bookings`**.
Set permissions: **Form submitters can create, Only Admin can read/update**.

### Form Fields Mapping to CMS:
Connect your Wix Booking Form input fields directly to the `Bookings` dataset:
1. Full Name input ➔ `customerName`
2. Phone input ➔ `phone`
3. Email input ➔ `email`
4. Driver License input ➔ `driverLicense`
5. Trailer Selection dropdown ➔ Connect to `Trailers` dataset (`title`)
6. Rental Tier dropdown ➔ `rentalTier` (Daily $45 / Weekend $85 / etc.)
7. Pickup Date picker ➔ `pickupDate`
8. Return Date picker ➔ `returnDate`
9. Tow Vehicle input ➔ `towVehicle`
10. Customer Notes ➔ `additionalComments`
11. Submit Button ➔ Connect to **Submit action** on `Bookings` dataset.

### Automatic Approval & Deposit Separation:
Every submission creates a record with `status: "PENDING_APPROVAL"`.
In your Wix Dashboard, the business owner simply reviews the customer's vehicle & license, and changes status to **"APPROVED"**, which triggers an automated payment link via Wix Automations.
