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

// Test image data
const testImage = {
  title: 'Test Image',
  description: 'This is a test image',
  tags: 'test, image, snapora',
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

// Function to test image upload
async function testUpload() {
  try {
    console.log('Testing image upload...');
    
    // Create a simple image file to use as test image (PNG format)
    const testImagePath = path.join(__dirname, 'test-image.png');
    const pngHeader = Buffer.from('89504e470d0a1a0a', 'hex'); // PNG file header
    const imageData = Buffer.from('This is a test image file for upload testing.');
    const testImageBuffer = Buffer.concat([pngHeader, imageData]);
    fs.writeFileSync(testImagePath, testImageBuffer);
    
    // Create form data
    const formData = new FormData();
    formData.append('title', testImage.title);
    formData.append('description', testImage.description);
    formData.append('tags', testImage.tags);
    formData.append('category', testImage.category);
    formData.append('nsfw', testImage.nsfw);
    formData.append('image', fs.createReadStream(testImagePath));
    
    const response = await axios.post(`${BASE_URL}/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      }
    });
    
    console.log('Upload successful:', response.data.message);
    
    // Clean up test file
    fs.unlinkSync(testImagePath);
    
    return true;
  } catch (error) {
    console.error('Upload failed:', error.response?.data?.error || error.message);
    
    // Clean up test file if it exists
    const testImagePath = path.join(__dirname, 'test-image.png');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log('Starting upload tests...\n');
  
  // Test 1: User login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('Login failed. Exiting tests.');
    return;
  }
  
  console.log();
  
  // Test 2: Image upload
  await testUpload();
  
  console.log('\nUpload tests completed.');
}

// Run the tests
runTests();