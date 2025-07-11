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
    rating: 4.9,
    reviews: 89,
    completedJobs: 215,
    location: "Halifax, NS",
    responseTime: "Usually responds within 1 hour",
    yearEstablished: "2018",
    specialties: ["Deep cleaning", "Move-in/out cleaning", "Post-construction cleanup"],
    priceRange: "$150-$400"
  },
  {
    id: 2,
    name: "Elite Electrical",
    description: "Licensed electricians for residential and commercial work",
    services: ["Electrician", "Home Renovations"],
    rating: 4.8,
    reviews: 156,
    completedJobs: 342,
    location: "Halifax, NS",
    responseTime: "Usually responds within 2 hours",
    yearEstablished: "2015",
    specialties: ["Panel upgrades", "Smart home wiring", "Emergency repairs"],
    priceRange: "$100-$800"
  },
  {
    id: 3,
    name: "GreenThumb Landscaping",
    description: "Complete outdoor maintenance and landscaping solutions",
    services: ["Landscaping", "Lawn Mowing & Maintenance", "Snow Removal"],
    rating: 4.7,
    reviews: 73,
    completedJobs: 128,
    location: "Halifax, NS",
    responseTime: "Usually responds within 3 hours",
    yearEstablished: "2020",
    specialties: ["Garden design", "Seasonal cleanup", "Irrigation systems"],
    priceRange: "$80-$500"
  },
  {
    id: 4,
    name: "HandyMax Solutions",
    description: "Reliable handyman services for all your home repair needs",
    services: ["Handyman Services", "Painter", "Carpenter"],
    rating: 4.6,
    reviews: 92,
    completedJobs: 187,
    location: "Halifax, NS",
    responseTime: "Usually responds within 4 hours",
    yearEstablished: "2017",
    specialties: ["Furniture assembly", "Drywall repair", "Kitchen installations"],
    priceRange: "$60-$300"
  }
];

// Enhanced mock orders with detailed workflow
export const mockOrders = [
  {
    id: 1,
    quotationId: 1,
    homeownerId: 1,
    homeownerName: "John Smith",
    homeownerEmail: "john.smith@example.com",
    homeownerPhone: "+1 (555) 123-4567",
    homeownerAddress: "123 Main St, Halifax, NS",
    providerId: 1,
    providerName: "CleanPro Services",
    providerEmail: "contact@cleanpro.com",
    providerPhone: "+1 (555) 987-6543",
    serviceType: "Window Cleaning",
    serviceCategory: "Cleaning & Exterior Maintenance",
    description: "Need professional window cleaning for 2-story house, approximately 20 windows",
    quotationAmount: 180,
    orderDate: "2024-12-10T10:00:00Z",
    scheduledDate: "2024-12-15T10:00:00Z",
    status: "scheduled", // pending_quotation, quotation_sent, scheduled, in_progress, completed, cancelled
    workProgress: [
      {
        id: 1,
        timestamp: "2024-12-10T10:00:00Z",
        update: "Order confirmed",
        updatedBy: "homeowner",
        status: "scheduled"
      }
    ],
    invoice: {
      id: 1,
      amount: 180,
      status: "pending", // pending, sent, paid
      dueDate: "2024-12-22T00:00:00Z",
      items: [
        { description: "Window Cleaning - 20 windows", quantity: 1, rate: 180, amount: 180 }
      ]
    },
    messages: [
      {
        id: 1,
        senderId: 1,
        senderType: "provider",
        message: "Hi! We've confirmed your window cleaning appointment for December 15th at 10 AM. Is this time still good for you?",
        timestamp: "2024-12-10T14:00:00Z",
        read: true
      },
      {
        id: 2,
        senderId: 1,
        senderType: "homeowner", 
        message: "Yes, that works perfect! Thank you for confirming.",
        timestamp: "2024-12-10T15:00:00Z",
        read: true
      }
    ]
  },
  {
    id: 2,
    quotationId: 2,
    homeownerId: 1,
    homeownerName: "John Smith",
    providerId: 2,
    providerName: "Elite Electrical",
    serviceType: "Electrical Work",
    serviceCategory: "Home Maintenance & Repairs",
    description: "Install new outlets in kitchen and fix flickering lights",
    quotationAmount: 450,
    orderDate: "2024-12-08T09:00:00Z",
    scheduledDate: "2024-12-18T08:00:00Z",
    status: "in_progress",
    workProgress: [
      {
        id: 1,
        timestamp: "2024-12-08T09:00:00Z",
        update: "Order confirmed",
        updatedBy: "homeowner",
        status: "scheduled"
      },
      {
        id: 2,
        timestamp: "2024-12-18T08:00:00Z",
        update: "Work started - Installing kitchen outlets",
        updatedBy: "provider",
        status: "in_progress"
      }
    ],
    invoice: {
      id: 2,
      amount: 450,
      status: "pending",
      dueDate: "2024-12-25T00:00:00Z",
      items: [
        { description: "Kitchen outlet installation", quantity: 3, rate: 120, amount: 360 },
        { description: "Light fixture repair", quantity: 1, rate: 90, amount: 90 }
      ]
    },
    messages: []
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
    { day: 'Mon', orders: 8, revenue: 1200 },
    { day: 'Tue', orders: 12, revenue: 1800 },
    { day: 'Wed', orders: 15, revenue: 2200 },
    { day: 'Thu', orders: 10, revenue: 1500 },
    { day: 'Fri', orders: 18, revenue: 2800 },
    { day: 'Sat', orders: 22, revenue: 3200 },
    { day: 'Sun', orders: 16, revenue: 2420 }
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