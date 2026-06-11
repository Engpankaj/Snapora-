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

// Test video data
const testVideo = {
  title: 'Test Video',
  description: 'This is a test video',
  tags: 'test, video, snapora',
  category: 'other',
  nsfw: 'false'
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

// Function to test video upload
async function testVideoUpload() {
  try {
    console.log('Testing video upload...');
    
    // Path to test video file
    const testVideoPath = path.join(__dirname, 'test-video.mp4');
    
    // Create form data
    const formData = new FormData();
    formData.append('title', testVideo.title);
    formData.append('description', testVideo.description);
    formData.append('tags', testVideo.tags);
    formData.append('category', testVideo.category);
    formData.append('nsfw', testVideo.nsfw);
    formData.append('image', fs.createReadStream(testVideoPath));
    
    const response = await axios.post(`${BASE_URL}/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      }
    });
    
    console.log('Video upload successful:', response.data.message);
    return true;
  } catch (error) {
    console.error('Video upload failed:', error.response?.data?.error || error.message);
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log('Starting video upload tests...\n');
  
  // Test 1: User login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('Login failed. Exiting tests.');
    return;
  }
  
  console.log();
  
  // Test 2: Video upload
  await testVideoUpload();
  
  console.log('\nVideo upload tests completed.');
}

// Run the tests
runTests();