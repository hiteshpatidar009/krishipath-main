const http = require('http');
const data = JSON.stringify({
  name: 'Test Mandi 5',
  stateId: '6a5d2ee7-eebe-4c70-84a3-b882a2840869', 
  districtId: '96e562cb-94db-42f1-bfe1-7a8a1d917ad2',
  aiPredictionEnabled: true,
  analyticsEnabled: true,
  status: 'ACTIVE'
});

const req = http.request({
  hostname: 'localhost',
  port: 59231,
  path: '/api/v1/mandi/admin',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', body));
});
req.on('error', e => console.error(e));
req.write(data);
req.end();
