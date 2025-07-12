// Mock data for Doord marketplace
export const serviceCategories = [
  {
    id: 1,
    name: "Home Maintenance & Repairs",
    icon: "🔧",
    services: [
      { id: 1, name: "Electrician", description: "Wiring, outlets, light installation, panel upgrades", icon: "⚡" },
      { id: 2, name: "Plumber", description: "Leak repairs, pipe installation, clogged drains", icon: "🔧" },
      { id: 3, name: "HVAC Services", description: "Heating, ventilation, and air conditioning repair", icon: "🌡️" },
      { id: 4, name: "Handyman Services", description: "General home repairs and small fixes", icon: "🔨" },
      { id: 5, name: "Home Renovations", description: "Full remodels, kitchen/bathroom upgrades", icon: "🏠" },
      { id: 6, name: "Carpenter", description: "Custom furniture, cabinetry, framing work", icon: "🪚" },
      { id: 7, name: "Painter", description: "Interior and exterior painting", icon: "🎨" }
    ]
  },
  {
    id: 2,
    name: "Cleaning & Exterior Maintenance",
    icon: "🧹",
    services: [
      { id: 8, name: "Home Cleaning", description: "Deep cleaning, move-in/move-out, routine cleaning", icon: "🏠" },
      { id: 9, name: "Office Cleaning", description: "Commercial space cleaning, janitorial services", icon: "🏢" },
      { id: 10, name: "Window Cleaning", description: "Residential and commercial window washing", icon: "🪟" },
      { id: 11, name: "Pressure Washing", description: "Driveways, patios, decks, siding", icon: "💦" },
      { id: 12, name: "Gutter Cleaning", description: "Clearing and maintenance of gutters and downspouts", icon: "🏠" }
    ]
  },
  {
    id: 3,
    name: "Outdoor & Landscaping Services",
    icon: "🌿",
    services: [
      { id: 13, name: "Landscaping", description: "Lawn care, tree trimming, flower bed maintenance", icon: "🌱" },
      { id: 14, name: "Lawn Mowing & Maintenance", description: "Grass cutting, fertilization, aeration", icon: "🌾" },
      { id: 15, name: "Snow Removal", description: "Driveway and walkway clearing", icon: "❄️" },
      { id: 16, name: "Fence & Deck Services", description: "Installation, staining, repair", icon: "🏡" },
      { id: 17, name: "Siding Installation & Repair", description: "Vinyl, wood, fiber cement siding", icon: "🏠" }
    ]
  },
  {
    id: 4,
    name: "Vehicle & Property Maintenance",
    icon: "🚗",
    services: [
      { id: 18, name: "Car Detailing", description: "Interior and exterior cleaning, waxing, polishing", icon: "🚗" },
      { id: 19, name: "Roofing", description: "Repairs, shingle replacement, full roof installation", icon: "🏠" },
      { id: 20, name: "Pest Control", description: "Termite, rodent, insect removal", icon: "🐛" }
    ]
  },
  {
    id: 5,
    name: "Specialty & Seasonal Services",
    icon: "❄️",
    services: [
      { id: 21, name: "Appliance Repair", description: "Fixing washers, dryers, dishwashers, refrigerators", icon: "🔧" },
      { id: 22, name: "Junk Removal", description: "Furniture, appliance, debris removal and disposal", icon: "🗑️" }
    ]
  }
];

