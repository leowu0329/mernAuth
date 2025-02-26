import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function VerifyEmail() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { email } = useParams();

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

  const handleKeyDown = (index, e) => {
    // 處理退格鍵
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/verify-email', {
        email,
        code: code.join(''),
      });
      toast.success('信箱驗證成功！');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || '驗證失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await axios.post('/api/auth/resend-verification', { email });
      toast.success('驗證碼已重新發送');
    } catch (error) {
      toast.error('重新發送失敗');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">驗證電子郵件</h1>
        <p className="text-center mb-6 text-gray-600">
          請輸入發送至 {email} 的 6 位數驗證碼
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
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
          <button
            type="submit"
            disabled={loading || code.some((digit) => !digit)}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            {loading ? '驗證中...' : '驗證'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={handleResend}
            className="text-blue-500 hover:underline"
          >
            重新發送驗證碼
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
