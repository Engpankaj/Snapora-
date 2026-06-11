const axios = require('axios');

// Test user data
const testUser = {
  name: 'Test User 2',
  username: 'testuser2',
  email: 'test2@example.com',
  password: 'password123'
};

// Function to test user registration
async function testRegister() {
  try {
    console.log('Testing user registration...');
    const response = await axios.post('http://localhost:3000/api/register', testUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Registration successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
    return null;
  }
}

// Run the test
testRegister();