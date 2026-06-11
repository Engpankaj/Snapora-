const axios = require('axios');

// Test user data
const testUser = {
  name: 'Test User',
  username: 'testuser123',
  email: 'test123@example.com',
  password: 'password123'
};

// Function to test user registration
async function testRegister() {
  try {
    console.log('Testing user registration...');
    console.log('Sending data:', testUser);
    
    const response = await axios.post('http://localhost:3000/api/register', testUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Registration successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration failed:');
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
testRegister();