// 引入必要的模組
import nodemailer from 'nodemailer';
import 'dotenv/config';

// 建立郵件傳輸器
const transporter = nodemailer.createTransport({
  service: 'gmail', // 使用 gmail 服務
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 測試郵件連接
transporter.verify(function (error, success) {
  if (error) {
    console.log('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

// 生成 6 位數的驗證碼
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 發送驗證信件
export const sendVerificationEmail = async (email, code) => {
  try {
    console.log('Sending verification email to:', email); // 調試日誌

    const mailOptions = {
      from: `"MERN Auth" <${process.env.EMAIL_USER}>`, // 添加發件人名稱
      to: email,
      subject: '信箱驗證',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">歡迎註冊</h1>
          <p style="font-size: 16px;">您的驗證碼是：</p>
          <h2 style="font-size: 24px; letter-spacing: 5px; color: #2563eb; background: #f3f4f6; padding: 10px; text-align: center;">
            ${code}
          </h2>
          <p style="color: #666;">此驗證碼將在 10 分鐘後失效。</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            此為系統自動發送的郵件，請勿直接回覆。
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully'); // 調試日誌
  } catch (error) {
    console.error('Send verification email error:', error); // 錯誤日誌
    throw new Error('發送驗證信件失敗');
  }
};

// 發送重設密碼信件
export const sendResetPasswordEmail = async (email, token) => {
  // 組合重設密碼的完整 URL
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER, // 寄件者信箱
    to: email, // 收件者信箱
    subject: '重設密碼',
    html: `
      <h1>重設密碼請求</h1>
      <p>請點擊下方連結重設您的密碼：</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>如果您沒有要求重設密碼，請忽略此信件。</p>
    `,
  });
};
