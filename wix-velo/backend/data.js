// =============================================================================
// WIX VELO BACKEND: data.js (Automated Wix Invoicing & Deposit Refund Workflow)
// Location in Wix Studio: Code -> Backend Files -> data.js
// Handles: 1. Booking Defaults, 2. Auto-Invoicing on Approval, 3. Deposit Refund Alerts
// =============================================================================

import wixData from 'wix-data';
import { contacts } from 'wix-crm-backend';
import { invoices } from 'wix-billing-backend';

/**
 * Booking submit er somoy default value set kore
 */
export function Bookings_beforeInsert(item, context) {
  if (item.IsApproved === undefined) item.IsApproved = false;
  if (!item.BookingStatus) item.BookingStatus = 'PENDING_APPROVAL';
  if (!item.DepositStatus) item.DepositStatus = 'Pending';
  if (!item.PaymentStatus) item.PaymentStatus = 'UNPAID';
  if (item.ReturnInspectionPassed === undefined) item.ReturnInspectionPassed = false;
  item.CreatedAt = new Date();
  return item;
}

/**
 * Owner CMS e update korle:
 * A. IsApproved = true hole -> Official Wix Invoice generate kore email pathay
 * B. DepositStatus = 'Refunded' hole -> Deposit Refund confirmation notice pathay
 */
export async function Bookings_afterUpdate(item, context) {
  try {
    const oldItem = context.currentItem || {};

    // -------------------------------------------------------------------------
    // 1. APPROVAL & INVOICE GENERATION
    // -------------------------------------------------------------------------
    const wasApprovedBefore = Boolean(oldItem.IsApproved === true);
    const isNowApproved = Boolean(item.IsApproved === true);

    if (!wasApprovedBefore && isNowApproved && item.PaymentStatus !== 'PAID') {
      const bookingNumber = item.BookingID || item.title || 'LD-REF';
      console.log(`✅ [APPROVED] Booking #${bookingNumber}. Resolving contact & generating invoice...`);

      const email = String(item.Email || '').trim();
      if (!email) {
        console.warn(`Cannot send invoice: No email provided for booking #${bookingNumber}`);
        return;
      }

      const fee = Number(item.RentalFee || 45);
      const deposit = Number(item.SecurityDepositAmount || 100);

      const customerFullName = (item.CustomerName || 'Valued Customer').trim();
      const nameParts = customerFullName.split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Step 1: contactId toiri
      const contactInfo = {
        name: { first: firstName, last: lastName },
        emails: [{ email: email, tag: 'MAIN' }]
      };
      if (item.Phone) {
        contactInfo.phones = [{ phone: String(item.Phone), tag: 'MOBILE' }];
      }

      const contactResult = await contacts.appendOrCreateContact(contactInfo);
      const contactId = contactResult.contactId;

      const now = new Date();
      const dueDate = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours

      // Step 2: Invoice data
      const invoiceData = {
        title: `L&D Trailers - Reservation #${bookingNumber}`,
        customer: {
          contactId: contactId,
          email: email,
          name: {
            first: firstName,
            last: lastName
          }
        },
        currency: 'USD',
        dates: {
          issueDate: now,
          dueDate: dueDate
        },
        payments: [],
        lineItems: [
          {
            id: 'rental-fee',
            name: `${item.TrailerName || '6x12 Utility Trailer'} (${item.RentalTier || 'Daily'})`,
            price: fee,
            quantity: 1,
            description: `Pickup: ${item.PickupDateTime ? new Date(item.PickupDateTime).toLocaleDateString() : 'Scheduled'}`
          },
          {
            id: 'security-deposit',
            name: 'Refundable Security Deposit',
            price: deposit,
            quantity: 1,
            description: '100% refunded after post-rental return inspection'
          }
        ],
        metadata: {
          notes: 'Please bring your valid Driver License (Must be 21+) and towing vehicle with 2" ball coupler at pickup. For questions call (662) 555-0199.'
        }
      };

      // Step 3: Invoice toiri
      const createdInvoice = await invoices.createInvoice(invoiceData);
      const invoiceId = createdInvoice.id || createdInvoice._id;

      // Step 4: Email e pathano
      await invoices.sendInvoice(invoiceId, {
        subject: `Your L&D Trailers Invoice - Reservation #${bookingNumber}`,
        body: `Hi ${firstName}, your reservation has been approved! Please find your invoice attached. Payment is due within 48 hours to confirm your booking.`
      });

      console.log(`✔ Official Wix Invoice #${invoiceId} emailed to ${email}`);
    }

    // -------------------------------------------------------------------------
    // 2. SECURITY DEPOSIT REFUND TRIGGER
    // -------------------------------------------------------------------------
    const wasRefundedBefore = Boolean(oldItem.DepositStatus === 'Refunded' || oldItem.ReturnInspectionPassed === true);
    const isNowRefunded = Boolean(item.DepositStatus === 'Refunded' || item.ReturnInspectionPassed === true);

    if (!wasRefundedBefore && isNowRefunded) {
      const bookingNumber = item.BookingID || item.title || 'LD-REF';
      const deposit = Number(item.SecurityDepositAmount || 100);
      const email = item.Email;

      console.log(`💰 [DEPOSIT REFUND APPROVED] Booking #${bookingNumber}. Return inspection passed. Deposit of $${deposit} approved for refund.`);
      
      // Note: Actual credit card reversal is executed securely via Wix Dashboard -> Payments/Invoices -> Issue Refund
    }

  } catch (err) {
    console.error('Error in Bookings_afterUpdate:', err);
  }
}
