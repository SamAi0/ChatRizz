import { useState } from "react";
import { AlertCircleIcon, CheckCircleIcon, InfoIcon } from "lucide-react";

// Validation utilities
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone) => {
  const cleaned = phone.replace(/\s/g, '');
  const regex = /^[\+]?[1-9][\d]{0,14}$/;
  return regex.test(cleaned);
};

export const validateWebsite = (website) => {
  const regex = /^https?:\/\/.+/;
  return regex.test(website);
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
};

const calculatePasswordStrength = (password) => {
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  if (score <= 2) return { level: 'weak', color: 'red' };
  if (score <= 4) return { level: 'medium', color: 'yellow' };
  return { level: 'strong', color: 'green' };
};

// Password Strength Indicator Component
export const PasswordStrengthIndicator = ({ password }) => {
  const validation = validatePassword(password);
  const { strength } = validation;
  
  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 bg-slate-700 rounded-full h-2">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              strength.color === 'red' ? 'bg-red-500 w-1/3' :
              strength.color === 'yellow' ? 'bg-yellow-500 w-2/3' :
              'bg-green-500 w-full'
            }`}
          />
        </div>
        <span className={`text-sm font-medium ${
          strength.color === 'red' ? 'text-red-400' :
          strength.color === 'yellow' ? 'text-yellow-400' :
          'text-green-400'
        }`}>
          {strength.level.charAt(0).toUpperCase() + strength.level.slice(1)}
        </span>
      </div>
      
      {!validation.isValid && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-red-400 text-xs">
              <AlertCircleIcon className="w-3 h-3" />
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Input Validation Component
export const ValidatedInput = ({ 
  type, 
  value, 
  onChange, 
  placeholder, 
  validationType,
  required = false,
  className = "",
  ...props 
}) => {
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const handleValidation = (inputValue) => {
    if (!touched) setTouched(true);
    
    let valid = true;
    let message = "";

    if (required && !inputValue.trim()) {
      valid = false;
      message = `${placeholder} is required`;
    } else if (inputValue) {
      switch (validationType) {
        case 'email':
          valid = validateEmail(inputValue);
          message = valid ? "" : "Please enter a valid email address";
          break;
        case 'phone':
          valid = validatePhone(inputValue);
          message = valid ? "" : "Please enter a valid phone number";
          break;
        case 'website':
          valid = validateWebsite(inputValue);
          message = valid ? "" : "Please enter a valid URL (http:// or https://)";
          break;
        case 'name':
          valid = inputValue.length >= 2 && inputValue.length <= 50;
          message = valid ? "" : "Name must be between 2 and 50 characters";
          break;
        case 'bio':
          valid = inputValue.length <= 500;
          message = valid ? "" : "Bio cannot exceed 500 characters";
          break;
        default:
          valid = true;
      }
    }

    setIsValid(valid);
    setErrorMessage(message);
    return valid;
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(e);
    handleValidation(newValue);
  };

  const handleBlur = () => {
    handleValidation(value);
  };

  return (
    <div className="space-y-1">
      <input
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full px-3 py-2 bg-slate-700/50 border rounded-lg text-slate-200 focus:outline-none transition-colors ${
          touched ? (isValid ? 'border-green-500 focus:border-green-400' : 'border-red-500 focus:border-red-400') : 'border-slate-600 focus:border-cyan-500'
        } ${className}`}
        {...props}
      />
      
      {touched && !isValid && errorMessage && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircleIcon className="w-4 h-4" />
          {errorMessage}
        </div>
      )}
      
      {touched && isValid && value && (
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <CheckCircleIcon className="w-4 h-4" />
          Looks good!
        </div>
      )}
    </div>
  );
};

// Security Alert Component
export const SecurityAlert = ({ type, message, onDismiss }) => {
  const alertConfig = {
    info: {
      icon: InfoIcon,
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-500/50',
      textColor: 'text-blue-400',
      iconColor: 'text-blue-400'
    },
    warning: {
      icon: AlertCircleIcon,
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-500/50',
      textColor: 'text-yellow-400',
      iconColor: 'text-yellow-400'
    },
    error: {
      icon: AlertCircleIcon,
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-500/50',
      textColor: 'text-red-400',
      iconColor: 'text-red-400'
    }
  };

  const config = alertConfig[type] || alertConfig.info;
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1">
          <p className={`text-sm ${config.textColor}`}>{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`text-sm ${config.textColor} hover:opacity-75`}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

// Form Security Check Component
export const FormSecurityCheck = ({ children, onSecurityViolation }) => {
  const handleFormSubmit = (e) => {
    // Check for suspicious activity
    const formData = new FormData(e.target);
    const entries = Object.fromEntries(formData.entries());
    
    // Basic security checks
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi
    ];

    for (const [key, value] of Object.entries(entries)) {
      if (typeof value === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            e.preventDefault();
            onSecurityViolation && onSecurityViolation(`Suspicious content detected in ${key}`);
            return false;
          }
        }
      }
    }

    return true;
  };

  return (
    <form onSubmit={handleFormSubmit}>
      {children}
    </form>
  );
};

// Profile Completeness Indicator
export const ProfileCompletenessIndicator = ({ profile }) => {
  const requiredFields = ['fullName', 'email'];
  const optionalFields = ['bio', 'profilePic', 'location', 'phone', 'website'];
  
  const completedRequired = requiredFields.filter(field => profile[field] && profile[field].trim()).length;
  const completedOptional = optionalFields.filter(field => profile[field] && profile[field].trim()).length;
  
  const totalRequired = requiredFields.length;
  const totalOptional = optionalFields.length;
  
  const completeness = ((completedRequired * 2 + completedOptional) / (totalRequired * 2 + totalOptional)) * 100;
  
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-slate-200 font-medium">Profile Completeness</h3>
        <span className="text-cyan-400 font-semibold">{Math.round(completeness)}%</span>
      </div>
      
      <div className="bg-slate-700 rounded-full h-2 mb-3">
        <div 
          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${completeness}%` }}
        />
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-slate-400">Required fields: </span>
          <span className={completedRequired === totalRequired ? 'text-green-400' : 'text-yellow-400'}>
            {completedRequired}/{totalRequired}
          </span>
        </div>
        <div>
          <span className="text-slate-400">Optional fields: </span>
          <span className="text-cyan-400">{completedOptional}/{totalOptional}</span>
        </div>
      </div>
      
      {completeness < 100 && (
        <div className="mt-3 text-xs text-slate-400">
          {completedRequired < totalRequired && "Complete required fields to improve your profile."}
          {completedRequired === totalRequired && completedOptional < totalOptional && "Add more details to make your profile stand out."}
        </div>
      )}
    </div>
  );
};

export default {
  validateEmail,
  validatePhone,
  validateWebsite,
  validatePassword,
  PasswordStrengthIndicator,
  ValidatedInput,
  SecurityAlert,
  FormSecurityCheck,
  ProfileCompletenessIndicator
};