export const mockProviders = [
  {
    id: 1,
    name: "CleanPro Services",
    description: "Professional cleaning services with eco-friendly products",
    services: ["Home Cleaning", "Office Cleaning", "Window Cleaning"],
    rating: 5.0,
    reviews: 2,
    completedJobs: 3,
    location: "Halifax, NS",
    responseTime: "Usually responds within 1 hour",
    yearEstablished: "2024",
    specialties: ["Deep cleaning", "Move-in/out cleaning", "Post-construction cleanup"],
    priceRange: "$150-$400"
  },
  {
    id: 2,
    name: "Elite Electrical",
    description: "Licensed electricians for residential and commercial work",
    services: ["Electrician", "Home Renovations"],
    rating: 5.0,
    reviews: 1,
    completedJobs: 2,
    location: "Halifax, NS",
    responseTime: "Usually responds within 2 hours",
    yearEstablished: "2024",
    specialties: ["Panel upgrades", "Smart home wiring", "Emergency repairs"],
    priceRange: "$100-$800"
  },
  {
    id: 3,
    name: "GreenThumb Landscaping",
    description: "Complete outdoor maintenance and landscaping solutions",
    services: ["Landscaping", "Lawn Mowing & Maintenance", "Snow Removal"],
    rating: 5.0,
    reviews: 1,
    completedJobs: 1,
    location: "Halifax, NS",
    responseTime: "Usually responds within 3 hours",
    yearEstablished: "2024",
    specialties: ["Garden design", "Seasonal cleanup", "Irrigation systems"],
    priceRange: "$80-$500"
  },
  {
    id: 4,
    name: "HandyMax Solutions",
    description: "Reliable handyman services for all your home repair needs",
    services: ["Handyman Services", "Painter", "Carpenter"],
    rating: 5.0,
    reviews: 1,
    completedJobs: 1,
    location: "Halifax, NS",
    responseTime: "Usually responds within 4 hours",
    yearEstablished: "2024",
    specialties: ["Furniture assembly", "Drywall repair", "Kitchen installations"],
    priceRange: "$60-$300"
  }
];

// Mock orders data - Starting fresh with no orders
export const mockOrders = [];

// Mock messages data for provider messaging - Starting fresh
export const mockMessages = [];

// Mock quotation requests - Starting fresh
export const mockQuotationRequests = [];
        content: 'Started the landscaping work today. The front yard design is coming along great!',
        timestamp: '2024-01-14T10:00:00Z',
        sender: 'provider',
        read: true
      },
      {
        id: 5,
        content: 'The front yard looks amazing! Thank you for the excellent work.',
        timestamp: '2024-01-14T17:30:00Z',
        sender: 'homeowner',
        read: false
      }
    ]
  }
];

// Enhanced quotations with detailed workflow
export const mockQuotationRequests = [
  {
    id: 3,
    homeownerId: 1,
    homeownerName: "John Smith",
    homeownerEmail: "john.smith@example.com",
    homeownerPhone: "+1 (555) 123-4567",
    homeownerAddress: "123 Main St, Halifax, NS",
    serviceType: "House Cleaning",
    serviceCategory: "Cleaning & Exterior Maintenance",
    description: "Deep cleaning for 3-bedroom house before family visit. Need kitchen, bathrooms, living areas cleaned thoroughly.",
    preferredDate: "2024-12-20",
    urgency: "medium",
    budget: "200-300",
    propertySize: "2000-3000 sq ft",
    additionalRequirements: "Pet-friendly cleaning products preferred",
    status: "pending_quotes", // pending_quotes, quotes_received, quote_accepted, cancelled
    requestDate: "2024-12-12T10:00:00Z",
    quotes: [
      {
        id: 1,
        providerId: 1,
        providerName: "CleanPro Services",
        amount: 250,
        estimatedDuration: "4-5 hours",
        description: "Complete deep cleaning package including all requested areas. Using eco-friendly, pet-safe products.",
        availability: "December 20th, 21st, or 22nd",
        status: "sent",
        sentDate: "2024-12-12T16:00:00Z"
      }
    ]
  }
];

export const mockQuotations = [
  {
    id: 1,
    homeownerId: 1,
    providerId: 1,
    serviceType: "Electrician",
    description: "Need to install new outlets in kitchen and fix flickering lights",
    status: "pending",
    requestDate: "2024-01-15",
    quotationAmount: null,
    quotationDetails: null,
    providerResponse: null,
    homeownerAddress: "123 Main St, Toronto, ON",
    homeownerName: "John Smith",
    providerName: "Elite Home Solutions"
  },
  {
    id: 2,
    homeownerId: 2,
    providerId: 2,
    serviceType: "Home Cleaning",
    description: "Deep cleaning for 3-bedroom house, move-in cleaning",
    status: "quoted",
    requestDate: "2024-01-10",
    quotationAmount: 280,
    quotationDetails: "Complete deep cleaning service including all rooms, kitchen appliances, bathrooms, and windows. Estimated 4-5 hours with 2 cleaners.",
    providerResponse: "We can schedule this for next week. Our team uses eco-friendly products and we're fully insured.",
    homeownerAddress: "456 Oak Street, Toronto, ON",
    homeownerName: "Sarah Johnson",
    providerName: "CleanPro Services"
  }
];

