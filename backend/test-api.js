const axios = require('axios');

// Base URL for the API
const BASE_URL = 'http://localhost:3000/api';

// Test user data
const testUser = {
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
};

// Test image data
const testImage = {
  title: 'Test Image',
  description: 'This is a test image',
  tags: 'test, image, snapora',
  category: 'other'
};

let authToken = '';
let userId = '';
let imageId = '';

// Function to test user registration
async function testRegister() {
  try {
    console.log('Testing user registration...');
    const response = await axios.post(`${BASE_URL}/register`, testUser);
    console.log('Registration successful:', response.data.message);
    authToken = response.data.token;
    userId = response.data.user.id;
    return true;
  } catch (error) {
    console.error('Registration failed:', error.response?.data?.error || error.message);
    return false;
  }
}

// Function to test user login
async function testLogin() {
  try {
    console.log('Testing user login...');
    const response = await axios.post(`${BASE_URL}/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('Login successful:', response.data.message);
    authToken = response.data.token;
    return true;
  } catch (error) {
    console.error('Login failed:', error.response?.data?.error || error.message);
    return false;
  }
}

// Function to test getting user profile
async function testGetProfile() {
  try {
    console.log('Testing get user profile...');
    const response = await axios.get(`${BASE_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('Profile retrieved:', response.data.user.username);
    return true;
  } catch (error) {
    console.error('Get profile failed:', error.response?.data?.error || error.message);
    return false;
  }
}

// Function to test getting images
async function testGetImages() {
  try {
    console.log('Testing get images...');
    const response = await axios.get(`${BASE_URL}/images`);
    console.log(`Retrieved ${response.data.images.length} images`);
    return true;
  } catch (error) {
    console.error('Get images failed:', error.response?.data?.error || error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('Starting API tests...\n');
  
  // Test 1: User registration
  const registerSuccess = await testRegister();
  if (!registerSuccess) {
    // If registration fails, try login
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
      console.log('Both registration and login failed. Exiting tests.');
      return;
    }
  }
  
  console.log();
  
  // Test 2: Get user profile
  await testGetProfile();
  console.log();
  
  // Test 3: Get images
  await testGetImages();
  console.log();
  
  console.log('API tests completed.');
}

// Run the tests
runTests();