import { useState } from 'react';
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';

function PasswordInput({
  name,
  value,
  onChange,
  placeholder = '請輸入密碼',
  required = true,
  minLength = 6,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type={showPassword ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
        placeholder={placeholder}
        required={required}
        minLength={minLength}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
}

export default PasswordInput;
