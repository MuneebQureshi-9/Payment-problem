require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

(async () => {
  try {
    // TEST 1: Try sending from Brevo relay email (WRONG - will fail)
    console.log('❌ TEST 1: Sending from Brevo relay email (a9c31f001@smtp-brevo.com)...');
    await transporter.sendMail({
      from: 'a9c31f001@smtp-brevo.com',
      to: 'ashbilsadankhan@gmail.com',
      subject: 'Test 1 - Brevo Relay Email',
      html: '<p>This is test 1 from Brevo relay email</p>',
    });
    console.log('✅ TEST 1 sent (but may bounce)');
  } catch (err) {
    console.log('❌ TEST 1 ERROR:', err.message);
  }

  console.log('\n');

  try {
    // TEST 2: Try sending from verified Brevo sender or Gmail
    console.log('TEST 2: Sending from Gmail (ashbilsadankhan@gmail.com)...');
    await transporter.sendMail({
      from: 'ashbilsadankhan@gmail.com',
      to: 'ashbilsadankhan@gmail.com',
      subject: 'Test 2 - From Gmail Address',
      html: '<p>This is test 2 from Gmail</p>',
    });
    console.log('✅ TEST 2 sent successfully!');
  } catch (err) {
    console.log('❌ TEST 2 ERROR:', err.message);
  }

  transporter.close();
  process.exit(0);
})();
