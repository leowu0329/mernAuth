// 引入必要的 React Hooks
import { useState } from 'react';
// 引入 Font Awesome 圖示
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';

// 密碼輸入框組件
function PasswordInput({
  name, // 輸入框名稱
  value, // 輸入框值
  onChange, // 值變更處理函數
  placeholder = '請輸入密碼', // 預設提示文字
  required = true, // 是否必填，預設為必填
  minLength = 6, // 最小長度，預設為 6
}) {
  // 控制密碼顯示/隱藏的狀態
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      {/* 左側鎖頭圖示 */}
      <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      {/* 密碼輸入框 */}
      <input
        type={showPassword ? 'text' : 'password'} // 根據 showPassword 狀態切換輸入框類型
        name={name}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
        placeholder={placeholder}
        required={required}
        minLength={minLength}
      />
      {/* 切換密碼顯示/隱藏的按鈕 */}
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {/* 根據 showPassword 狀態顯示不同圖示 */}
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
}

export default PasswordInput;
