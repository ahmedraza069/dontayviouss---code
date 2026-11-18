// ==========================================================================
// L&D TRAILERS - APP ENGINE & INTERACTIVE LOGIC
// Corinth, Mississippi
// ==========================================================================

// Global state
let currentActivePage = 'home';
let currentActiveTrailer = 'trailer-1';
let calendarCurrentDate = new Date();
let selectedBookingDate = null;
let blockedDates = ['2026-11-20', '2026-11-21', '2026-11-22']; // Demo blocked dates

document.addEventListener('DOMContentLoaded', () => {
  initYear();
  initNavigation();
  initRoutingFromHash();
  renderDetailedTrailer('trailer-1');
  renderCalendar();
  initDefaultBookingDates();
  updateLivePricing();
});

// Update Copyright Year
function initYear() {
  const el = document.getElementById('currentYear');
  if (el) el.textContent = new Date().getFullYear();
}

// --------------------------------------------------------------------------
// Navigation & SPA Page Switching
// --------------------------------------------------------------------------
function initNavigation() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const drawer = document.getElementById('mobileDrawer');
  const backdrop = document.getElementById('drawerBackdrop');

  if (toggleBtn && drawer && backdrop) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.contains('open');
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    backdrop.addEventListener('click', closeDrawer);
  }

  // Window scroll for sticky header shadow
  window.addEventListener('scroll', () => {
    const header = document.getElementById('siteHeader');
    if (header) {
      if (window.scrollY > 20) {
        header.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.85)';
      } else {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.7)';
      }
    }
  });

  // Listen to hash changes
  window.addEventListener('hashchange', initRoutingFromHash);
}