export const mockDashboardData = {
  totalSales: 15420,
  activeJobs: 12,
  customerSatisfaction: 4.8,
  weeklyData: [
    { day: 'Mon', orders: 8, revenue: 1200, thisWeek: 1200, lastMonth: 1100 },
    { day: 'Tue', orders: 12, revenue: 1800, thisWeek: 1800, lastMonth: 1650 },
    { day: 'Wed', orders: 15, revenue: 2200, thisWeek: 2200, lastMonth: 1900 },
    { day: 'Thu', orders: 10, revenue: 1500, thisWeek: 1500, lastMonth: 1700 },
    { day: 'Fri', orders: 18, revenue: 2800, thisWeek: 2800, lastMonth: 2400 },
    { day: 'Sat', orders: 22, revenue: 3200, thisWeek: 3200, lastMonth: 2900 },
    { day: 'Sun', orders: 16, revenue: 2420, thisWeek: 2420, lastMonth: 2200 }
  ],
  extendedWeeklyData: [
    { day: 'Mon', thisWeek: 1200, lastMonth: 1100 },
    { day: 'Mon-Mid', thisWeek: 1350, lastMonth: 1250 },
    { day: 'Tue', thisWeek: 1800, lastMonth: 1650 },
    { day: 'Tue-Mid', thisWeek: 1950, lastMonth: 1750 },
    { day: 'Wed', thisWeek: 2200, lastMonth: 1900 },
    { day: 'Wed-Mid', thisWeek: 1900, lastMonth: 1800 },
    { day: 'Thu', thisWeek: 1500, lastMonth: 1700 },
    { day: 'Thu-Mid', thisWeek: 1750, lastMonth: 1850 },
    { day: 'Fri', thisWeek: 2800, lastMonth: 2400 },
    { day: 'Fri-Mid', thisWeek: 3000, lastMonth: 2650 },
    { day: 'Sat', thisWeek: 3200, lastMonth: 2900 },
    { day: 'Sat-Mid', thisWeek: 2900, lastMonth: 2600 },
    { day: 'Sun', thisWeek: 2420, lastMonth: 2200 }
  ],
  recentCustomers: [
    { name: 'Sarah Johnson', service: 'Home Cleaning', amount: 150 },
    { name: 'Mike Wilson', service: 'Electrical Work', amount: 320 },
    { name: 'Emily Davis', service: 'Plumbing', amount: 180 },
    { name: 'David Brown', service: 'Painting', amount: 450 },
    { name: 'Lisa Chen', service: 'Landscaping', amount: 280 }
  ]
};

export const mockCalendarEvents = [
  {
    id: 1,
    title: "Kitchen Electrical Work",
    date: "2024-01-20",
    time: "09:00",
    customer: "John Smith",
    service: "Electrician",
    status: "confirmed"
  },
  {
    id: 2,
    title: "Deep House Cleaning",
    date: "2024-01-21",
    time: "10:00",
    customer: "Sarah Johnson",
    service: "Home Cleaning",
    status: "confirmed"
  },
  {
    id: 3,
    title: "Landscaping Project",
    date: "2024-01-22",
    time: "08:00",
    customer: "Mike Wilson",
    service: "Landscaping",
    status: "pending"
  }
];

// Helper functions
export const getServicesByCategory = (categoryId) => {
  return serviceCategories.find(cat => cat.id === categoryId)?.services || [];
};

export const getProvidersByService = (serviceName) => {
  return mockProviders.filter(provider => 
    provider.services.includes(serviceName)
  );
};

export const getQuotationsByProvider = (providerId) => {
  return mockQuotations.filter(q => q.providerId === providerId);
};

export const getQuotationsByHomeowner = (homeownerId) => {
  return mockQuotations.filter(q => q.homeownerId === homeownerId);
};

export const getOrdersByHomeowner = (homeownerId) => {
  return mockOrders.filter(o => o.homeownerId === homeownerId);
};

export const getOrdersByProvider = (providerId) => {
  return mockOrders.filter(o => o.providerId === providerId);
};