// 引入必要的 React Hooks 和相關模組
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

// 電子郵件驗證頁面組件
function VerifyEmail() {
  // 驗證碼狀態，包含 6 個數字
  const [code, setCode] = useState(['', '', '', '', '', '']);
  // 載入狀態
  const [loading, setLoading] = useState(false);
  // 用於頁面導航的 hook
  const navigate = useNavigate();
  // 從 URL 參數中獲取電子郵件
  const { email } = useParams();

  // 處理驗證碼輸入變更
  const handleChange = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // 自動跳到下一個輸入框
      if (value && index < 5) {
        document.getElementById(`code-${index + 1}`).focus();
      }
    }
  };

  // 處理鍵盤按下事件
  const handleKeyDown = (index, e) => {
    // 處理退格鍵
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus();
    }
  };

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 確保驗證碼完整
      const verificationCode = code.join('');
      if (verificationCode.length !== 6) {
        toast.error('請輸入完整的驗證碼');
        return;
      }

      // 發送驗證請求
      const response = await axios.post(
        'http://localhost:5000/api/auth/verify-email',
        {
          email,
          code: verificationCode,
        },
        { withCredentials: true },
      );

      // 顯示成功提示並導航到登入頁面
      toast.success(response.data.message || '信箱驗證成功！');
      navigate('/login');
    } catch (error) {
      console.error('驗證錯誤:', error); // 添加錯誤日誌
      toast.error(
        error.response?.data?.message || '驗證失敗，請確認驗證碼是否正確',
      );
    } finally {
      setLoading(false);
    }
  };

  // 處理重新發送驗證碼
  const handleResend = async () => {
    try {
      setLoading(true); // 添加載入狀態
      const response = await axios.post(
        'http://localhost:5000/api/auth/resend-verification',
        { email },
        { withCredentials: true },
      );
      toast.success(response.data.message || '驗證碼已重新發送');
    } catch (error) {
      console.error('重新發送錯誤:', error);
      toast.error(error.response?.data?.message || '重新發送失敗，請稍後再試');
    } finally {
      setLoading(false); // 結束載入狀態
    }
  };

  // 渲染驗證表單
  return (
    // 容器元素，設置最大寬度和內邊距
    <div className="container mx-auto px-4 py-8">
      {/* 內容區塊，限制最大寬度並置中 */}
      <div className="max-w-md mx-auto">
        {/* 頁面標題 */}
        <h1 className="text-3xl font-bold text-center mb-8">驗證電子郵件</h1>
        {/* 說明文字 */}
        <p className="text-center mb-6 text-gray-600">
          請輸入發送至 {email} 的 6 位數驗證碼
        </p>
        {/* 驗證碼輸入表單 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 驗證碼輸入框組 */}
          <div className="flex justify-between max-w-xs mx-auto">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-2xl border rounded-lg focus:outline-none focus:border-blue-500"
              />
            ))}
          </div>
          {/* 提交按鈕 */}
          <button
            type="submit"
            disabled={loading || code.some((digit) => !digit)}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            {loading ? '驗證中...' : '驗證'}
          </button>
        </form>
        {/* 重新發送驗證碼按鈕 */}
        <div className="mt-4 text-center">
          <button
            onClick={handleResend}
            disabled={loading} // 添加禁用狀態
            className="text-blue-500 hover:underline disabled:opacity-50"
          >
            {loading ? '發送中...' : '重新發送驗證碼'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
