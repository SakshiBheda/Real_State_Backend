const mongoose = require('mongoose');
const Property = require('../models/Property');
const Service = require('../models/Service');
const User = require('../models/User');
require('dotenv').config();

const sampleProperties = [
  {
    name: "Modern Luxury Villa",
    description: "Stunning contemporary villa with open floor plan, floor-to-ceiling windows, and premium finishes throughout. Features include a gourmet kitchen, spa-like bathrooms, and beautifully landscaped gardens.",
    category: "Residential",
    subcategory: "Villa",
    location: "Beverly Hills, CA",
    address: {
      street: "123 Luxury Lane",
      city: "Beverly Hills",
      state: "CA",
      zipCode: "90210",
      country: "USA",
      coordinates: {
        latitude: 34.0736,
        longitude: -118.4004
      }
    },
    price: 4500000,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
    ],
    type: "Buy",
    features: {
      bedrooms: 5,
      bathrooms: 4,
      area: 4500,
      areaUnit: "sqft",
      parkingSpaces: 3,
      yearBuilt: 2022,
      floors: 2
    },
    amenities: [
      "Swimming Pool",
      "Gym",
      "Garden",
      "Security System",
      "Smart Home",
      "Central AC"
    ],
    status: "Available",
    featured: true,
    agent: {
      id: 101,
      name: "John Doe",
      email: "john.doe@realestate.com",
      phone: "+1 (555) 123-4567",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200"
    }
  },
  {
    name: "Downtown Penthouse",
    description: "Luxurious penthouse apartment in the heart of downtown with panoramic city views. Features modern amenities, high-end appliances, and a private rooftop terrace.",
    category: "Residential",
    subcategory: "Penthouse",
    location: "Downtown Los Angeles, CA",
    address: {
      street: "456 City Center Blvd",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90012",
      country: "USA",
      coordinates: {
        latitude: 34.0522,
        longitude: -118.2437
      }
    },
    price: 2800000,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
    ],
    type: "Buy",
    features: {
      bedrooms: 3,
      bathrooms: 3,
      area: 2200,
      areaUnit: "sqft",
      parkingSpaces: 2,
      yearBuilt: 2020,
      floors: 1
    },
    amenities: [
      "Rooftop Terrace",
      "City Views",
      "Concierge",
      "Gym",
      "Pool",
      "Valet Parking"
    ],
    status: "Available",
    featured: true,
    agent: {
      id: 102,
      name: "Jane Smith",
      email: "jane.smith@realestate.com",
      phone: "+1 (555) 987-6543",
      photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200"
    }
  },
  {
    name: "Cozy Family Home",
    description: "Perfect family home in a quiet neighborhood with excellent schools nearby. Features a spacious backyard, updated kitchen, and comfortable living spaces.",
    category: "Residential",
    subcategory: "House",
    location: "Pasadena, CA",
    address: {
      street: "789 Oak Street",
      city: "Pasadena",
      state: "CA",
      zipCode: "91101",
      country: "USA",
      coordinates: {
        latitude: 34.1478,
        longitude: -118.1445
      }
    },
    price: 850000,
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
    images: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800"
    ],
    type: "Buy",
    features: {
      bedrooms: 4,
      bathrooms: 2,
      area: 1800,
      areaUnit: "sqft",
      parkingSpaces: 2,
      yearBuilt: 1995,
      floors: 2
    },
    amenities: [
      "Backyard",
      "Fireplace",
      "Updated Kitchen",
      "Hardwood Floors",
      "Central Heating"
    ],
    status: "Available",
    featured: false,
    agent: {
      id: 103,
      name: "Mike Johnson",
      email: "mike.johnson@realestate.com",
      phone: "+1 (555) 456-7890",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"
    }
  },
  {
    name: "Modern Office Building",
    description: "Prime commercial office building in the business district. Fully leased with excellent rental income potential. Modern amenities and parking available.",
    category: "Commercial",
    subcategory: "Office Building",
    location: "Century City, CA",
    address: {
      street: "2000 Avenue of the Stars",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90067",
      country: "USA",
      coordinates: {
        latitude: 34.0583,
        longitude: -118.4161
      }
    },
    price: 15000000,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"
    ],
    type: "Buy",
    features: {
      bedrooms: 0,
      bathrooms: 20,
      area: 50000,
      areaUnit: "sqft",
      parkingSpaces: 200,
      yearBuilt: 2018,
      floors: 15
    },
    amenities: [
      "Elevator",
      "Conference Rooms",
      "Parking Garage",
      "Security",
      "HVAC",
      "High-Speed Internet"
    ],
    status: "Available",
    featured: true,
    agent: {
      id: 104,
      name: "Sarah Wilson",
      email: "sarah.wilson@realestate.com",
      phone: "+1 (555) 321-0987",
      photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200"
    }
  },
  {
    name: "Beachfront Condo",
    description: "Beautiful beachfront condominium with direct ocean access. Wake up to stunning sunrise views and enjoy beach living at its finest.",
    category: "Residential",
    subcategory: "Condo",
    location: "Santa Monica, CA",
    address: {
      street: "100 Ocean Front Walk",
      city: "Santa Monica",
      state: "CA",
      zipCode: "90401",
      country: "USA",
      coordinates: {
        latitude: 34.0195,
        longitude: -118.4912
      }
    },
    price: 1200000,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
    ],
    type: "Buy",
    features: {
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      areaUnit: "sqft",
      parkingSpaces: 1,
      yearBuilt: 2010,
      floors: 1
    },
    amenities: [
      "Ocean View",
      "Beach Access",
      "Balcony",
      "Pool",
      "Gym",
      "Concierge"
    ],
    status: "Available",
    featured: false,
    agent: {
      id: 105,
      name: "David Brown",
      email: "david.brown@realestate.com",
      phone: "+1 (555) 654-3210",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200"
    }
  }
];

