const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Base URL for the API
const BASE_URL = 'http://localhost:3000/api';

// Test user credentials
const testUser = {
  email: 'test2@example.com',
  password: 'password123'
};

// Updated profile data
const updatedProfile = {
  name: 'Updated Test User',
  bio: 'This is my updated bio',
  gender: 'other',
  date_of_birth: '1990-01-01',
  tags: 'updated, test, user'
};

let authToken = '';

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

// Function to test profile update
async function testUpdateProfile() {
  try {
    console.log('Testing profile update...');
    
    // Create form data
    const formData = new FormData();
    formData.append('name', updatedProfile.name);
    formData.append('bio', updatedProfile.bio);
    formData.append('gender', updatedProfile.gender);
    formData.append('date_of_birth', updatedProfile.date_of_birth);
    formData.append('tags', updatedProfile.tags);
    
    const response = await axios.put(`${BASE_URL}/profile`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      }
    });
    
    console.log('Profile update successful:', response.data.message);
    return true;
  } catch (error) {
    console.error('Profile update failed:', error.response?.data?.error || error.message);
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
    console.log('Profile retrieved:', response.data.user.name);
    console.log('Bio:', response.data.user.bio);
    return true;
  } catch (error) {
    console.error('Get profile failed:', error.response?.data?.error || error.message);
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log('Starting profile tests...\n');
  
  // Test 1: User login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('Login failed. Exiting tests.');
    return;
  }
  
  console.log();
  
  // Test 2: Profile update
  await testUpdateProfile();
  
  console.log();
  
  // Test 3: Get updated profile
  await testGetProfile();
  
  console.log('\nProfile tests completed.');
}

// Run the tests
runTests();