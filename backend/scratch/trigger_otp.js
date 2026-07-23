import axios from 'axios';

async function run() {
  try {
    const res = await axios.post('http://localhost:59231/api/v1/auth/mfa/start', {
      flow: 'signup',
      type: 'phone_sms',
      email: 'tushargour004@gmail.com',
      phone: '+918888888888'
    });
    console.log("Success response:", res.data);
  } catch (err) {
    if (err.response) {
      console.log("Error status:", err.response.status);
      console.log("Error response data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("Full Error:", err);
    }
  }
}

run();
