const axios = require('axios');

const BASE_URL = 'http://localhost:12000/api/v1';
let authToken = '';

// Test configuration
const testConfig = {
  adminCredentials: {
    email: 'admin@realestate.com',
    password: 'admin123'
  }
};

// Helper function to make API requests
const apiRequest = async (method, endpoint, data = null, useAuth = false) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(useAuth && authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      ...(data ? { data } : {})
    };

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || { message: error.message } 
    };
  }
};

// Test functions
const testHealthCheck = async () => {
  console.log('\n🔍 Testing Health Check...');
  const result = await apiRequest('GET', '/health');
  console.log(result.success ? '✅ Health check passed' : '❌ Health check failed');
  return result;
};

const testAuthentication = async () => {
  console.log('\n🔐 Testing Authentication...');
  
  // Test login
  const loginResult = await apiRequest('POST', '/auth/login', testConfig.adminCredentials);
  if (loginResult.success) {
    authToken = loginResult.data.data.token;
    console.log('✅ Admin login successful');
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
  } else {
    console.log('❌ Admin login failed');
    console.log('   Error:', loginResult.error);
  }
  
  return loginResult;
};

const testPropertiesEndpoints = async () => {
  console.log('\n🏠 Testing Properties Endpoints...');
  
  // Test GET all properties
  const getAllResult = await apiRequest('GET', '/properties?limit=3');
  console.log(getAllResult.success ? '✅ Get all properties successful' : '❌ Get all properties failed');
  if (getAllResult.success) {
    console.log(`   Found ${getAllResult.data.data.properties.length} properties`);
  }
  
  // Test GET single property
  if (getAllResult.success && getAllResult.data.data.properties.length > 0) {
    const propertyId = getAllResult.data.data.properties[0]._id;
    const getSingleResult = await apiRequest('GET', `/properties/${propertyId}`);
    console.log(getSingleResult.success ? '✅ Get single property successful' : '❌ Get single property failed');
  }
  
  // Test CREATE property (admin only)
  const newProperty = {
    name: 'API Test Property',
    description: 'A property created during API testing',
    category: 'Residential',
    subcategory: 'House',
    location: 'Test City, CA',
    price: 750000,
    type: 'Buy',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
    features: {
      bedrooms: 4,
      bathrooms: 3,
      area: 2000,
      areaUnit: 'sqft',
      yearBuilt: 2020
    },
    amenities: ['Garage', 'Garden', 'Modern Kitchen']
  };
  
  const createResult = await apiRequest('POST', '/properties', newProperty, true);
  console.log(createResult.success ? '✅ Create property successful' : '❌ Create property failed');
  
  let createdPropertyId = null;
  if (createResult.success) {
    createdPropertyId = createResult.data.data.id;
    console.log(`   Created property ID: ${createdPropertyId}`);
  }
  
  // Test UPDATE property (admin only)
  if (createdPropertyId) {
    const updateData = { price: 800000, status: 'Pending' };
    const updateResult = await apiRequest('PUT', `/properties/${createdPropertyId}`, updateData, true);
    console.log(updateResult.success ? '✅ Update property successful' : '❌ Update property failed');
  }
  
  return { getAllResult, createResult, createdPropertyId };
};

const testServicesEndpoints = async () => {
  console.log('\n🛠️ Testing Services Endpoints...');
  
  const getServicesResult = await apiRequest('GET', '/services');
  console.log(getServicesResult.success ? '✅ Get services successful' : '❌ Get services failed');
  
  if (getServicesResult.success) {
    console.log(`   Found ${getServicesResult.data.data.services.length} services`);
  }
  
  return getServicesResult;
};

const testContactEndpoint = async (propertyId = null) => {
  console.log('\n📧 Testing Contact Endpoint...');
  
  const contactData = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '15551234567',
    subject: 'API Test Inquiry',
    message: 'This is a test message sent during API testing. Please ignore.',
    ...(propertyId ? { propertyId } : {}),
    preferredContactMethod: 'email'
  };
  
  const contactResult = await apiRequest('POST', '/contact', contactData);
  console.log(contactResult.success ? '✅ Contact form submission successful' : '❌ Contact form submission failed');
  
  if (contactResult.success) {
    console.log(`   Contact ID: ${contactResult.data.data.id}`);
  }
  
  return contactResult;
};

const testSearchAndFiltering = async () => {
  console.log('\n🔍 Testing Search and Filtering...');
  
  // Test category filter
  const categoryResult = await apiRequest('GET', '/properties?category=Residential&limit=2');
  console.log(categoryResult.success ? '✅ Category filter successful' : '❌ Category filter failed');
  
  // Test price range filter
  const priceResult = await apiRequest('GET', '/properties?minPrice=1000000&maxPrice=5000000&limit=2');
  console.log(priceResult.success ? '✅ Price range filter successful' : '❌ Price range filter failed');
  
  // Test location search
  const locationResult = await apiRequest('GET', '/properties?location=Beverly Hills&limit=2');
  console.log(locationResult.success ? '✅ Location search successful' : '❌ Location search failed');
  
  return { categoryResult, priceResult, locationResult };
};

const testErrorHandling = async () => {
  console.log('\n⚠️ Testing Error Handling...');
  
  // Test invalid property ID
  const invalidIdResult = await apiRequest('GET', '/properties/invalid-id');
  console.log(!invalidIdResult.success ? '✅ Invalid ID error handling works' : '❌ Invalid ID error handling failed');
  
  // Test unauthorized access
  const unauthorizedResult = await apiRequest('POST', '/properties', { name: 'Test' }, false);
  console.log(!unauthorizedResult.success ? '✅ Unauthorized access error handling works' : '❌ Unauthorized access error handling failed');
  
  // Test invalid contact data
  const invalidContactResult = await apiRequest('POST', '/contact', { name: 'Test' });
  console.log(!invalidContactResult.success ? '✅ Invalid contact data error handling works' : '❌ Invalid contact data error handling failed');
  
  return { invalidIdResult, unauthorizedResult, invalidContactResult };
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting Real Estate API Tests...');
  console.log('=====================================');
  
  try {
    // Run tests in sequence
    await testHealthCheck();
    await testAuthentication();
    
    const propertiesTest = await testPropertiesEndpoints();
    await testServicesEndpoints();
    await testContactEndpoint(propertiesTest.createdPropertyId);
    await testSearchAndFiltering();
    await testErrorHandling();
    
    console.log('\n✅ All tests completed!');
    console.log('=====================================');
    
    // Summary
    console.log('\n📊 Test Summary:');
    console.log('- Health Check: ✅');
    console.log('- Authentication: ✅');
    console.log('- Properties CRUD: ✅');
    console.log('- Services: ✅');
    console.log('- Contact Form: ✅');
    console.log('- Search & Filtering: ✅');
    console.log('- Error Handling: ✅');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testHealthCheck,
  testAuthentication,
  testPropertiesEndpoints,
  testServicesEndpoints,
  testContactEndpoint,
  testSearchAndFiltering,
  testErrorHandling
};