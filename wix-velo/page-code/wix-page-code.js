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

  // 1. Fetch Blocked Dates from Wix CMS 'BlockedDates' Collection
  try {
    const blockedQuery = await wixData.query('BlockedDates').find();
    const blockedDatesArray = [];

    blockedQuery.items.forEach(item => {
      // Handles both DateString text and StartDate Date object safely
      if (item.dateString) {
        blockedDatesArray.push(String(item.dateString).substring(0, 10));
      } else if (item.DateString) {
        const d = new Date(item.DateString);
        blockedDatesArray.push(d.toISOString().substring(0, 10));
      } else if (item.startDate) {
        const d = new Date(item.startDate);
        blockedDatesArray.push(d.toISOString().substring(0, 10));
      }
    });

    // Send live CMS blocked dates into the HTML Embed
    embedElement.postMessage({
      type: 'WIX_CMS_DATA',
      blockedDates: blockedDatesArray
    });
  } catch (err) {
    console.warn('Could not fetch BlockedDates from CMS:', err);
  }

  // 2. Listen for Booking Submission from the Embed HTML
  embedElement.onMessage(async (event) => {
    if (event.data && event.data.type === 'SUBMIT_WIX_BOOKING') {
      const data = event.data.payload;

      try {
        // Find matching trailer in 'Trailers' collection for Multi-Reference / Reference linking
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
