// L&D Trailers - CMS & Core Data Model
// Engineered for Wix Studio CMS Dynamic Collections and scalability to 5+ trailers

const LD_CMS = {
  business: {
    name: "L&D Trailers",
    tagline: "Affordable. Reliable. Local.",
    headline: "NEED A TRAILER? WE'VE GOT YOU COVERED.",
    subheadline: "Affordable and dependable utility trailer rentals in Corinth, Mississippi.",
    aboutShort: "L&D Trailers is a locally owned trailer rental business providing affordable, reliable, and convenient trailer rentals to individuals, homeowners, contractors, and businesses. Our goal is to make renting a trailer simple, affordable, and hassle-free.",
    aboutStory: "L&D Trailers was created to provide Corinth, Mississippi, and surrounding communities with affordable and dependable trailer rental options. We believe renting a trailer should be simple, convenient, and affordable. Whether you're moving, hauling equipment, working on a home project, or handling everyday transportation needs, we're here to help. Our mission is to provide dependable equipment, fair pricing, and friendly local service.",
    phone: "(662) 555-0199", // Configurable placeholder for [INSERT BUSINESS PHONE NUMBER]
    email: "rentals@ldtrailers.com", // [INSERT BUSINESS EMAIL]
    facebook: "https://facebook.com/LDTrailersCorinth", // [INSERT FACEBOOK BUSINESS PAGE]
    address: "Corinth, Mississippi 38834",
    hours: "Monday – Sunday: 7:00 AM – 7:00 PM (By Appointment)"
  },

  trailers: [
    {
      id: "trailer-1",
      name: "Trailer #1: 6x12 Utility Trailer",
      size: "6ft x 12ft",
      dimensions: "6ft Wide x 12ft Long (72\" x 144\")",
      type: "Utility Trailer",
      badge: "Introductory Pricing — Starting at $45/Day",
      primaryImage: "assets/trailer-1.jpg",
      gallery: [
        { src: "assets/trailer-1.jpg", caption: "Trailer #1 - 6x12 Heavy Duty Black Utility Trailer with Ramp" },
        { src: "assets/trailer-wheels.jpg", caption: "Tandem Axles with Polished Chrome Wheels & Heavy Duty Fenders" },
        { src: "assets/trailer-2.jpg", caption: "Reinforced 4ft Fold-Down Rear Ramp Gate Tailgate" }
      ],
      description: "Heavy-duty 6x12 utility trailer built for tough hauling jobs in Corinth and Northeast Mississippi. Equipped with tandem axles, shiny chrome wheels, tubular steel top rail, expanded steel mesh sides, and a heavy-duty rear fold-down ramp gate for effortless loading of riding mowers, zero-turns, ATVs, and heavy cargo.",
      specs: [
        { label: "Deck Dimensions", value: "6 ft Wide x 12 ft Long" },
        { label: "Side Rail Height", value: "18\" Heavy Duty Steel Mesh" },
        { label: "Loading Ramp", value: "4-Foot Fold-Down Ramp Tailgate" },
        { label: "Axle Setup", value: "Tandem Dual Axles with Chrome Rims" },
        { label: "Coupler Size", value: "2\" Ball Coupler with Safety Chains" },
        { label: "Electrical Plug", value: "Standard 4-Pin Flat Connector (LED Lights)" },
        { label: "Tongue Jack", value: "Heavy-Duty Top-Wind A-Frame Jack" },
        { label: "Deck Surface", value: "Heavy-Duty Treated Wood Floor Bed" }
      ],
      recommendedFor: [
        "Lawn mowers & commercial landscape equipment",
        "Furniture, appliances & residential moves",
        "Home improvement, drywall, lumber & roofing supplies",
        "ATVs, golf carts, UTVs & motorcycles"
      ],
      status: "Available"
    },
    {
      id: "trailer-2",
      name: "Trailer #2: 6x12 Utility Trailer",
      size: "6ft x 12ft",
      dimensions: "6ft Wide x 12ft Long (72\" x 144\")",
      type: "Utility Trailer",
      badge: "Introductory Pricing — Starting at $45/Day",
      primaryImage: "assets/trailer-wood-deck.jpg",
      gallery: [
        { src: "assets/trailer-wood-deck.jpg", caption: "Trailer #2 - 6x12 Utility Trailer with Dark Stained Wood Plank Floor" },
        { src: "assets/trailer-2.jpg", caption: "Heavy Duty Tubular Steel Frame with Tie-Down Points & Ramp" },
        { src: "assets/commercial-truck-trailer.jpg", caption: "L&D Trailer Hitched & Towing on Mississippi Country Highway" }
      ],
      description: "Equally dependable 6x12 utility trailer featuring rugged powder-coated black tubular steel framing, dark stained solid hardwood plank flooring, perimeter tie-down D-rings and stake pockets, and a spring-assisted rear fold-down ramp. Engineered for contractor reliability and effortless towing.",
      specs: [
        { label: "Deck Dimensions", value: "6 ft Wide x 12 ft Long" },
        { label: "Side Rail Height", value: "14\" Tubular Steel Rail with Tie-Downs" },
        { label: "Loading Ramp", value: "Heavy-Duty Fold-Down Spring-Assist Ramp" },
        { label: "Deck Surface", value: "Dark Stained Solid Hardwood Planks" },
        { label: "Coupler Size", value: "2\" Ball Coupler with Locking Latch" },
        { label: "Electrical Plug", value: "4-Pin Flat Plug with Sealed DOT LED Lights" },
        { label: "Tie-Down Points", value: "Multiple Heavy-Duty D-Rings & Stake Pockets" },
        { label: "Tongue Jack", value: "Swivel A-Frame Tongue Jack with Foot" }
      ],
      recommendedFor: [
        "Contractor tools, building supplies & renovation materials",
        "Bulk mulch, dirt, gravel bags & landscaping jobs",
        "Large household appliances & estate cleanouts",
        "Weekend haul-away & debris disposal"
      ],
      status: "Available"
    }
  ],

  pricingTiers: [
    {
      id: "daily",
      name: "DAILY RENTAL",
      price: 45,
      period: "24 Hours",
      deposit: 100,
      badge: "Most Popular for Quick Jobs",
      popular: false,
      summary: "Ideal for local moves, quick dump runs, or picking up materials from the hardware store."
    },
    {
      id: "weekend",
      name: "WEEKEND RENTAL",
      price: 85,
      period: "Friday through Sunday",
      deposit: 100,
      badge: "Weekend Special",
      popular: true,
      summary: "Great value for Saturday & Sunday projects, home cleanouts, or multi-day estate moves."
    },
    {
      id: "3day",
      name: "3-DAY RENTAL",
      price: 115,
      period: "72 Hours",
      deposit: 100,
      badge: "Extended Haul",
      popular: false,
      summary: "Extra flexibility for mid-week contractor jobs or extensive yard transformations."
    },
    {
      id: "weekly",
      name: "WEEKLY RENTAL",
      price: 225,
      period: "7 Days",
      deposit: 150,
      badge: "Save Over $90 vs Daily",
      popular: false,
      summary: "The contractor favorite for 7-day remodels, ongoing jobs, and substantial hauling needs."
    },
    {
      id: "monthly",
      name: "MONTHLY RENTAL",
      price: 550,
      period: "30 Days",
      deposit: 200,
      badge: "Maximum Contractor Value",
      popular: false,
      summary: "Unbeatable monthly utility trailer access for local businesses, crews, and long-term projects."
    }
  ],

  disclaimer: "All prices are displayed before taxes or other applicable charges. The refundable security deposit is separate from the rental charge and is refunded after the trailer is returned and inspected, provided there are no outstanding charges or documented damage. Any deductions will be explained to the customer.",

  rentalRequirements: [
    "Be at least 21 years old.",
    "Present a valid driver's license.",
    "Provide proof of appropriate vehicle insurance.",
    "Have a vehicle capable of safely towing the selected trailer.",
    "Have the correct hitch and electrical connection.",
    "Sign the rental agreement before taking possession.",
    "Pay the rental fee and refundable deposit.",
    "Note: All renters must be approved by L&D Trailers."
  ],

  rentalPolicies: [
    {
      id: "policy-payment",
      title: "1. PAYMENT POLICY",
      icon: "fa-credit-card",
      content: "Rental fees and security deposits must be paid before the trailer leaves our possession."
    },
    {
      id: "policy-deposit",
      title: "2. SECURITY DEPOSIT POLICY",
      icon: "fa-shield-halved",
      content: "Security deposits are refundable after the trailer is returned and inspected. Deductions may apply for documented damage, missing equipment, unpaid charges, or violations of the rental agreement."
    },
    {
      id: "policy-late",
      title: "3. LATE RETURN POLICY",
      icon: "fa-clock",
      content: "Customers must return trailers at the agreed-upon time. Late returns require prior approval. Proposed late fee: $15 per hour, up to the applicable additional daily rental charge. Any additional charges must be disclosed in the rental agreement."
    },
    {
      id: "policy-cancel",
      title: "4. CANCELLATION POLICY",
      icon: "fa-calendar-xmark",
      content: "Customers should provide at least 24 hours' notice when canceling a reservation. Cancellation and refund terms are displayed before payment."
    },
    {
      id: "policy-damage",
      title: "5. DAMAGE POLICY",
      icon: "fa-camera",
      content: "Customers are responsible for damage occurring during their rental period, subject to the signed rental agreement and applicable law. All trailers must be inspected and photographed before pickup and after return."
    },
    {
      id: "policy-cleaning",
      title: "6. CLEANING POLICY",
      icon: "fa-broom",
      content: "Trailers must be returned reasonably clean and free of trash and debris. Additional cleaning charges may apply if a trailer requires cleaning beyond normal use."
    },
    {
      id: "policy-prohibited",
      title: "7. PROHIBITED USE",
      icon: "fa-triangle-exclamation",
      isWarning: true,
      content: "Customers may not: Exceed the trailer's rated weight capacity; Transport prohibited or illegal materials; Use trailers for unauthorized commercial purposes; Modify or alter trailers; Allow unauthorized individuals to use the rental; Tow trailers with an unsafe or improperly equipped vehicle."
    }
  ],

  serviceAreas: {
    primary: "Corinth, Mississippi",
    cities: [
      "Glen, MS",
      "Booneville, MS",
      "Rienzi, MS",
      "Farmington, MS",
      "Iuka, MS",
      "Burnsville, MS",
      "Walnut, MS"
    ],
    note: "Additional service areas may be added as the business grows."
  },

  reviews: [
    {
      name: "Marcus Vance",
      role: "Local Residential Homeowner",
      location: "Corinth, MS",
      rating: 5,
      date: "Recent Customer",
      text: "Rented Trailer #1 for a massive backyard renovation and lumber haul over the weekend. The trailer was in immaculate shape, hitched up cleanly, and the ramp gate made unloading our zero-turn mower a breeze. Best rental price in Alcorn County by far!"
    },
    {
      name: "Tyler Jenkins",
      role: "Independent Contractor",
      location: "Booneville, MS",
      rating: 5,
      date: "Verified Renter",
      text: "L&D Trailers made the booking process so straightforward. Upfront pricing with no surprise add-ons, and getting the security deposit back was quick and transparent after check-in. They are my first call whenever my crew needs extra trailer capacity."
    },
    {
      name: "Sarah McAllister",
      role: "Family Home Move",
      location: "Corinth, MS",
      rating: 5,
      date: "Verified Renter",
      text: "Super friendly local service! The pickup was right on time, trailer pulled like a dream behind my Chevy Silverado, and having the 6x12 size saved us at least 4 trips across town. Highly recommend L&D to anyone needing a reliable trailer."
    }
  ]
};

// Export for browser
if (typeof window !== 'undefined') {
  window.LD_CMS = LD_CMS;
}
