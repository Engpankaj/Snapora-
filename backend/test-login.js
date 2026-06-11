const axios = require('axios');

// Test user data
const testUser = {
  email: 'test2@example.com',
  password: 'password123'
};

// Function to test user login
async function testLogin() {
  try {
    console.log('Testing user login...');
    console.log('Sending data:', testUser);
    
    const response = await axios.post('http://localhost:3000/api/login', testUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

// Run the test
testLogin();