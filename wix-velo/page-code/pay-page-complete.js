// =============================================================================
// WIX STUDIO - VELO PAGE CODE: Pay / Checkout Page
// Page URL: /pay (or /payment)
// Purpose: Secure Payment for Approved Bookings (Rental Fee + Refundable Deposit)
// Backend Dependency: backend/pay.jsw
// =============================================================================

import wixData from 'wix-data';
import wixPay from 'wix-pay';
import wixLocation from 'wix-location';
import { createPaymentOrder } from 'backend/pay';

$w.onReady(async function () {
  // 1. URL থেকে Booking ID নেওয়া (যেমন: /pay?bookingId=LD-3073)
  const query = wixLocation.query;
  const initialBookingId = query.bookingId || query.id || query.ref;

  // UI কন্টেইনার ও এলিমেন্টস
  const searchBox = $w('#boxSearch');             // Booking ID খোঁজার বক্স (যদি URL-এ ID না থাকে)
  const detailsBox = $w('#boxBookingDetails');     // বুকিং ডিটেইলস কার্ড
  const successBox = $w('#boxSuccessMessage');     // পেমেন্ট সফল হওয়ার মেসেজ
  const errorText = $w('#textErrorMessage');       // কোনো এরর হলে দেখানোর টেক্সট
  const payBtn = $w('#btnPayNow');                 // পেমেন্ট করার বাটন

  // লুকআপ বাটন ক্লিক হ্যান্ডলার (ম্যানুয়াল খোঁজার জন্য)
  if ($w('#btnSearchBooking')) {
    $w('#btnSearchBooking').onClick(() => {
      const manualId = $w('#inputBookingId') ? $w('#inputBookingId').value.trim() : '';
      if (manualId) loadBookingData(manualId);
    });
  }

  // যদি URL-এ সরাসরি ID থাকে, সাথে সাথে ডাটা লোড হবে
  if (initialBookingId) {
    if ($w('#inputBookingId')) $w('#inputBookingId').value = initialBookingId;
    await loadBookingData(initialBookingId);
  } else {
    // URL-এ ID না থাকলে শুধু সার্চ বক্স দেখাবে
    if (searchBox) searchBox.show();
    if (detailsBox) detailsBox.collapse();
    if (successBox) successBox.collapse();
  }

  /**
   * CMS থেকে বুকিংয়ের সব তথ্য এনে স্ক্রিনে সুন্দরভাবে সাজায়
   */
  async function loadBookingData(bookingNumber) {
    try {
      if (errorText) errorText.hide();

      const queryResult = await wixData.query('Bookings')
        .eq('BookingID', bookingNumber)
        .or(wixData.query('Bookings').eq('title', bookingNumber))
        .find();

      if (queryResult.items.length === 0) {
        if (errorText) {
          errorText.text = `⚠️ Booking reference #${bookingNumber} not found. Please verify the number or call (662) 555-0199.`;
          errorText.show();
        }
        if (detailsBox) detailsBox.collapse();
        return;
      }

      const booking = queryResult.items[0];

      // ১. পেমেন্ট কি ইতিমধ্যে দেওয়া হয়ে গেছে?
      if (booking.PaymentStatus === 'PAID') {
        if (detailsBox) detailsBox.collapse();
        if (searchBox) searchBox.collapse();
        if (successBox) {
          successBox.expand();
          if ($w('#textSuccessTitle')) $w('#textSuccessTitle').text = `✔ Booking #${bookingNumber} is Already Paid & Confirmed!`;
          if ($w('#textSuccessDesc')) $w('#textSuccessDesc').text = `Your trailer is reserved for pickup on ${formatDisplayDate(booking.PickupDateTime)}. We look forward to seeing you!`;
        }
        return;
      }

      // ২. বুকিং কি মালিক দ্বারা অনুমোদিত হয়েছে?
      const isApproved = Boolean(
        booking.IsApproved === true || 
        String(booking.BookingStatus).toUpperCase() === 'CONFIRMED'
      );

      if (!isApproved) {
        if (errorText) {
          errorText.text = `⏳ Booking #${bookingNumber} is currently PENDING OWNER REVIEW. Once approved by our team, payment will be enabled.`;
          errorText.show();
        }
        if (detailsBox) detailsBox.expand();
        if (payBtn) {
          payBtn.label = 'Pending Owner Approval';
          payBtn.disable();
        }
      } else {
        if (payBtn) payBtn.enable();
      }

      // ৩. স্ক্রিনে টেক্সটগুলো বসানো
      if (detailsBox) detailsBox.expand();
      if (successBox) successBox.collapse();

      // হেডার ও আইডি
      if ($w('#textDisplayBookingId')) $w('#textDisplayBookingId').text = `#${booking.BookingID || booking.title}`;
      if ($w('#textStatusBadge')) {
        $w('#textStatusBadge').text = isApproved ? 'APPROVED - READY TO PAY' : 'PENDING APPROVAL';
      }

      // ট্রেইলার ও কাস্টমার
      if ($w('#textTrailerTitle')) $w('#textTrailerTitle').text = booking.TrailerName || '6x12 Commercial Utility Trailer';
      if ($w('#textCustomerName')) $w('#textCustomerName').text = booking.CustomerName || 'Customer';
      if ($w('#textCustomerPhone')) $w('#textCustomerPhone').text = booking.Phone || '';
      if ($w('#textRentalTier')) $w('#textRentalTier').text = String(booking.RentalTier || 'Daily').toUpperCase() + ' RENTAL';

      // পিকআপ ও ড্রপঅফ তারিখ
      if ($w('#textPickupTime')) $w('#textPickupTime').text = formatDisplayDate(booking.PickupDateTime);
      if ($w('#textReturnTime')) $w('#textReturnTime').text = formatDisplayDate(booking.ReturnDateTime);

      // প্রাইস ব্রেকডাউন (ক্লায়েন্টের পয়েন্ট ৪ ও ৬ অনুযায়ী আলাদা ২ লাইন)
      const rentalFee = Number(booking.RentalFee || 45);
      const securityDeposit = Number(booking.SecurityDepositAmount || 100);
      const totalToPay = rentalFee + securityDeposit;

      if ($w('#textRentalFeeAmount')) $w('#textRentalFeeAmount').text = `$${rentalFee.toFixed(2)}`;
      if ($w('#textDepositAmount')) $w('#textDepositAmount').text = `$${securityDeposit.toFixed(2)}`;
      if ($w('#textTotalDueAmount')) $w('#textTotalDueAmount').text = `$${totalToPay.toFixed(2)}`;

      // ৪. পেমেন্ট বাটন ক্লিক হ্যান্ডলার (Wix Native Checkout Modal চালু করবে)
      if (payBtn && isApproved) {
        payBtn.label = `PAY $${totalToPay.toFixed(2)} WITH WIX SECURE CHECKOUT`;

        payBtn.onClick(async () => {
          payBtn.disable();
          payBtn.label = 'Opening Secure Checkout...';

          try {
            // pay.jsw ব্যাকএন্ড মডিউল কল করে Wix Payment Order তৈরি করা
            const paymentOrder = await createPaymentOrder({
              bookingId: booking.BookingID || booking.title,
              trailerName: booking.TrailerName,
              rentalTier: booking.RentalTier,
              rentalFee: rentalFee,
              securityDeposit: securityDeposit,
              customerName: booking.CustomerName,
              email: booking.Email,
              phone: booking.Phone
            });

            // Wix Native Payment Popup Modal স্ক্রিনে ওপেন করা
            const paymentResult = await wixPay.startPayment(paymentOrder.id, {
              showThankYouPage: false
            });

            if (paymentResult.status === 'Successful') {
              // CMS-এ স্ট্যাটাস PAID আপডেট করা
              await wixData.update('Bookings', {
                ...booking,
                PaymentStatus: 'PAID',
                DepositStatus: 'PAID',
                PaidAt: new Date()
              });

              if (detailsBox) detailsBox.collapse();
              if (searchBox) searchBox.collapse();
              if (successBox) {
                successBox.expand();
                if ($w('#textSuccessTitle')) $w('#textSuccessTitle').text = '🎉 Payment Successful!';
                if ($w('#textSuccessDesc')) {
                  $w('#textSuccessDesc').text = `Thank you, ${booking.CustomerName}! Your payment of $${totalToPay.toFixed(2)} ($${rentalFee} Rental + $${securityDeposit} Deposit) has been processed. A receipt has been sent to ${booking.Email}.`;
                }
              }
            } else {
              // কাস্টমার উইন্ডো কেটে দিলে বা পেমেন্ট ফেইল হলে
              payBtn.label = `PAY $${totalToPay.toFixed(2)} WITH WIX SECURE CHECKOUT`;
              payBtn.enable();
            }

          } catch (payErr) {
            console.error('Checkout failed:', payErr);
            payBtn.label = `PAY $${totalToPay.toFixed(2)} WITH WIX SECURE CHECKOUT`;
            payBtn.enable();
            if (errorText) {
              errorText.text = 'Payment checkout error. Please contact L&D Trailers directly at (662) 555-0199.';
              errorText.show();
            }
          }
        });
      }

    } catch (err) {
      console.error('Error in loadBookingData:', err);
    }
  }

  // হেল্পার: তারিখ সুন্দর ফরম্যাটে দেখানো
  function formatDisplayDate(dateVal) {
    if (!dateVal) return 'Scheduled Pickup';
    try {
      const d = new Date(dateVal);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return String(dateVal);
    }
  }
});
