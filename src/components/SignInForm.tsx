import React, { useState } from 'react';
import { User } from '../types';
import './SignInForm.css';

interface SignInFormProps {
  onSignIn: (user: User) => void;
  language: string;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSignIn, language }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const translations = {
    en: {
      title: 'Welcome to ChatRizz',
      subtitle: 'Connect with friends and family',
      email: 'Email',
      password: 'Password',
      name: 'Full Name',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      toggleSignUp: "Don't have an account? Sign up",
      toggleSignIn: 'Already have an account? Sign in',
      errorRequired: 'This field is required',
      errorEmail: 'Please enter a valid email',
      errorPassword: 'Password must be at least 6 characters',
    },
    es: {
      title: 'Bienvenido a ChatRizz',
      subtitle: 'Conecta con amigos y familia',
      email: 'Correo electrónico',
      password: 'Contraseña',
      name: 'Nombre completo',
      signIn: 'Iniciar sesión',
      signUp: 'Registrarse',
      toggleSignUp: '¿No tienes cuenta? Regístrate',
      toggleSignIn: '¿Ya tienes cuenta? Inicia sesión',
      errorRequired: 'Este campo es obligatorio',
      errorEmail: 'Por favor ingresa un email válido',
      errorPassword: 'La contraseña debe tener al menos 6 caracteres',
    },
    fr: {
      title: 'Bienvenue sur ChatRizz',
      subtitle: 'Connectez-vous avec vos amis et votre famille',
      email: 'Email',
      password: 'Mot de passe',
      name: 'Nom complet',
      signIn: 'Se connecter',
      signUp: 'S\'inscrire',
      toggleSignUp: 'Pas de compte ? Inscrivez-vous',
      toggleSignIn: 'Vous avez déjà un compte ? Connectez-vous',
      errorRequired: 'Ce champ est obligatoire',
      errorEmail: 'Veuillez entrer un email valide',
      errorPassword: 'Le mot de passe doit contenir au moins 6 caractères',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = t.errorRequired;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.errorEmail;
    }

    if (!formData.password) {
      newErrors.password = t.errorRequired;
    } else if (formData.password.length < 6) {
      newErrors.password = t.errorPassword;
    }

    if (isSignUp && !formData.name) {
      newErrors.name = t.errorRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const user: User = {
        id: Date.now().toString(),
        email: formData.email,
        name: formData.name || formData.email.split('@')[0],
        language,
      };
      
      onSignIn(user);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="sign-in-form">
      <div className="sign-in-form__header">
        <h1 className="sign-in-form__title">{t.title}</h1>
        <p className="sign-in-form__subtitle">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="sign-in-form__form">
        {isSignUp && (
          <div className="sign-in-form__field">
            <label className="sign-in-form__label">{t.name}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`sign-in-form__input ${errors.name ? 'error' : ''}`}
              placeholder={t.name}
            />
            {errors.name && <span className="sign-in-form__error">{errors.name}</span>}
          </div>
        )}

        <div className="sign-in-form__field">
          <label className="sign-in-form__label">{t.email}</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`sign-in-form__input ${errors.email ? 'error' : ''}`}
            placeholder={t.email}
          />
          {errors.email && <span className="sign-in-form__error">{errors.email}</span>}
        </div>

        <div className="sign-in-form__field">
          <label className="sign-in-form__label">{t.password}</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`sign-in-form__input ${errors.password ? 'error' : ''}`}
            placeholder={t.password}
          />
          {errors.password && <span className="sign-in-form__error">{errors.password}</span>}
        </div>

        <button type="submit" className="sign-in-form__submit">
          {isSignUp ? t.signUp : t.signIn}
        </button>
      </form>

      <button
        className="sign-in-form__toggle"
        onClick={() => setIsSignUp(!isSignUp)}
      >
        {isSignUp ? t.toggleSignIn : t.toggleSignUp}
      </button>
    </div>
  );
};

export default SignInForm; 