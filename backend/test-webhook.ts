import axios from 'axios';

async function testWebhook() {
  try {
    const payload = {
      sender: "919876543210", // replace with a valid source if needed
      message: "Ujjain Mandi \nOnion super 2000 2500 \nSoyabean 4500",
      messageId: `test-wh-${Date.now()}`
    };
    
    console.log("Sending payload to webhook...");
    const response = await axios.post('http://localhost:59231/api/v1/market-sources/webhook', payload);
    console.log("Response:", response.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

testWebhook();
