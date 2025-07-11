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

// Mock orders data (extending from quotations)
export const mockOrders = [
  {
    id: 1,
    homeownerId: 1,
    providerId: 1,
    providerName: 'Elite Home Solutions',
    homeownerName: 'Sarah Johnson',
    homeownerEmail: 'sarah.johnson@email.com',
    homeownerPhone: '(555) 123-4567',
    serviceType: 'Home Cleaning',
    description: 'Deep cleaning for 3-bedroom house. Need comprehensive cleaning including bathrooms, kitchen, and living areas.',
    homeownerAddress: '123 Main Street, Halifax, NS B3H 1A1',
    quotationAmount: 350,
    orderDetails: 'Complete deep cleaning package including all rooms, bathrooms, kitchen deep clean, and window washing.',
    priority: 'medium',
    status: 'pending_quotation',
    requestDate: '2024-01-15T10:00:00Z',
    scheduledDate: '2024-01-20T14:00:00Z',
    messages: []
  },
  {
    id: 2,
    homeownerId: 2,
    providerId: 1,
    providerName: 'Elite Home Solutions',
    homeownerName: 'Mike Wilson',
    homeownerEmail: 'mike.wilson@email.com',
    homeownerPhone: '(555) 987-6543',
    serviceType: 'Electrical Work',
    description: 'Need electrical outlet installation in home office and kitchen lighting upgrade.',
    homeownerAddress: '456 Oak Avenue, Halifax, NS B3H 2B2',
    quotationAmount: 450,
    orderDetails: 'Installation of 3 new outlets in home office, kitchen lighting fixture upgrade, and electrical safety inspection.',
    priority: 'high',
    status: 'quotation_sent',
    requestDate: '2024-01-12T09:30:00Z',
    scheduledDate: '2024-01-18T10:00:00Z',
    messages: []
  },
  {
    id: 3,
    homeownerId: 3,
    providerId: 1,
    providerName: 'Elite Home Solutions',
    homeownerName: 'Emily Davis',
    homeownerEmail: 'emily.davis@email.com',
    homeownerPhone: '(555) 456-7890',
    serviceType: 'Plumbing',
    description: 'Kitchen sink repair and bathroom faucet replacement needed.',
    homeownerAddress: '789 Pine Street, Halifax, NS B3H 3C3',
    quotationAmount: 280,
    orderDetails: 'Kitchen sink pipe repair, bathroom faucet replacement with new fixtures, and water pressure check.',
    priority: 'medium',
    status: 'confirmed',
    requestDate: '2024-01-10T11:15:00Z',
    scheduledDate: '2024-01-16T13:00:00Z',
    messages: []
  },
  {
    id: 4,
    homeownerId: 4,
    providerId: 1,
    providerName: 'Elite Home Solutions',
    homeownerName: 'David Brown',
    homeownerEmail: 'david.brown@email.com',
    homeownerPhone: '(555) 321-0987',
    serviceType: 'Landscaping',
    description: 'Front yard landscaping and backyard maintenance needed for spring.',
    homeownerAddress: '321 Elm Street, Halifax, NS B3H 4D4',
    quotationAmount: 650,
    orderDetails: 'Front yard garden design and planting, backyard cleanup, lawn fertilization, and hedge trimming.',
    priority: 'low',
    status: 'in_progress',
    requestDate: '2024-01-08T14:20:00Z',
    scheduledDate: '2024-01-14T09:00:00Z',
    messages: []
  },
  {
    id: 5,
    homeownerId: 5,
    providerId: 1,
    providerName: 'Elite Home Solutions',
    homeownerName: 'Lisa Chen',
    homeownerEmail: 'lisa.chen@email.com',
    homeownerPhone: '(555) 654-3210',
    serviceType: 'Painting',
    description: 'Interior painting for living room and dining room walls.',
    homeownerAddress: '654 Maple Drive, Halifax, NS B3H 5E5',
    quotationAmount: 520,
    orderDetails: 'Interior painting for living room and dining room, primer and two coats of paint, ceiling touch-ups.',
    priority: 'medium',
    status: 'completed',
    requestDate: '2024-01-05T16:45:00Z',
    scheduledDate: '2024-01-12T08:00:00Z',
    messages: []
  }
];

