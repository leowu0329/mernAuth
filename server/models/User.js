// 引入必要的模組
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// 定義使用者資料結構
const userSchema = new mongoose.Schema(
  {
    // 使用者名稱
    name: {
      type: String,
      required: true, // 必填欄位
      trim: true, // 自動移除前後空白
    },
    // 電子郵件
    email: {
      type: String,
      required: true, // 必填欄位
      unique: true, // 不可重複
      trim: true, // 自動移除前後空白
      lowercase: true, // 轉換為小寫
    },
    // 密碼
    password: {
      type: String,
      required: true, // 必填欄位
    },
    // 帳號驗證狀態
    verified: {
      type: Boolean,
      default: false, // 預設為未驗證
    },
    // 帳號驗證相關欄位
    verificationToken: String, // 驗證 Token
    resetPasswordToken: String, // 重設密碼 Token
    resetPasswordExpires: Date, // 重設密碼期限
    verificationCode: {
      type: String,
      select: true, // 確保可以查詢此欄位
    },
    verificationCodeExpires: {
      type: Date,
      select: true, // 確保可以查詢此欄位
    },
    // 個人資料欄位
    birthday: {
      type: Date,
    },
    address: {
      type: String,
    },
    // 身分證字號
    idNumber: {
      type: String,
      unique: true, // 不可重複
      sparse: true, // 允許空值且不檢查唯一性
    },
  },
  {
    timestamps: true, // 自動添加 createdAt 和 updatedAt 時間戳
  },
);

// 儲存前自動將密碼進行雜湊處理
userSchema.pre('save', async function (next) {
  // 如果密碼沒有被修改，則跳過雜湊
  if (!this.isModified('password')) return next();

  try {
    // 產生加密用的 salt
    const salt = await bcrypt.genSalt(10);
    // 使用 bcrypt 進行密碼雜湊
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 定義密碼比對方法
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // 使用 bcrypt 比對密碼是否正確
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', error);
    throw error;
  }
};

// 建立並導出 User 模型
const User = mongoose.model('User', userSchema);
export default User;
