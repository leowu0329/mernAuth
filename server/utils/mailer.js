import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendVerificationEmail = async (email, code) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: '請驗證您的電子郵件',
    html: `
      <h1>電子郵件驗證</h1>
      <p>您的驗證碼是：</p>
      <h2 style="font-size: 24px; letter-spacing: 5px; color: #4A90E2;">${code}</h2>
      <p>驗證碼有效期為 10 分鐘，請儘快完成驗證。</p>
    `,
  });
};

export const sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: '重設密碼',
    html: `
      <h1>重設密碼請求</h1>
      <p>請點擊下方連結重設您的密碼：</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>如果您沒有要求重設密碼，請忽略此信件。</p>
    `,
  });
};
