// =============================================================================
// WIX STUDIO - VELO PAGE CODE
// Page: Online Booking & Availability Calendar
// Element in Wix Editor: Embed HTML / iFrame (#htmlEmbed or #html1)
// =============================================================================

import wixData from 'wix-data';
import { createPaymentOrder } from 'backend/pay';
import wixPay from 'wix-pay';

$w.onReady(async function () {
  const embedElement = $w('#htmlEmbed') || $w('#html1');

  // Helper function: Convert any date representation to YYYY-MM-DD without timezone shifts
  function formatYMD(dateVal) {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return null;
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
  }

  // 1. Fetch Blocked Dates from Wix CMS 'BlockedDates' Collection
  const blockedDatesArray = [];
  const blockedByTrailer = {
    'trailer-1': [],
    'trailer-2': []
  };

  try {
    const blockedQuery = await wixData.query('BlockedDates').find();
    blockedQuery.items.forEach(item => {
      // Safely parse date from DateString, StartDate, or dateString
      const rawDate = item.DateString || item.dateString || item.StartDate || item.startDate;
      const ymd = formatYMD(rawDate);

      if (ymd) {
        blockedDatesArray.push(ymd);

        // Check if blocked date is specific to Trailer #1 or Trailer #2 or Both
        const trailerField = JSON.stringify(item.trailerName || item.TrailerName || item['Trailer Name'] || item.TrailerID || item.trailerId || '');
        const appliesTo1 = trailerField.includes('Trailer #1') || trailerField.includes('trailer-1') || trailerField.length === 0;
        const appliesTo2 = trailerField.includes('Trailer #2') || trailerField.includes('trailer-2') || trailerField.length === 0;

        if (appliesTo1) blockedByTrailer['trailer-1'].push(ymd);
        if (appliesTo2) blockedByTrailer['trailer-2'].push(ymd);
      }
    });
  } catch (err) {
    console.warn('Could not fetch BlockedDates from CMS:', err);
  }

  // 2. Fetch Live Rental Pricing from Wix CMS 'Trailers' Collection
  // Allows the business client to modify prices directly in the CMS table without touching code
  const trailerPricingMap = {};
  try {
    const trailersQuery = await wixData.query('Trailers').find();
    trailersQuery.items.forEach(t => {
      const tId = t.slug || t.trailerId || t.TrailerID || (t.title && t.title.includes('#1') ? 'trailer-1' : 'trailer-2');
      trailerPricingMap[tId] = {
        daily: Number(t.DailyRate || t.dailyRate || 45),
        weekend: Number(t.WeekendRate || t.weekendRate || 85),
        threeDay: Number(t.ThreeDayRate || t.threeDayRate || 115),
        weekly: Number(t.WeeklyRate || t.weeklyRate || 225),
        monthly: Number(t.MonthlyRate || t.monthlyRate || 550),
        depositStandard: Number(t.DailyDeposit || t.dailyDeposit || 100),
        depositWeekly: Number(t.WeeklyDeposit || t.weeklyDeposit || 150),
        depositMonthly: Number(t.MonthlyDeposit || t.monthlyDeposit || 200)
      };
    });
  } catch (err) {
    console.warn('Could not fetch Trailers pricing from CMS:', err);
  }

  // Send live CMS data (Blocked Dates + Dynamic Pricing) into the HTML Embed component
  embedElement.postMessage({
    type: 'WIX_CMS_DATA',
    blockedDates: blockedDatesArray,
    blockedByTrailer: blockedByTrailer,
    trailerPricing: trailerPricingMap
  });

  // 2. Listen for Booking Submission from the Embed HTML
  embedElement.onMessage(async (event) => {
    if (event.data && event.data.type === 'SUBMIT_WIX_BOOKING') {
      const data = event.data.payload;

      try {
        // Find matching trailer in 'Trailers' collection for Reference linking
        let trailerRefId = null;
        try {
          const trailerQuery = await wixData.query('Trailers')
            .eq('slug', data.trailerId)
            .or(wixData.query('Trailers').contains('title', data.trailerId === 'trailer-1' ? 'Trailer #1' : 'Trailer #2'))
            .find();
          if (trailerQuery.items.length > 0) {
            trailerRefId = trailerQuery.items[0]._id;
          }
        } catch (e) {
          console.warn('Trailer reference lookup skipped:', e);
        }

        // Prepare record matching your Wix CMS 'Bookings' columns verbatim
        const newBookingRecord = {
          // Both capital and camelCase keys for 100% fail-safe compatibility
          BookingID: data.bookingId,
          title: data.bookingId,
          CustomerName: data.customerName,
          customerName: data.customerName,
          Phone: data.phone,
          phone: data.phone,
          Email: data.email,
          email: data.email,
          DriverLicense: data.driverLicense,
          driverLicense: data.driverLicense,
          TrailerID: data.trailerId,
          trailerId: data.trailerId,
          RentalTier: data.rentalTier,
          rentalTier: data.rentalTier,
          RentalDays: Number(data.rentalDays || 1),
          rentalDays: Number(data.rentalDays || 1),
          PickupDateTime: new Date(data.pickupDateTime),
          pickupDateTime: new Date(data.pickupDateTime),
          ReturnDateTime: new Date(data.returnDateTime),
          returnDateTime: new Date(data.returnDateTime),
          RentalFee: Number(data.rentalFee),
          rentalFee: Number(data.rentalFee),
          SecurityDepositAmount: Number(data.securityDeposit),
          securityDepositAmount: Number(data.securityDeposit),
          TotalCharged: Number(data.totalHold),
          totalCharged: Number(data.totalHold),
          DepositStatus: 'Pending',
          depositStatus: 'Pending',
          BookingStatus: 'PENDING_APPROVAL',
          status: 'PENDING_APPROVAL',
          IntendedUse: data.intendedUse,
          intendedUse: data.intendedUse,
          Notes: data.comments,
          additionalComments: data.comments,
          ReturnInspectionPassed: false
        };

        // If Reference column 'Trailer Name' exists in CMS, link it
        if (trailerRefId) {
          newBookingRecord['trailerName'] = trailerRefId;
          newBookingRecord['TrailerName'] = trailerRefId;
          newBookingRecord['Trailer_Name'] = trailerRefId;
        }

        // Save into Wix CMS 'Bookings' Collection
        const savedItem = await wixData.insert('Bookings', newBookingRecord);

        // Optional: Trigger Wix Pay Order for separate Rental Fee & Refundable Deposit
        try {
          const payment = await createPaymentOrder(
            data.bookingId,
            data.trailerName,
            data.rentalTier,
            data.rentalFee,
            data.securityDeposit
          );

          // Prompt customer with Wix Pay popup
          wixPay.startPayment(payment.id, { show3DS: true })
            .then(result => {
              if (result.status === 'Successful') {
                wixData.update('Bookings', {
                  ...savedItem,
                  DepositStatus: 'Held',
                  depositStatus: 'Held',
                  BookingStatus: 'APPROVED'
                });
              }
            });
        } catch (payErr) {
          console.log('Payment modal skipped or offline booking:', payErr);
        }

        // Send confirmation back to Embed HTML
        embedElement.postMessage({
          type: 'BOOKING_SUBMITTED_SUCCESS',
          message: `✔ Booking request received! Reference #${data.bookingId}. Status: PENDING_APPROVAL by L&D Trailers.`
        });

      } catch (insertErr) {
        console.error('Error saving to Bookings collection:', insertErr);
      }
    }
  });
});