// Mock messages data for provider messaging
export const mockMessages = [
  {
    id: 1,
    homeownerId: 1,
    providerId: 1,
    homeownerName: 'Sarah Johnson',
    orderType: 'Home Cleaning',
    orderId: 1,
    lastMessage: 'When can you schedule the cleaning?',
    lastMessageTime: '2024-01-15T14:30:00Z',
    messages: [
      {
        id: 1,
        content: 'Hi! I\'m interested in your home cleaning service. Can you provide a quote for my 3-bedroom house?',
        timestamp: '2024-01-15T10:00:00Z',
        sender: 'homeowner',
        read: true
      },
      {
        id: 2,
        content: 'Hello Sarah! I\'d be happy to help with your home cleaning needs. Based on your requirements, I can provide a comprehensive deep cleaning service. Would you like to schedule an assessment?',
        timestamp: '2024-01-15T10:15:00Z',
        sender: 'provider',
        read: true
      },
      {
        id: 3,
        content: 'That sounds great! What would be the cost for a deep cleaning of my 3-bedroom house?',
        timestamp: '2024-01-15T10:30:00Z',
        sender: 'homeowner',
        read: true
      },
      {
        id: 4,
        content: 'For a 3-bedroom house deep cleaning, my rate is $350. This includes all rooms, bathrooms, kitchen, and window washing. The service typically takes 4-5 hours.',
        timestamp: '2024-01-15T11:00:00Z',
        sender: 'provider',
        read: true
      },
      {
        id: 5,
        content: 'That works for me! When can you schedule the cleaning?',
        timestamp: '2024-01-15T14:30:00Z',
        sender: 'homeowner',
        read: false
      }
    ]
  },
  {
    id: 2,
    homeownerId: 2,
    providerId: 1,
    homeownerName: 'Mike Wilson',
    orderType: 'Electrical Work',
    orderId: 2,
    lastMessage: 'I\'ve sent you the detailed quotation. Please review it.',
    lastMessageTime: '2024-01-13T16:20:00Z',
    messages: [
      {
        id: 1,
        content: 'I need some electrical work done in my home office. Can you help with outlet installation?',
        timestamp: '2024-01-12T09:30:00Z',
        sender: 'homeowner',
        read: true
      },
      {
        id: 2,
        content: 'Absolutely! I can help with outlet installation. How many outlets do you need and in which rooms?',
        timestamp: '2024-01-12T10:00:00Z',
        sender: 'provider',
        read: true
      },
      {
        id: 3,
        content: 'I need 3 outlets in my home office and also looking to upgrade my kitchen lighting. Can you handle both?',
        timestamp: '2024-01-12T10:15:00Z',
        sender: 'homeowner',
        read: true
      },
      {
        id: 4,
        content: 'Yes, I can handle both projects. Let me prepare a detailed quotation for you including materials and labor.',
        timestamp: '2024-01-13T09:00:00Z',
        sender: 'provider',
        read: true
      },
      {
        id: 5,
        content: 'I\'ve sent you the detailed quotation. Please review it and let me know if you have any questions.',
        timestamp: '2024-01-13T16:20:00Z',
        sender: 'provider',
        read: true
      }
    ]
  },
  {
    id: 3,
    homeownerId: 3,
    providerId: 1,
    homeownerName: 'Emily Davis',
    orderType: 'Plumbing',
    orderId: 3,
    lastMessage: 'Perfect! I\'ll be there tomorrow at 1 PM.',
    lastMessageTime: '2024-01-15T18:45:00Z',
    messages: [
      {
        id: 1,
        content: 'I have a kitchen sink that needs repair and my bathroom faucet needs replacement. Are you available this week?',
        timestamp: '2024-01-10T11:15:00Z',
        sender: 'homeowner',
        read: true
      },
      {
        id: 2,
        content: 'Hi Emily! I can definitely help with both the sink repair and faucet replacement. Let me schedule a time to assess the work needed.',
        timestamp: '2024-01-10T12:00:00Z',
        sender: 'provider',
        read: true
      },
      {
        id: 3,
        content: 'Great! I\'m available most afternoons this week. What time works best for you?',
        timestamp: '2024-01-10T13:30:00Z',
        sender: 'homeowner',
        read: true
      },
      {
        id: 4,
        content: 'How about Tuesday at 1 PM? I can come by, assess the issues, and provide you with a quote.',
        timestamp: '2024-01-15T18:00:00Z',
        sender: 'provider',
        read: true
      },
      {
        id: 5,
        content: 'Perfect! I\'ll be there tomorrow at 1 PM.',
        timestamp: '2024-01-15T18:45:00Z',
        sender: 'homeowner',
        read: false
      }
    ]
  },
  {
    id: 4,
    homeownerId: 4,
    providerId: 1,
    homeownerName: 'David Brown',
    orderType: 'Landscaping',
    orderId: 4,
    lastMessage: 'The front yard looks amazing! Thank you for the excellent work.',
    lastMessageTime: '2024-01-14T17:30:00Z',
    messages: [
      {
        id: 1,
        content: 'I\'m looking for landscaping services for my front and back yard. Can you provide a quote?',
        timestamp: '2024-01-08T14:20:00Z',
        sender: 'homeowner',
        read: true
      },
      {
        id: 2,
        content: 'I\'d be happy to help with your landscaping project! What type of work are you looking for?',
        timestamp: '2024-01-08T15:00:00Z',
        sender: 'provider',
        read: true
      },
      {
        id: 3,
        content: 'I need front yard garden design and planting, plus general backyard maintenance and cleanup.',
        timestamp: '2024-01-08T15:30:00Z',
        sender: 'homeowner',
        read: true
      },
      {
        id: 4,
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