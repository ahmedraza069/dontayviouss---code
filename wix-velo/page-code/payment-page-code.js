// =============================================================================
// WIX STUDIO / VELO PAGE CODE: payment-page-code.js
// Page Name: Pay / Payment (URL: /pay or /payment)
// Purpose: Allows customers to pay for approved bookings online via credit card/Apple Pay
// Triggered from: The link in the Customer Approval Email
// =============================================================================

import wixData from 'wix-data';
import wixPay from 'wix-pay';
import wixLocation from 'wix-location';
import { createPaymentOrder } from 'backend/pay';

$w.onReady(async function () {
  // 1. Extract bookingId from URL query parameter (e.g. /pay?bookingId=LD-3073)
  const query = wixLocation.query;
  const bookingId = query.bookingId || query.id || query.ref;

  const statusBox = $w('#statusBox') || $w('#boxStatus');
  const detailsBox = $w('#detailsBox') || $w('#boxDetails');
  const payBtn = $w('#payButton') || $w('#btnPay');
  const errorText = $w('#errorText') || $w('#textError');

  if (!bookingId) {
    if (errorText) {
      errorText.text = '⚠️ No Booking ID provided. Please check the link in your approval email.';
      errorText.show();
    }
    return;
  }

  // 2. Fetch Booking from CMS
  try {
    const results = await wixData.query('Bookings')
      .eq('BookingID', bookingId)
      .or(wixData.query('Bookings').eq('title', bookingId))
      .find();

    if (results.items.length === 0) {
      if (errorText) {
        errorText.text = `⚠️ Booking #${bookingId} not found in system. Please call (662) 555-0199 for assistance.`;
        errorText.show();
      }
      return;
    }

    const booking = results.items[0];

    // Check if already paid
    if (booking.PaymentStatus === 'PAID') {
      if (statusBox) statusBox.show();
      if ($w('#textStatus')) $w('#textStatus').text = `✔ Booking #${bookingId} has already been PAID and is fully confirmed!`;
      if (payBtn) payBtn.disable();
      return;
    }

    // Populate UI Elements with Booking Details
    if ($w('#textBookingId')) $w('#textBookingId').text = `Booking Reference: #${booking.BookingID || booking.title}`;
    if ($w('#textCustomerName')) $w('#textCustomerName').text = `Customer: ${booking.CustomerName}`;
    if ($w('#textTrailerName')) $w('#textTrailerName').text = `Trailer: ${booking.TrailerName || '6x12 Utility Trailer'}`;
    if ($w('#textPickupDate')) {
      const pDate = booking.PickupDateTime ? new Date(booking.PickupDateTime).toLocaleString() : 'N/A';
      $w('#textPickupDate').text = `Pickup: ${pDate}`;
    }

    const rentalFee = Number(booking.RentalFee || 45);
    const deposit = Number(booking.SecurityDepositAmount || 100);
    const totalAmount = rentalFee + deposit;

    if ($w('#textRentalFee')) $w('#textRentalFee').text = `$${rentalFee.toFixed(2)}`;
    if ($w('#textDeposit')) $w('#textDeposit').text = `$${deposit.toFixed(2)} (Refundable)`;
    if ($w('#textTotal')) $w('#textTotal').text = `$${totalAmount.toFixed(2)}`;

    if (payBtn) {
      payBtn.label = `PAY $${totalAmount.toFixed(2)} NOW`;
      payBtn.enable();

      // Handle Online Payment Click
      payBtn.onClick(async () => {
        payBtn.disable();
        payBtn.label = 'Processing Payment...';

        try {
          // 3. Create Wix Pay order via backend/pay.jsw
          const paymentOrder = await createPaymentOrder({
            bookingId: booking.BookingID || booking.title,
            trailerName: booking.TrailerName,
            rentalTier: booking.RentalTier,
            rentalFee: rentalFee,
            securityDeposit: deposit,
            customerName: booking.CustomerName,
            email: booking.Email,
            phone: booking.Phone
          });

          // 4. Launch Secure Checkout Modal
          const paymentResult = await wixPay.startPayment(paymentOrder.id, {
            showThankYouPage: false
          });

          if (paymentResult.status === 'Successful') {
            // Update CMS Record to PAID
            await wixData.update('Bookings', {
              ...booking,
              PaymentStatus: 'PAID',
              DepositStatus: 'PAID',
              PaidAt: new Date()
            });

            if (statusBox) statusBox.show();
            if ($w('#textStatus')) {
              $w('#textStatus').text = `🎉 Payment Successful! Your trailer is 100% reserved for pickup. Receipt sent to ${booking.Email}.`;
            }
            payBtn.label = '✔ PAID IN FULL';
          } else {
            payBtn.label = `PAY $${totalAmount.toFixed(2)} NOW`;
            payBtn.enable();
            if (errorText) {
              errorText.text = 'Payment was not completed. You can try again or pay in person at pickup.';
              errorText.show();
            }
          }
        } catch (payErr) {
          console.error('Payment Error:', payErr);
          payBtn.label = `PAY $${totalAmount.toFixed(2)} NOW`;
          payBtn.enable();
          if (errorText) {
            errorText.text = 'Payment gateway error. Please contact L&D Trailers at (662) 555-0199.';
            errorText.show();
          }
        }
      });
    }

  } catch (err) {
    console.error('Error fetching booking for payment:', err);
  }
});
