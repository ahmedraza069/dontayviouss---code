const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;
const DATA_DIR = path.join(BASE_DIR, 'data');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.csv': 'text/csv; charset=UTF-8'
};

// Helper to read/write JSON files safely
function readJson(filename, defaultVal = []) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error(`Error reading ${filename}:`, e);
  }
  return defaultVal;
}

function writeJson(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error(`Error writing ${filename}:`, e);
    return false;
  }
}

// Helper to parse JSON body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) { // 1MB limit
        req.connection.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = parsedUrl.pathname;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // =========================================================================
  // API ROUTING (Backend Functionality for Wix CMS & Booking Engine)
  // =========================================================================

  // 1. GET /api/trailers
  if (pathname === '/api/trailers' && req.method === 'GET') {
    const trailers = readJson('trailers.json', []);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(trailers));
    return;
  }

  // 2. POST /api/trailers (Add Trailer to Fleet CMS)
  if (pathname === '/api/trailers' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const trailers = readJson('trailers.json', []);
      const newTrailer = {
        id: data.id || `trailer-${trailers.length + 1}`,
        name: data.name || `Trailer #${trailers.length + 1}: Utility Trailer`,
        size: data.size || "6ft x 12ft",
        dimensions: data.dimensions || "6ft Wide x 12ft Long",
        type: data.type || "Utility Trailer",
        badge: data.badge || "Introductory Pricing — Starting at $45/Day",
        primaryImage: data.primaryImage || "assets/trailer-1.jpg",
        actionImage: data.actionImage || "assets/commercial-truck-trailer.jpg",
        gallery: data.gallery || [{ src: data.primaryImage || "assets/trailer-1.jpg", caption: data.name }],
        description: data.description || "Commercial-grade utility trailer built for tough hauling in Corinth and Northeast Mississippi.",
        specs: data.specs || [
          { label: "Deck Dimensions", value: "6 ft x 12 ft" },
          { label: "Coupler Size", value: "2\" Ball Coupler" }
        ],
        rates: data.rates || { daily: 45, weekend: 85, '3day': 115, weekly: 225, monthly: 550 },
        deposit: data.deposit || { daily: 100, weekend: 100, '3day': 100, weekly: 150, monthly: 200 },
        status: "Available"
      };
      trailers.push(newTrailer);
      writeJson('trailers.json', trailers);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, trailer: newTrailer }));
      return;
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // 3. GET /api/bookings (View Reservations)
  if (pathname === '/api/bookings' && req.method === 'GET') {
    const bookings = readJson('bookings.json', []);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(bookings));
    return;
  }

  // 4. POST /api/bookings (Submit 10-Field Booking Request)
  if (pathname === '/api/bookings' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const bookings = readJson('bookings.json', []);

      // Calculate separate line items
      const periodRates = { daily: 45, weekend: 85, '3day': 115, weekly: 225, monthly: 550 };
      const periodDeposits = { daily: 100, weekend: 100, '3day': 100, weekly: 150, monthly: 200 };
      const periodLabels = {
        daily: 'Daily Rental (24 Hours)',
        weekend: 'Weekend Rental (Fri-Sun)',
        '3day': '3-Day Rental (72 Hours)',
        weekly: 'Weekly Rental (7 Days)',
        monthly: 'Monthly Rental (30 Days)'
      };

      const selectedPeriod = data.period || 'daily';
      const rentalFee = Number(data.rentalFee || periodRates[selectedPeriod] || 45);
      const securityDeposit = Number(data.securityDeposit || periodDeposits[selectedPeriod] || 100);
      const totalAuthorized = rentalFee + securityDeposit;

      const randomId = 'LD-' + Math.floor(10000 + Math.random() * 90000);

      const newBooking = {
        id: randomId,
        customerName: data.customerName || 'Customer',
        phone: data.phone || '(662) 555-0199',
        email: data.email || 'customer@example.com',
        driverLicense: data.driverLicense || 'Verified at Pickup',
        trailerId: data.trailerId || 'trailer-1',
        trailerName: data.trailerName || 'Trailer #1: 6x12 Utility Trailer',
        period: selectedPeriod,
        periodLabel: periodLabels[selectedPeriod] || 'Daily Rental',
        pickupDateTime: data.pickupDateTime || new Date().toISOString(),
        returnDateTime: data.returnDateTime || new Date().toISOString(),
        intendedUse: data.intendedUse || 'General hauling',
        comments: data.comments || '',
        rentalFee: rentalFee,
        securityDeposit: securityDeposit,
        totalAuthorized: totalAuthorized,
        status: 'PENDING_APPROVAL', // Strict approval required by L&D Trailers
        paymentMethod: data.paymentMethod || 'Visa ending in 4242 (Simulated)',
        createdAt: new Date().toISOString()
      };

      bookings.unshift(newBooking);
      writeJson('bookings.json', bookings);

      // Automated email simulation log
      console.log(`[AUTOMATION] Booking request #${newBooking.id} received for ${newBooking.customerName}.`);
      console.log(`[AUTOMATION] Confirmation email dispatched to ${newBooking.email}. Owner review pending.`);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        booking: newBooking,
        receiptNumber: newBooking.id,
        message: 'Booking request received. Status: PENDING_APPROVAL by L&D Trailers.'
      }));
      return;
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // 5. POST /api/bookings/:id/status (Owner Approval / Decline)
  if (pathname.startsWith('/api/bookings/') && pathname.endsWith('/status') && req.method === 'POST') {
    try {
      const parts = pathname.split('/');
      const bookingId = parts[3];
      const data = await parseJsonBody(req);
      const bookings = readJson('bookings.json', []);
      const index = bookings.findIndex(b => b.id === bookingId);

      if (index === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Booking not found' }));
        return;
      }

      bookings[index].status = data.status || 'APPROVED';
      bookings[index].updatedAt = new Date().toISOString();
      writeJson('bookings.json', bookings);

      console.log(`[OWNER ACTION] Booking #${bookingId} marked as ${bookings[index].status}.`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, booking: bookings[index] }));
      return;
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // 6. GET & POST /api/blocked-dates
  if (pathname === '/api/blocked-dates') {
    if (req.method === 'GET') {
      const blocked = readJson('blocked-dates.json', []);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(blocked));
      return;
    } else if (req.method === 'POST') {
      try {
        const data = await parseJsonBody(req);
        let blocked = readJson('blocked-dates.json', []);
        if (data.action === 'toggle' && data.date) {
          if (blocked.includes(data.date)) {
            blocked = blocked.filter(d => d !== data.date);
          } else {
            blocked.push(data.date);
          }
        } else if (data.dates && Array.isArray(data.dates)) {
          blocked = data.dates;
        }
        writeJson('blocked-dates.json', blocked);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, blockedDates: blocked }));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }
  }

  // 7. POST /api/inquiries (Contact Form Submissions)
  if (pathname === '/api/inquiries' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const inquiries = readJson('inquiries.json', []);
      const newInq = {
        id: `INQ-${Date.now()}`,
        name: data.name,
        phone: data.phone,
        email: data.email,
        message: data.message,
        createdAt: new Date().toISOString()
      };
      inquiries.unshift(newInq);
      writeJson('inquiries.json', inquiries);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, inquiry: newInq }));
      return;
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // =========================================================================
  // STATIC FILE SERVING
  // =========================================================================
  if (pathname === '/') {
    pathname = '/index.html';
  }

  let filePath = path.join(BASE_DIR, pathname);

  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  if (!fs.existsSync(filePath)) {
    const publicPath = path.join(BASE_DIR, 'public', pathname);
    if (fs.existsSync(publicPath)) {
      filePath = publicPath;
    } else if (fs.existsSync(publicPath + '.html')) {
      filePath = publicPath + '.html';
    } else {
      filePath = path.join(BASE_DIR, 'index.html');
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`  L&D TRAILERS - FULL BACKEND & CMS SERVER ACTIVE`);
  console.log(`  Corinth, Mississippi`);
  console.log(`  Live URL: http://localhost:${PORT}`);
  console.log(`  Admin Dashboard: http://localhost:${PORT}/admin.html`);
  console.log(`  API Endpoints: /api/bookings, /api/trailers, /api/blocked-dates`);
  console.log(`====================================================`);
});