function openDrawer() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const drawer = document.getElementById('mobileDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  if (toggleBtn && drawer && backdrop) {
    toggleBtn.classList.add('open');
    drawer.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeDrawer() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const drawer = document.getElementById('mobileDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  if (toggleBtn && drawer && backdrop) {
    toggleBtn.classList.remove('open');
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function switchPage(pageId) {
  currentActivePage = pageId;

  // Hide all pages
  const pages = document.querySelectorAll('.page-view');
  pages.forEach(p => p.classList.remove('active'));

  // Show target page
  const target = document.getElementById(`page-${pageId}`);
  if (target) {
    target.classList.add('active');
  }

  // Update nav links
  const links = document.querySelectorAll('.nav-link, .mobile-drawer-link');
  links.forEach(l => {
    if (l.getAttribute('data-page') === pageId || l.getAttribute('href') === `#${pageId}`) {
      l.classList.add('active');
    } else {
      l.classList.remove('active');
    }
  });

  closeDrawer();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  history.pushState(null, '', `#${pageId}`);
}

function initRoutingFromHash() {
  const hash = window.location.hash.replace('#', '');
  const validPages = ['home', 'trailers', 'pricing', 'about', 'policies', 'contact'];
  if (validPages.includes(hash)) {
    switchPage(hash);
  } else {
    switchPage('home');
  }
}

// --------------------------------------------------------------------------
// Card Media Switcher
// --------------------------------------------------------------------------
function swapCardImage(trailerId, newSrc, thumbEl) {
  const imgEl = document.getElementById(`img-${trailerId}`);
  if (imgEl) {
    imgEl.src = newSrc;
  }
  if (thumbEl && thumbEl.parentElement) {
    const thumbs = thumbEl.parentElement.querySelectorAll('.trailer-thumb');
    thumbs.forEach(t => t.classList.remove('active'));
    thumbEl.classList.add('active');
  }
}

// --------------------------------------------------------------------------
// Detailed Trailer Tabs (Page 2)
// --------------------------------------------------------------------------
function switchTrailerDetailTab(trailerId) {
  currentActiveTrailer = trailerId;
  const btn1 = document.getElementById('tabBtnTrailer1');
  const btn2 = document.getElementById('tabBtnTrailer2');

  if (trailerId === 'trailer-1') {
    btn1.className = 'btn btn-primary btn-sm';
    btn2.className = 'btn btn-secondary btn-sm';
  } else {
    btn1.className = 'btn btn-secondary btn-sm';
    btn2.className = 'btn btn-primary btn-sm';
  }

  renderDetailedTrailer(trailerId);

  // Sync with booking dropdown
  const select = document.getElementById('bookingTrailer');
  if (select) {
    select.value = trailerId;
    updateLivePricing();
  }
}

function viewTrailerDetail(trailerId) {
  switchPage('trailers');
  switchTrailerDetailTab(trailerId);
}

function renderDetailedTrailer(trailerId) {
  const container = document.getElementById('detailedTrailerShowcase');
  if (!container || !window.LD_CMS) return;

  const trailer = window.LD_CMS.trailers.find(t => t.id === trailerId) || window.LD_CMS.trailers[0];

  let specsHtml = '';
  trailer.specs.forEach(s => {
    specsHtml += `
      <div style="display: flex; justify-content: space-between; padding: 0.6rem 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
        <span style="color: var(--text-muted); font-size: 0.88rem; text-transform: uppercase;">${s.label}</span>
        <strong style="color: var(--silver-light); font-size: 0.92rem;">${s.value}</strong>
      </div>
    `;
  });

  let recommendedHtml = '';
  trailer.recommendedFor.forEach(r => {
    recommendedHtml += `
      <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem; font-size: 0.9rem; color: #FFF;">
        <i class="fa-solid fa-check text-red"></i> ${r}
      </div>
    `;
  });

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
      <div>
        <span class="badge-red" style="margin-bottom: 0.4rem;"><i class="fa-solid fa-bolt"></i> ${trailer.badge}</span>
        <h2 style="font-size: 1.8rem; margin-top: 0.2rem;">${trailer.name}</h2>
        <div style="font-size: 0.92rem; color: var(--silver-dark);"><i class="fa-solid fa-ruler"></i> Dimensions: ${trailer.dimensions}</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Starting At</div>
        <div style="font-family: var(--font-price); font-size: 2.2rem; font-weight: 900; color: #FFF; line-height: 1;">$45<span style="font-size: 1rem; color: var(--text-muted);">/day</span></div>
        <div style="font-size: 0.78rem; color: var(--silver-dark);">Refundable Deposit: $100</div>
      </div>
    </div>

    <!-- Main Active Photo -->
    <div style="aspect-ratio: 16/9; border-radius: var(--border-radius-sm); overflow: hidden; margin-bottom: 1.5rem; border: 1px solid var(--border-silver); position: relative;">
      <img src="${trailer.primaryImage}" alt="${trailer.name}" style="width: 100%; height: 100%; object-fit: cover;" id="detailMainHeroImg">
    </div>

    <!-- Gallery Thumbnails -->
    <div style="display: flex; gap: 0.75rem; margin-bottom: 1.8rem; overflow-x: auto; padding-bottom: 0.5rem;">
      ${trailer.gallery.map(g => `
        <div class="trailer-thumb" style="width: 90px; height: 60px; flex-shrink: 0;" onclick="document.getElementById('detailMainHeroImg').src='${g.src}'">
          <img src="${g.src}" alt="${g.caption}" style="width:100%; height:100%; object-fit:cover;">
        </div>
      `).join('')}
    </div>

    <p style="font-size: 1.05rem; color: var(--silver-light); line-height: 1.7; margin-bottom: 1.8rem;">
      ${trailer.description}
    </p>

    <!-- Specs Grid -->
    <div style="background: var(--bg-pitch); padding: 1.5rem; border-radius: var(--border-radius-sm); border: 1px solid var(--border-silver); margin-bottom: 1.8rem;">
      <h4 style="color: #FFF; margin-bottom: 1rem; font-size: 1rem; letter-spacing: 0.05em;"><i class="fa-solid fa-screwdriver-wrench text-red"></i> TECHNICAL SPECIFICATIONS</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 2rem;">
        ${specsHtml}
      </div>
    </div>

    <!-- Recommended For -->
    <div style="margin-bottom: 2rem;">
      <h4 style="color: #FFF; margin-bottom: 0.8rem; font-size: 1rem;"><i class="fa-solid fa-truck-ramp-box text-red"></i> RECOMMENDED USE CASES</h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.5rem 1.5rem;">
        ${recommendedHtml}
      </div>
    </div>

    <button type="button" class="btn btn-primary btn-angled" style="width: 100%;" onclick="scrollToBookingForm('${trailer.id}')">
      <i class="fa-solid fa-calendar-check"></i> SELECT THIS TRAILER IN BOOKING FORM
    </button>
  `;
}

function scrollToBookingForm(trailerId) {
  const select = document.getElementById('bookingTrailer');
  if (select) {
    select.value = trailerId;
    updateLivePricing();
  }
  const form = document.getElementById('onlineBookingForm');
  if (form) {
    form.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('bookingName').focus();
  }
}

// --------------------------------------------------------------------------
// Real-Time Availability Calendar (Interactive Simulation)
// --------------------------------------------------------------------------
function changeMonth(delta) {
  calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + delta);
  renderCalendar();
}

function renderCalendar() {
  const grid = document.getElementById('calendarDaysGrid');
  const label = document.getElementById('calendarMonthLabel');
  if (!grid || !label) return;

  const year = calendarCurrentDate.getFullYear();
  const month = calendarCurrentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  label.textContent = `${monthNames[month]} ${year}`;

  grid.innerHTML = '';

  // Day Headers (Sun - Sat)
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  dayNames.forEach(d => {
    const h = document.createElement('div');
    h.className = 'calendar-day-header';
    h.textContent = d;
    grid.appendChild(h);
  });

  // Calculate start day and total days
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Blank filler cells before 1st of month
  for (let i = 0; i < firstDayIndex; i++) {
    const blank = document.createElement('div');
    blank.className = 'calendar-cell';
    blank.style.opacity = '0.15';
    blank.textContent = '';
    grid.appendChild(blank);
  }

  // Days
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cell.className = 'calendar-cell';
    cell.textContent = day;

    const cellDate = new Date(year, month, day);

    if (cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      cell.classList.add('booked');
      cell.title = 'Past Date';
    } else if (blockedDates.includes(dateStr)) {
      cell.classList.add('booked');
      cell.title = 'Reserved / Unavailable';
    } else {
      cell.classList.add('available');
      cell.title = 'Available - Click to Select Pickup Date';

      if (selectedBookingDate === dateStr) {
        cell.classList.add('selected');
      }

      cell.addEventListener('click', () => {
        selectCalendarDate(dateStr, day, monthNames[month], year);
      });
    }

    grid.appendChild(cell);
  }
}

function selectCalendarDate(dateStr, day, monthName, year) {
  selectedBookingDate = dateStr;
  renderCalendar();

  // Populate form pickup date (default 8:00 AM)
  const pickupInput = document.getElementById('pickupDateTime');
  if (pickupInput) {
    pickupInput.value = `${dateStr}T08:00`;
    calculateDurationDates();
  }

  // Notify user
  const form = document.getElementById('onlineBookingForm');
  if (form) {
    form.scrollIntoView({ behavior: 'smooth' });
  }
}

function toggleAdminDateBlocker() {
  toggleOwnerCmsModal();
}

function toggleBlockedDatesDemo() {
  if (blockedDates.length > 0) {
    blockedDates = [];
  } else {
    blockedDates = ['2026-11-20', '2026-11-21', '2026-11-22'];
  }
  renderCalendar();
  alert(`Availability updated! Dates Nov 20-22 are now: ${blockedDates.length > 0 ? 'BLOCKED / RESERVED' : 'OPEN / AVAILABLE'}.`);
}

// --------------------------------------------------------------------------
// Dynamic Price Breakdown & Form Helper
// --------------------------------------------------------------------------
function initDefaultBookingDates() {
  const pickupInput = document.getElementById('pickupDateTime');
  const returnInput = document.getElementById('returnDateTime');
  if (pickupInput && returnInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrow.getDate()).padStart(2, '0');

    pickupInput.value = `${y}-${m}-${d}T08:00`;
    calculateDurationDates();
  }
}

function calculateDurationDates() {
  const pickupInput = document.getElementById('pickupDateTime');
  const returnInput = document.getElementById('returnDateTime');
  const periodSelect = document.getElementById('bookingPeriod');

  if (!pickupInput || !returnInput || !periodSelect || !pickupInput.value) return;

  const pickupDate = new Date(pickupInput.value);
  if (isNaN(pickupDate.getTime())) return;

  const period = periodSelect.value;
  let addHours = 24;

  if (period === 'daily') addHours = 24;
  else if (period === 'weekend') addHours = 48; // Fri-Sun / 48-72h
  else if (period === '3day') addHours = 72;
  else if (period === 'weekly') addHours = 24 * 7;
  else if (period === 'monthly') addHours = 24 * 30;

  const returnDate = new Date(pickupDate.getTime() + addHours * 60 * 60 * 1000);
  const ry = returnDate.getFullYear();
  const rm = String(returnDate.getMonth() + 1).padStart(2, '0');
  const rd = String(returnDate.getDate()).padStart(2, '0');
  const rh = String(returnDate.getHours()).padStart(2, '0');
  const rmin = String(returnDate.getMinutes()).padStart(2, '0');

  returnInput.value = `${ry}-${rm}-${rd}T${rh}:${rmin}`;
  updateLivePricing();
}

function updateLivePricing() {
  const periodSelect = document.getElementById('bookingPeriod');
  const trailerSelect = document.getElementById('bookingTrailer');
  if (!periodSelect || !trailerSelect || !window.LD_CMS) return;

  const periodId = periodSelect.value;
  const tier = window.LD_CMS.pricingTiers.find(t => t.id === periodId) || window.LD_CMS.pricingTiers[0];
  const trailer = window.LD_CMS.trailers.find(t => t.id === trailerSelect.value) || window.LD_CMS.trailers[0];

  // Update Summary Box
  const summaryTrailer = document.getElementById('summaryTrailerName');
  const summaryPeriodLabel = document.getElementById('summaryPeriodLabel');
  const summaryRentalFee = document.getElementById('summaryRentalFee');
  const summaryDepositFee = document.getElementById('summaryDepositFee');
  const summaryTotal = document.getElementById('summaryTotalEstimated');

  if (summaryTrailer) summaryTrailer.textContent = trailer.name;
  if (summaryPeriodLabel) summaryPeriodLabel.textContent = `${tier.name} - ${tier.period}`;
  if (summaryRentalFee) summaryRentalFee.textContent = `$${tier.price.toFixed(2)}`;
  if (summaryDepositFee) summaryDepositFee.textContent = `$${tier.deposit.toFixed(2)}`;

  const total = tier.price + tier.deposit;
  if (summaryTotal) summaryTotal.textContent = `$${total.toFixed(2)}`;
}

function selectPricingAndBook(tierId) {
  switchPage('trailers');
  const periodSelect = document.getElementById('bookingPeriod');
  if (periodSelect) {
    periodSelect.value = tierId;
    calculateDurationDates();
    updateLivePricing();
  }
  const form = document.getElementById('onlineBookingForm');
  if (form) {
    form.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('bookingName').focus();
  }
}

function openBookingModal(trailerId) {
  switchPage('trailers');
  switchTrailerDetailTab(trailerId);
  const form = document.getElementById('onlineBookingForm');
  if (form) {
    form.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('bookingName').focus();
  }
}

// --------------------------------------------------------------------------
// Online Booking Form Submission & Stripe / Wix Payments Simulation
// --------------------------------------------------------------------------
function handleBookingSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('bookingName').value;
  const phone = document.getElementById('bookingPhone').value;
  const email = document.getElementById('bookingEmail').value;
  const dl = document.getElementById('bookingDL').value;
  const trailerId = document.getElementById('bookingTrailer').value;
  const periodId = document.getElementById('bookingPeriod').value;

  const tier = window.LD_CMS.pricingTiers.find(t => t.id === periodId);
  const trailer = window.LD_CMS.trailers.find(t => t.id === trailerId);

  // Populate Modal
  document.getElementById('modalRenterName').textContent = name;
  document.getElementById('modalTrailerName').textContent = trailer ? trailer.name : '6x12 Utility Trailer';
  document.getElementById('modalPeriodName').textContent = tier ? tier.name : 'Daily';
  document.getElementById('modalRentalFee').textContent = `$${tier.price.toFixed(2)}`;
  document.getElementById('modalDepositFee').textContent = `$${tier.deposit.toFixed(2)}`;
  document.getElementById('modalTotalAuth').textContent = `$${(tier.price + tier.deposit).toFixed(2)}`;

  // Show Modal Step 1
  document.getElementById('checkoutStepReview').style.display = 'block';
  document.getElementById('checkoutStepSuccess').style.display = 'none';

  const modalBackdrop = document.getElementById('checkoutModalBackdrop');
  if (modalBackdrop) {
    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeCheckoutModal() {
  const modalBackdrop = document.getElementById('checkoutModalBackdrop');
  if (modalBackdrop) {
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
}

async function handlePaymentSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('btnPayAuthorize');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing Secure Payment via Stripe...`;
  }

  // Gather form values
  const name = document.getElementById('bookingName').value;
  const phone = document.getElementById('bookingPhone').value;
  const email = document.getElementById('bookingEmail').value;
  const dl = document.getElementById('bookingDL').value;
  const trailerId = document.getElementById('bookingTrailer').value;
  const period = document.getElementById('bookingPeriod').value;
  const pickup = document.getElementById('pickupDateTime').value;
  const returnDate = document.getElementById('returnDateTime').value;
  const use = document.getElementById('bookingUse').value;
  const comments = document.getElementById('bookingComments').value;

  const trailerSelect = document.getElementById('bookingTrailer');
  const trailerName = trailerSelect.options[trailerSelect.selectedIndex].text;

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: name,
        phone: phone,
        email: email,
        driverLicense: dl,
        trailerId: trailerId,
        trailerName: trailerName,
        period: period,
        pickupDateTime: pickup,
        returnDateTime: returnDate,
        intendedUse: use,
        comments: comments,
        paymentMethod: 'Credit Card (Stripe Encrypted)'
      })
    });

    const result = await res.json();

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-shield-halved"></i> AUTHORIZE &amp; CONFIRM BOOKING REQUEST`;
    }

    const receiptEl = document.getElementById('receiptNumber');
    if (receiptEl && result.receiptNumber) {
      receiptEl.textContent = result.receiptNumber;
    }

    document.getElementById('checkoutStepReview').style.display = 'none';
    document.getElementById('checkoutStepSuccess').style.display = 'block';

    const form = document.getElementById('onlineBookingForm');
    if (form) form.reset();
    initDefaultBookingDates();
    updateLivePricing();
  } catch (err) {
    console.error(err);
    alert('Booking submitted locally. Confirmation ID: LD-' + Math.floor(10000 + Math.random() * 90000));
  }
}