const sampleServices = [
  {
    title: "Buy Property",
    description: "Find your perfect home from our extensive portfolio of residential and commercial properties. Our expert agents will guide you through every step of the buying process.",
    icon: "shopping-cart",
    features: [
      "Expert guidance through buying process",
      "Property search assistance",
      "Negotiation support",
      "Closing coordination",
      "Market analysis and pricing",
      "Legal documentation support"
    ],
    category: "Property Services",
    priceType: "consultation",
    active: true,
    featured: true,
    order: 1,
    contactInfo: {
      email: "buying@realestate.com",
      phone: "+1 (555) 100-0001",
      department: "Sales Department"
    },
    benefits: [
      "Access to exclusive listings",
      "Professional market insights",
      "Streamlined buying process",
      "Post-purchase support"
    ],
    tags: ["buying", "residential", "commercial", "investment"]
  },
  {
    title: "Sell Property",
    description: "Get the best value for your property with our comprehensive selling services. From professional photography to strategic marketing, we ensure maximum exposure.",
    icon: "home",
    features: [
      "Professional photography",
      "Strategic marketing campaign",
      "Pricing consultation",
      "Showings management",
      "Negotiation expertise",
      "Transaction coordination"
    ],
    category: "Property Services",
    priceType: "percentage",
    price: 6,
    active: true,
    featured: true,
    order: 2,
    contactInfo: {
      email: "selling@realestate.com",
      phone: "+1 (555) 100-0002",
      department: "Listing Department"
    },
    benefits: [
      "Maximum market exposure",
      "Professional presentation",
      "Expert pricing strategy",
      "Dedicated listing agent"
    ],
    tags: ["selling", "marketing", "listing", "valuation"]
  },
  {
    title: "Property Management",
    description: "Comprehensive property management services for landlords and property investors. We handle everything from tenant screening to maintenance coordination.",
    icon: "building",
    features: [
      "Tenant screening and placement",
      "Rent collection and accounting",
      "Maintenance coordination",
      "Property inspections",
      "Legal compliance management",
      "24/7 emergency response"
    ],
    category: "Property Services",
    priceType: "percentage",
    price: 8,
    active: true,
    featured: true,
    order: 3,
    contactInfo: {
      email: "management@realestate.com",
      phone: "+1 (555) 100-0003",
      department: "Property Management"
    },
    benefits: [
      "Passive income optimization",
      "Professional tenant relations",
      "Property value preservation",
      "Stress-free ownership"
    ],
    tags: ["management", "rental", "investment", "maintenance"]
  },
  {
    title: "Investment Consulting",
    description: "Expert investment advice for real estate portfolios. We help identify profitable opportunities and develop strategic investment plans.",
    icon: "chart-line",
    features: [
      "Market analysis and research",
      "Investment opportunity identification",
      "Portfolio diversification strategies",
      "ROI calculations and projections",
      "Risk assessment and mitigation",
      "Exit strategy planning"
    ],
    category: "Consultation",
    priceType: "hourly",
    price: 200,
    active: true,
    featured: false,
    order: 4,
    contactInfo: {
      email: "consulting@realestate.com",
      phone: "+1 (555) 100-0004",
      department: "Investment Advisory"
    },
    benefits: [
      "Data-driven investment decisions",
      "Maximized return potential",
      "Risk-adjusted strategies",
      "Long-term wealth building"
    ],
    tags: ["investment", "consulting", "analysis", "portfolio"]
  },
  {
    title: "Mortgage Assistance",
    description: "Navigate the mortgage process with confidence. Our financial experts help you secure the best financing options for your property purchase.",
    icon: "calculator",
    features: [
      "Loan pre-qualification assistance",
      "Lender network access",
      "Rate comparison and analysis",
      "Application support and guidance",
      "Credit improvement strategies",
      "Closing cost optimization"
    ],
    category: "Financial Services",
    priceType: "free",
    active: true,
    featured: false,
    order: 5,
    contactInfo: {
      email: "mortgage@realestate.com",
      phone: "+1 (555) 100-0005",
      department: "Mortgage Services"
    },
    benefits: [
      "Competitive interest rates",
      "Streamlined approval process",
      "Expert financial guidance",
      "Multiple lender options"
    ],
    tags: ["mortgage", "financing", "loans", "credit"]
  },
  {
    title: "Legal Services",
    description: "Professional legal support for all your real estate transactions. Our network of attorneys ensures your interests are protected throughout the process.",
    icon: "gavel",
    features: [
      "Contract review and drafting",
      "Title search and insurance",
      "Closing representation",
      "Dispute resolution",
      "Zoning and compliance issues",
      "Estate planning integration"
    ],
    category: "Legal Services",
    priceType: "consultation",
    active: true,
    featured: false,
    order: 6,
    contactInfo: {
      email: "legal@realestate.com",
      phone: "+1 (555) 100-0006",
      department: "Legal Department"
    },
    benefits: [
      "Legal protection and compliance",
      "Risk mitigation strategies",
      "Professional representation",
      "Peace of mind transactions"
    ],
    tags: ["legal", "contracts", "compliance", "protection"]
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Property.deleteMany({});
    await Service.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create sample properties
    const properties = await Property.insertMany(sampleProperties);
    console.log(`Created ${properties.length} sample properties`);

    // Create sample services
    const services = await Service.insertMany(sampleServices);
    console.log(`Created ${services.length} sample services`);

    // Create admin user if it doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@realestate.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const admin = await User.createAdmin(adminEmail, adminPassword, 'Admin User');
    console.log(`Created admin user: ${admin.email}`);

    console.log('Database seeded successfully!');
    return { properties, services, admin };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleProperties, sampleServices };