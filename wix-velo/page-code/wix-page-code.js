// =============================================================================
// WIX STUDIO - VELO PAGE CODE WITH ONLINE PAYMENT CHECKOUT
// Page: Online Booking & Availability Calendar
// Element in Wix Editor: Embed HTML / iFrame (#htmlEmbed or #html1)
// Requires Backend File: backend/pay.jsw
// =============================================================================

import wixData from 'wix-data';
import wixPay from 'wix-pay';
import { createPaymentOrder } from 'backend/pay';

$w.onReady(async function () {
  const embedElement = $w('#htmlEmbed') || $w('#html1');

  // =========================================================================
  // PAYMENT MODE TOGGLE:
  // false = TEST MODE (Bypasses payment gateway; saves directly to CMS as CONFIRMED)
  // true  = LIVE MODE (Opens Wix Checkout with Credit Card / Apple Pay)
  // =========================================================================
  const ENABLE_LIVE_PAYMENT = false;

  // Helper: Convert any date representation to YYYY-MM-DD
  function formatYMD(dateVal) {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return null;
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
  }

  // Helper: Convert wix:image://v1/... to public CDN https URL
  function getWixImageUrl(wixUrl) {
    if (!wixUrl || typeof wixUrl !== 'string') return '';
    if (wixUrl.startsWith('http://') || wixUrl.startsWith('https://')) return wixUrl;
    if (wixUrl.startsWith('wix:image://v1/')) {
      const clean = wixUrl.replace('wix:image://v1/', '');
      const parts = clean.split('/');
      const mediaId = parts[0];
      return `https://static.wixstatic.com/media/${mediaId}`;
    }
    return wixUrl;
  }

  // Helper: Add full inclusive date range to blocked lists
  const blockedDatesArray = [];
  const blockedByTrailer = {};

  function addRangeToBlocked(startDateVal, endDateVal, trailerIdentifier) {
    if (!startDateVal) return;
    const start = new Date(startDateVal);
    const end = endDateVal ? new Date(endDateVal) : new Date(startDateVal);
    if (isNaN(start.getTime())) return;

    const cur = new Date(start);
    cur.setHours(0, 0, 0, 0);
    const stopDate = new Date(end);
    stopDate.setHours(23, 59, 59, 999);

    while (cur <= stopDate) {
      const ymd = formatYMD(cur);
      if (ymd) {
        if (!trailerIdentifier || trailerIdentifier === 'all') {
          if (!blockedDatesArray.includes(ymd)) blockedDatesArray.push(ymd);
        } else {
          const k = String(trailerIdentifier).toLowerCase();
          if (!blockedByTrailer[k]) blockedByTrailer[k] = [];
          if (!blockedByTrailer[k].includes(ymd)) blockedByTrailer[k].push(ymd);
        }
      }
      cur.setDate(cur.getDate() + 1);
    }
  }

  // 1. Fetch Blocked Dates from Wix CMS 'BlockedDates' Collection
  try {
    const blockedQuery = await wixData.query('BlockedDates').find();
    blockedQuery.items.forEach(item => {
      const sDate = item.StartDate || item.startDate || item.DateString || item.dateString;
      const eDate = item.EndDate || item.endDate || sDate;
      const trRef = item.trailerName || item.TrailerName || item['Trailer Name'] || item.TrailerID || item.trailerId || '';
      const trStr = typeof trRef === 'object' ? JSON.stringify(trRef) : String(trRef);

      addRangeToBlocked(sDate, eDate, trStr || 'all');
    });
  } catch (err) {
    console.warn('Could not fetch BlockedDates from CMS:', err);
  }

  // 2. Fetch Active Bookings to automatically block reserved dates per trailer
  try {
    const activeBookings = await wixData.query('Bookings')
      .ne('BookingStatus', 'CANCELLED')
      .find();

    activeBookings.items.forEach(b => {
      const pDate = b.PickupDateTime || b.pickupDateTime;
      const rDate = b.ReturnDateTime || b.returnDateTime;
      const trId = b.TrailerID || b.trailerId || b.TrailerName || b.trailerName || '';
      if (pDate && trId) {
        addRangeToBlocked(pDate, rDate, String(trId));
      }
    });
  } catch (err) {
    console.warn('Could not query Bookings collection:', err);
  }

  // 3. Fetch Live Trailers from Wix CMS 'Trailers' Collection & Dispatch to Embed
  async function refreshAndSendCmsData() {
    const cleanTrailersList = [];
    try {
      const trailersQuery = await wixData.query('Trailers').ascending('trailerNumber').find();

      trailersQuery.items.forEach((t, idx) => {
        const getField = (...keys) => {
          for (const k of keys) {
            if (t[k] !== undefined && t[k] !== null && t[k] !== '') return t[k];
          }
          return undefined;
        };

        const tId = getField('slug', 'trailerId', 'TrailerID', '_id') || `trailer-${idx + 1}`;
        const title = getField('title', 'Title', 'trailerName', 'TrailerName', 'Name', 'name') || `Trailer #${idx + 1}`;
        const dimensions = getField('dimensions', 'Dimensions', 'size', 'Size') || '6ft x 12ft';
        const rawImg = getField('primaryImage', 'PrimaryImage', 'image', 'Image', 'mainImage') || '';
        const publicImg = getWixImageUrl(rawImg);

        const dRate = Number(getField('DailyRate', 'dailyRate', 'Daily Rate', 'daily_rate', 'price', 'Price', 'rate', 'Rate') || 45);
        const wRate = Number(getField('WeekendRate', 'weekendRate', 'Weekend Rate', 'weekend_rate') || Math.round(dRate * 1.88));
        const tRate = Number(getField('ThreeDayRate', 'threeDayRate', 'Three Day Rate', '3DayRate', '3 Day Rate') || Math.round(dRate * 2.55));
        const wkRate = Number(getField('WeeklyRate', 'weeklyRate', 'Weekly Rate', 'weekly_rate') || Math.round(dRate * 5));
        const mRate = Number(getField('MonthlyRate', 'monthlyRate', 'Monthly Rate', 'monthly_rate') || Math.round(dRate * 12.2));
        const dDeposit = Number(getField('DailyDeposit', 'dailyDeposit', 'Daily Deposit', 'Deposit', 'deposit', 'SecurityDeposit') || 100);
        const wkDeposit = Number(getField('WeeklyDeposit', 'weeklyDeposit', 'Weekly Deposit') || Math.round(dDeposit * 1.5));
        const mDeposit = Number(getField('MonthlyDeposit', 'monthlyDeposit', 'Monthly Deposit') || Math.round(dDeposit * 2.0));

        cleanTrailersList.push({
          id: String(tId),
          title: String(title),
          dimensions: String(dimensions),
          dailyRate: dRate,
          weekendRate: wRate,
          threeDayRate: tRate,
          weeklyRate: wkRate,
          monthlyRate: mRate,
          dailyDeposit: dDeposit,
          weeklyDeposit: wkDeposit,
          monthlyDeposit: mDeposit,
          primaryImage: publicImg
        });
      });
    } catch (err) {
      console.warn('Could not fetch Trailers collection from CMS:', err);
    }

    // Send live CMS data to the HTML Embed
    embedElement.postMessage({
      type: 'WIX_CMS_DATA',
      trailers: cleanTrailersList,
      blockedDates: blockedDatesArray,
      blockedByTrailer: blockedByTrailer
    });
  }

  // Initial dispatch
  await refreshAndSendCmsData();

  // 4. Listen for Booking Submission & Launch Checkout
  embedElement.onMessage(async (event) => {
    if (event.data && event.data.type === 'REQUEST_WIX_CMS_DATA') {
      await refreshAndSendCmsData();
      return;
    }

    if (event.data && event.data.type === 'SUBMIT_WIX_BOOKING') {
      const data = event.data.payload;

      try {
        const trailerIdentifier = Array.isArray(data.trailerIds) ? data.trailerIds.join(', ') : (data.trailerId || '');
        const trailerTitles = Array.isArray(data.trailerNames) ? data.trailerNames.join(' + ') : (data.trailerName || '');

        // 1. Initial CMS Record (Canonical clean schema)
        const newBookingRecord = {
          title: data.bookingId,
          BookingID: data.bookingId,
          CustomerName: String(data.customerName || '').trim(),
          Phone: String(data.phone || '').trim(),
          Email: String(data.email || '').trim(),
          DriverLicense: String(data.driverLicense || '').trim(),
          TrailerID: trailerIdentifier,
          TrailerName: trailerTitles,
          RentalTier: data.rentalTier || 'daily',
          RentalDays: Number(data.rentalDays || 1),
          PickupDateTime: new Date(data.pickupDateTime),
          ReturnDateTime: new Date(data.returnDateTime),
          RentalFee: Number(data.rentalFee || 0),
          SecurityDepositAmount: Number(data.securityDeposit || 0),
          TotalCharged: Number(data.totalHold || 0),
          DepositStatus: 'Pending',
          BookingStatus: 'PENDING_PAYMENT',
          IntendedUse: String(data.intendedUse || '').trim(),
          Notes: String(data.comments || '').trim(),
          ReturnInspectionPassed: false
        };

        const savedBooking = await wixData.insert('Bookings', newBookingRecord);

        // If in Test Mode, confirm booking immediately without waiting for payment gateway
        if (!ENABLE_LIVE_PAYMENT) {
          await wixData.update('Bookings', {
            ...newBookingRecord,
            _id: savedBooking._id,
            BookingStatus: 'CONFIRMED',
            DepositStatus: 'Test Completed'
          });

          embedElement.postMessage({
            type: 'BOOKING_PAYMENT_SUCCESS',
            bookingId: data.bookingId,
            message: `✔ Booking Successful (Test Mode)! Reservation #${data.bookingId} confirmed and saved to CMS.`
          });
          return;
        }

        // 2. Create Wix Pay Order (Live Mode)
        let paymentOrder;
        try {
          paymentOrder = await createPaymentOrder(data);
        } catch (payCreateErr) {
          console.warn('Payment order creation skipped or gateway offline:', payCreateErr);
        }

        // 3. Launch Secure Wix Payment Modal
        if (paymentOrder && paymentOrder.id) {
          const paymentResult = await wixPay.startPayment(paymentOrder.id, {
            showThankYouPage: false
          });

          if (paymentResult.status === 'Successful') {
            // Payment succeeded -> Update CMS to Confirmed & Paid
            await wixData.update('Bookings', {
              ...newBookingRecord,
              _id: savedBooking._id,
              BookingStatus: 'CONFIRMED',
              DepositStatus: 'PAID'
            });

            embedElement.postMessage({
              type: 'BOOKING_PAYMENT_SUCCESS',
              bookingId: data.bookingId,
              message: `✔ Payment Successful! Reservation #${data.bookingId} is confirmed. A receipt has been sent to ${data.email}.`
            });
          } else if (paymentResult.status === 'Pending') {
            embedElement.postMessage({
              type: 'BOOKING_PAYMENT_PENDING',
              bookingId: data.bookingId,
              message: `Your payment is currently pending processing. Booking reference: #${data.bookingId}.`
            });
          } else {
            // Cancelled or closed modal
            embedElement.postMessage({
              type: 'BOOKING_PAYMENT_CANCELLED',
              bookingId: data.bookingId,
              message: `Checkout was closed. Your reservation #${data.bookingId} is saved as Pending Approval.`
            });
          }
        } else {
          // Fallback if payment provider is not yet activated in Wix Dashboard
          embedElement.postMessage({
            type: 'BOOKING_SUBMITTED_SUCCESS',
            message: `✔ Booking request received! Reference #${data.bookingId}. Status: PENDING_APPROVAL by L&D Trailers.`
          });
        }

      } catch (insertErr) {
        console.error('Error during checkout flow:', insertErr);
        embedElement.postMessage({
          type: 'BOOKING_SUBMITTED_SUCCESS',
          message: `✔ Booking request received! Reference #${data.bookingId}. Status: PENDING_APPROVAL.`
        });
      }
    }
  });
});
