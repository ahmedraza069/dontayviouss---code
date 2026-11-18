# L&D Trailers — Wix Studio & Velo Backend Implementation Guide
**Business Location:** Corinth, Mississippi  
**Localhost Preview URL:** http://localhost:3000

---

## 1. Required Wix CMS Collections & Data Schema

To deploy this website directly onto Wix Studio without rewriting anything:

### Collection 1: `Trailers` (Fleet CMS)
*Permissions: Anyone can read, Admin can edit/create*
| Field Key | Field Name | Type | Notes |
| :--- | :--- | :--- | :--- |
| `title` | Trailer Name | Text | e.g. "Trailer #1: 6x12 Utility Trailer" |
| `trailerId` | Trailer ID | Text | e.g. "trailer-1", "trailer-2" |
| `size` | Size | Text | "6ft x 12ft" |
| `dimensions` | Dimensions | Text | "6ft Wide x 12ft Long (72\" x 144\")" |
| `badge` | Promo Badge | Text | "Introductory Pricing — Starting at $45/Day" |
| `primaryImage` | Primary Image | Image | High-res commercial exterior |
| `actionImage` | Action / Towing Image | Image | Real hauling photo (e.g. mowers/lumber) |
| `gallery` | Media Gallery | MediaGallery | Multi-photo carousel |
| `description` | Full Description | RichText | Verbatim equipment copy |
| `rateDaily` | Daily Rate | Number | 45 |
| `rateWeekend` | Weekend Rate | Number | 85 |
| `rate3Day` | 3-Day Rate | Number | 115 |
| `rateWeekly` | Weekly Rate | Number | 225 |
| `rateMonthly` | Monthly Rate | Number | 550 |
| `depositDaily` | Daily Deposit | Number | 100 |
| `depositWeekly` | Weekly Deposit | Number | 150 |
| `depositMonthly` | Monthly Deposit | Number | 200 |
| `status` | Fleet Status | Text | "Available" |

*Advantage:* When the business expands to 5+ trailers, the owner simply clicks "+ Add Item" in the Wix Dashboard and enters the new trailer name, photos, and rates. The front-end dropdowns and cards update automatically!

---

### Collection 2: `Bookings` (Reservations & Review)
*Permissions: Form submitters can create, Only Admin can read/update*
| Field Key | Field Name | Type | Notes |
| :--- | :--- | :--- | :--- |
| `title` | Booking Number | Text | "LD-94821" |
| `customerName` | Full Name | Text | Field 1 |
| `phone` | Phone Number | Text | Field 2 |
| `email` | Email Address | Text | Field 3 |
| `driverLicenseInfo` | Driver License | Text | Field 4 (Verified at pickup) |
| `requestedTrailer` | Requested Trailer | Reference/Text | Field 5 |
| `rentalPeriod` | Rental Period | Text | Field 6 ('daily', 'weekend', etc.) |
| `pickupDateTime` | Pickup Date & Time | Date and Time | Field 7 |
| `returnDateTime` | Return Date & Time | Date and Time | Field 8 |
| `intendedUse` | Intended Use | Text | Field 9 |
| `additionalComments` | Additional Comments | Text | Field 10 |
| `rentalPayment` | Rental Payment | Number | Line Item 1 ($45-$550) |
| `refundableSecurityDeposit`| Security Deposit | Number | Line Item 2 ($100-$200) |
| `totalBeforeTax` | Total Authorized | Number | Line 1 + Line 2 |
| `status` | Approval Status | Text | Default: "PENDING_APPROVAL" |
| `paymentStatus` | Payment Status | Text | "AUTHORIZED" / "PAID" |

---

### Collection 3: `BlockedDates` (Calendar Blocking)
| Field Key | Field Name | Type | Notes |
| :--- | :--- | :--- | :--- |
| `dateString` | Date String | Text | "2026-11-20" (YYYY-MM-DD) |
| `reason` | Block Reason | Text | e.g. "Reserved" or "Maintenance" |

---

## 2. Setting Up Online Payments with Separate Line Items

In the Wix Studio Developer panel:
1. Copy `wix-velo/backend/pay.jsw` to your Wix Site Backend files (`backend/pay.jsw`).
2. Copy `wix-velo/backend/bookings.jsw` to `backend/bookings.jsw`.
3. In your **Wix Studio Dashboard -> Settings -> Accept Payments**, enable **Stripe** or **Wix Payments**.
4. Both Credit Cards, Debit Cards, and digital wallets are supported automatically without saving raw credit card numbers to the site.

---

## 3. Automated Emails Setup (Wix Automations)
1. Go to **Automations -> New Automation -> Triggered by Wix Data Insert in Bookings**.
2. Select **Action: Send Triggered Email**.
3. Create template `booking_received_notification` with variables:
   - `{{customerName}}`
   - `{{bookingNumber}}`
   - `{{rentalFee}}`
   - `{{securityDeposit}}`
   - `{{pickupDate}}`
4. Body text includes:  
   *"Thank you for choosing L&D Trailers in Corinth, MS. Your booking request has been received and is currently under review for equipment availability and tow vehicle verification."*
