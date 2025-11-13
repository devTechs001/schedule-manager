export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  export const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return re.test(password);
  };
  
  export const validatePhone = (phone) => {
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(phone);
  };
  
  export const validateURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  
  export const validateRequired = (value) => {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  };
  
  export const validateMinLength = (value, min) => {
    return value && value.length >= min;
  };
  
  export const validateMaxLength = (value, max) => {
    return value && value.length <= max;
  };
  
  export const validateRange = (value, min, max) => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  };
  
  export const validateDate = (date) => {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
  };
  
  export const validateFutureDate = (date) => {
    return new Date(date) > new Date();
  };
  
  export const validatePastDate = (date) => {
    return new Date(date) < new Date();
  };
  
  export const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    
    if (strength <= 2) return { level: 'weak', color: 'red' };
    if (strength <= 4) return { level: 'medium', color: 'yellow' };
    return { level: 'strong', color: 'green' };
  };