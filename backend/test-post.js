const http = require('http');

const data = JSON.stringify({
  name: "Test Spot",
  address: "123 Test St",
  lat: 12.34,
  lng: 56.78,
  totalSlots: 10,
  pricePerHour: 50,
  type: "Open"
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/admin/parking',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Authorization': 'Bearer mock_admin_jwt_token_001'
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);

  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
