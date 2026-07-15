import React, { useState } from 'react';

const PasswordInput = ({ value, onChange, placeholder, name, id }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="input-group">
      <input
        type={showPassword ? 'text' : 'password'}
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        id={id}
        required
      />
      <button
        className="btn btn-outline-secondary"
        type="button"
        onClick={() => setShowPassword(!showPassword)}
      >
        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
      </button>
    </div>
  );
};

export default PasswordInput;