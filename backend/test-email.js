require('dotenv').config();
const nodemailer = require('nodemailer');

const FROM_EMAIL = process.env.EMAIL_USER || 'noreply@example.com';
const FROM_NAME = process.env.BREVO_FROM_NAME || 'NextFiler';
const REPLY_TO = process.env.BREVO_REPLY_TO || FROM_EMAIL;

async function testEmail() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    replyTo: REPLY_TO,
    to: process.env.ADMIN_EMAIL,
    subject: 'Brevo SMTP Test',
    html: '<p>If you see this, Brevo SMTP is working!</p>',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + JSON.stringify(info));
  } catch (error) {
    console.error('Error occurred: ' + error.message);
  }
}

testEmail();
