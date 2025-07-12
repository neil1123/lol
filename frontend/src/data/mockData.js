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

// Mock quotations - Starting fresh
export const mockQuotations = [];

// Mock dashboard data - Fresh platform stats
export const mockDashboardData = {
  totalSales: 0,
  activeJobs: 0,
  customerSatisfaction: 5.0,
  weeklyData: [
    { day: 'Mon', orders: 0, revenue: 0, thisWeek: 0, lastMonth: 0 },
    { day: 'Tue', orders: 0, revenue: 0, thisWeek: 0, lastMonth: 0 },
    { day: 'Wed', orders: 0, revenue: 0, thisWeek: 0, lastMonth: 0 },
    { day: 'Thu', orders: 0, revenue: 0, thisWeek: 0, lastMonth: 0 },
    { day: 'Fri', orders: 0, revenue: 0, thisWeek: 0, lastMonth: 0 },
    { day: 'Sat', orders: 0, revenue: 0, thisWeek: 0, lastMonth: 0 },
    { day: 'Sun', orders: 0, revenue: 0, thisWeek: 0, lastMonth: 0 }
  ],
  extendedWeeklyData: [
    { day: 'Mon', thisWeek: 0, lastMonth: 0 },
    { day: 'Mon-Mid', thisWeek: 0, lastMonth: 0 },
    { day: 'Tue', thisWeek: 0, lastMonth: 0 },
    { day: 'Tue-Mid', thisWeek: 0, lastMonth: 0 },
    { day: 'Wed', thisWeek: 0, lastMonth: 0 },
    { day: 'Wed-Mid', thisWeek: 0, lastMonth: 0 },
    { day: 'Thu', thisWeek: 0, lastMonth: 0 },
    { day: 'Thu-Mid', thisWeek: 0, lastMonth: 0 },
    { day: 'Fri', thisWeek: 0, lastMonth: 0 },
    { day: 'Fri-Mid', thisWeek: 0, lastMonth: 0 },
    { day: 'Sat', thisWeek: 0, lastMonth: 0 },
    { day: 'Sat-Mid', thisWeek: 0, lastMonth: 0 },
    { day: 'Sun', thisWeek: 0, lastMonth: 0 }
  ],
  recentCustomers: []
};

// Mock calendar events - Starting fresh
export const mockCalendarEvents = [];

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