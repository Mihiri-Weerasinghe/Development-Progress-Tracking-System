import dotenv from 'dotenv';
import { sendRegistrationConfirmationEmail } from './services/emailService.js';

dotenv.config();

console.log('--- Testing Registration Confirmation Email ---');
console.log('EMAIL_USER configured:', process.env.EMAIL_USER ? 'YES (' + process.env.EMAIL_USER + ')' : 'NO (Will use Ethereal test mailer)');
console.log('EMAIL_PASS configured:', process.env.EMAIL_PASS ? 'YES (Hidden)' : 'NO');

const testRecipient = process.argv[2] || process.env.EMAIL_USER || 'testofficer@katugastota.edu.lk';

console.log(`Sending sample registration confirmation to: ${testRecipient}...`);

sendRegistrationConfirmationEmail({
  to: testRecipient,
  name: 'K.M. Mihiri Weerasinghe',
  role: 'Director',
  phone: '0771234567',
  email: testRecipient,
})
  .then((res) => {
    console.log('\n--- Result ---');
    console.log('Success:', res.success);
    if (res.isTest) {
      console.log('Mode: TEST (Ethereal)');
      console.log('Preview URL:', res.previewUrl);
    } else {
      console.log('Mode: PRODUCTION / REAL SMTP');
      console.log('Message ID:', res.messageId);
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error sending email:', err);
    process.exit(1);
  });
