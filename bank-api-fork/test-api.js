import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('Testing API endpoints...\n');

    // Test root endpoint
    console.log('1. Testing GET /');
    const rootResponse = await fetch('http://localhost:3002/');
    const rootData = await rootResponse.json();
    console.log('Status:', rootResponse.status);
    console.log('Data:', JSON.stringify(rootData, null, 2));
    console.log('');

    // Test users endpoint
    console.log('2. Testing GET /users');
    const usersResponse = await fetch('http://localhost:3002/users');
    const usersData = await usersResponse.json();
    console.log('Status:', usersResponse.status);
    console.log('Number of users:', Array.isArray(usersData) ? usersData.length : 'N/A');
    console.log('First user:', usersData[0] ? JSON.stringify(usersData[0], null, 2) : 'No users');
    console.log('');

    // Test creating a user
    console.log('3. Testing POST /users');
    const newUser = {
      name: 'Test User',
      address: 'Test Address 123',
      curp: 'TEST123456789',
      rfc: 'TEST123456789',
      password: 'testpass123'
    };
    const createResponse = await fetch('http://localhost:3002/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    const createData = await createResponse.json();
    console.log('Status:', createResponse.status);
    console.log('Response:', JSON.stringify(createData, null, 2));
    console.log('');

    // Test login
    console.log('4. Testing POST /login');
    const loginResponse = await fetch('http://localhost:3002/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ curp: 'TEST123456789', password: 'testpass123' })
    });
    const loginData = await loginResponse.json();
    console.log('Status:', loginResponse.status);
    console.log('Response:', JSON.stringify(loginData, null, 2));

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testAPI();