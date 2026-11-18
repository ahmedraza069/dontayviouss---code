// =============================================================================
// WIX VELO PAGE CODE: bookingPage.js
// Place this code directly inside the Wix Studio Code Panel for 'Online Booking'
// =============================================================================

import { createBookingRequest, checkTrailerAvailability, getBlockedDates } from 'backend/bookings';
import { createPaymentOrder } from 'backend/pay';
import wixPay from 'wix-pay';
import wixWindow from 'wix-window';

$w.onReady(async function () {
  // 1. Populate initial dates (Tomorrow 8:00 AM)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0);
  $w('#pickupDatePicker').value = tomorrow;

  // 2. Fetch and apply blocked dates to disable on the DatePicker
  try {
    const blocked = await getBlockedDates();
    if (blocked && blocked.length > 0) {
      $w('#pickupDatePicker').disabledDates = blocked.map(d => new Date(d));
    }
  } catch (e) {
    console.warn('Could not load blocked dates:', e);
  }

  // 3. Set event listeners for real-time price recalculation
  $w('#periodDropdown').onChange(() => recalculatePricing());
  $w('#trailerDropdown').onChange(() => recalculatePricing());
  $w('#pickupDatePicker').onChange(() => updateReturnDate());

  // Initial calculation
  updateReturnDate();
  recalculatePricing();

  // 4. Form Submission Handler
  $w('#submitBookingBtn').onClick(async () => {
    await handleBookingSubmit();
  });
});

/**
 * Recalculates separate Rental Fee & Security Deposit line items
 */
function recalculatePricing() {
  const period = $w('#periodDropdown').value || 'daily';
  
  const rates = { daily: 45, weekend: 85, '3day': 115, weekly: 225, monthly: 550 };
  const deposits = { daily: 100, weekend: 100, '3day': 100, weekly: 150, monthly: 200 };
  const labels = {
    daily: 'Daily Rental (24 Hours)',
    weekend: 'Weekend Rental (Fri-Sun)',
    '3day': '3-Day Rental (72 Hours)',
    weekly: 'Weekly Rental (7 Days)',
    monthly: 'Monthly Rental (30 Days)'
  };

  const rentalFee = rates[period] || 45;
  const securityDeposit = deposits[period] || 100;
  const total = rentalFee + securityDeposit;

  // Update UI Elements
  $w('#rentalFeeText').text = `$${rentalFee.toFixed(2)}`;
  $w('#securityDepositText').text = `$${securityDeposit.toFixed(2)}`;
  $w('#totalEstimatedText').text = `$${total.toFixed(2)}`;
  $w('#periodLabelText').text = labels[period];
}

/**
 * Calculates Return Date based on selected rental duration
 */
function updateReturnDate() {
  const pickup = $w('#pickupDatePicker').value;
  if (!pickup) return;

  const period = $w('#periodDropdown').value || 'daily';
  let hours = 24;
  if (period === 'weekend') hours = 48;
  if (period === '3day') hours = 72;
  if (period === 'weekly') hours = 168;
  if (period === 'monthly') hours = 720;

  const returnDate = new Date(pickup.getTime() + hours * 60 * 60 * 1000);
  $w('#returnDatePicker').value = returnDate;
}

/**
 * Submits the 10-Field Booking Form and triggers Stripe / Wix Payments Checkout
 */
async function handleBookingSubmit() {
  // Validate required inputs
  if (!$w('#fullNameInput').valid || !$w('#phoneInput').valid || !$w('#emailInput').valid || !$w('#driverLicenseInput').valid) {
    wixWindow.openLightbox('ValidationWarning', { message: 'Please complete all required fields.' });
    return;
  }

  $w('#submitBookingBtn').disable();
  $w('#loadingIndicator').show();

  const bookingData = {
    customerName: $w('#fullNameInput').value,
    phone: $w('#phoneInput').value,
    email: $w('#emailInput').value,
    driverLicenseInfo: $w('#driverLicenseInput').value,
    trailerId: $w('#trailerDropdown').value,
    trailerName: $w('#trailerDropdown').options.find(o => o.value === $w('#trailerDropdown').value).label,
    period: $w('#periodDropdown').value,
    pickupDateTime: $w('#pickupDatePicker').value,
    returnDateTime: $w('#returnDatePicker').value,
    intendedUse: $w('#intendedUseInput').value,
    additionalComments: $w('#commentsInput').value
  };

  try {
    // 1. Submit to Wix CMS Collection
    const result = await createBookingRequest(bookingData);

    // 2. Create Wix Pay order separating Rental Fee and Refundable Security Deposit
    const payment = await createPaymentOrder(
      result.bookingNumber,
      bookingData.trailerName,
      $w('#periodLabelText').text,
      result.rentalFee,
      result.securityDeposit
    );

    // 3. Launch secure payment dialog (Credit/Debit Cards via Stripe / Wix Payments)
    const paymentResult = await wixPay.startPayment(payment.id);

    if (paymentResult.status === 'Successful' || paymentResult.status === 'Pending') {
      wixWindow.openLightbox('BookingConfirmationSuccess', {
        bookingNumber: result.bookingNumber,
        customerName: bookingData.customerName,
        totalAuthorized: result.rentalFee + result.securityDeposit
      });
      $w('#bookingForm').reset();
    }
  } catch (err) {
    console.error(err);
    wixWindow.openLightbox('ErrorAlert', { message: err.message });
  } finally {
    $w('#submitBookingBtn').enable();
    $w('#loadingIndicator').hide();
  }
}
