import { TwilioClient } from '../dist/shared/integrations/twilio.client.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('d:/Projects/flutter_projects/ROYAL/RSBC/rsbc/backend/.env') });

async function run() {
  try {
    const client = TwilioClient.getInstance();
    console.log("Twilio initialized.");
    
    const payload = {
      to: '+918888888888',
      from: process.env._TWILIO_SMS_FROM || '+13502405333',
      body: 'Test RSBC OTP'
    };
    
    console.log("Sending with payload:", payload);
    const msg = await client.messages.create(payload);
    console.log("Success:", msg.sid);
  } catch (err) {
    console.error("Full Twilio Error:", err);
  }
}

run();