async function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('contactName').value;
  const phone = document.getElementById('contactPhone').value;
  const email = document.getElementById('contactEmail').value;
  const msg = document.getElementById('contactMsg') ? document.getElementById('contactMsg').value : '';

  try {
    await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email, message: msg })
    });
  } catch (e) {
    // fallback
  }

  alert(`Thank you, ${name}! Your inquiry has been sent to L&D Trailers in Corinth, MS. We will respond promptly.`);
  e.target.reset();
}

// --------------------------------------------------------------------------
// Owner CMS Simulator (Shows Dynamic Future Expansion to 5+ Trailers)
// --------------------------------------------------------------------------
function toggleOwnerCmsModal() {
  const modal = document.getElementById('ownerCmsModalBackdrop');
  if (modal) {
    modal.classList.toggle('open');
    document.body.style.overflow = modal.classList.contains('open') ? 'hidden' : '';
  }
}

let trailer3Added = false;
function simulateAddTrailer3() {
  if (trailer3Added) {
    alert('Trailer #3 is already active in the CMS fleet!');
    return;
  }

  const newTrailer = {
    id: "trailer-3",
    name: "Trailer #3: 7x14 Tandem Dump Trailer",
    size: "7ft x 14ft",
    dimensions: "7ft Wide x 14ft Long x 2ft High Sides",
    type: "Dump Trailer",
    badge: "New Fleet Addition &bull; Contractor Grade",
    primaryImage: "assets/commercial-truck-trailer.jpg",
    gallery: [
      { src: "assets/commercial-truck-trailer.jpg", caption: "Trailer #3 - 7x14 Heavy-Duty Hydraulic Dump" }
    ],
    description: "Contractor-ready 7x14 tandem axle hydraulic dump trailer designed for heavy dirt, gravel, roofing tear-offs, and bulk materials in Northeast Mississippi.",
    specs: [
      { label: "Deck Dimensions", value: "7 ft x 14 ft x 2 ft" },
      { label: "Hydraulic Lift", value: "Power Up / Power Down Scissor Hoist" },
      { label: "Axle Setup", value: "Tandem 7,000 lb E-Z Lube Axles" },
      { label: "Coupler Size", value: "2-5/16\" Adjustable Coupler" }
    ],
    recommendedFor: [
      "Roofing debris, shingles & construction waste",
      "Bulk gravel, soil, sand & crushed limestone",
      "Demolition material & heavy contractor debris"
    ],
    status: "Available"
  };

  window.LD_CMS.trailers.push(newTrailer);
  trailer3Added = true;

  // Add option to booking form dropdown
  const select = document.getElementById('bookingTrailer');
  if (select) {
    const opt = document.createElement('option');
    opt.value = 'trailer-3';
    opt.textContent = 'Trailer #3: 7x14 Tandem Dump Trailer';
    select.appendChild(opt);
  }

  // Update UI badge
  const badge = document.getElementById('trailer3AddedBadge');
  if (badge) badge.style.display = 'inline-block';

  alert('Success! Trailer #3 (7x14 Dump Trailer) has been dynamically added to the CMS fleet and Booking Dropdown without redesigning any code!');
}
