import React, { useState } from 'react';
import { User } from '../types';
import LanguagePicker from './LanguagePicker';
import SignInForm from './SignInForm';
import './LandingPage.css';

interface LandingPageProps {
  onSignIn: (user: User) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSignIn }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  return (
    <div className="landing-page">
      <div className="landing-page__background">
        <div className="landing-page__gradient"></div>
        <div className="landing-page__shapes">
          <div className="landing-page__shape landing-page__shape--1"></div>
          <div className="landing-page__shape landing-page__shape--2"></div>
          <div className="landing-page__shape landing-page__shape--3"></div>
        </div>
      </div>

      <div className="landing-page__header">
        <div className="landing-page__logo">
          <span className="landing-page__logo-icon">💬</span>
          <span className="landing-page__logo-text">ChatRizz</span>
        </div>
        <LanguagePicker
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
      </div>

      <div className="landing-page__content">
        <div className="landing-page__hero">
          <h1 className="landing-page__hero-title">
            {selectedLanguage === 'en' && 'Connect with the world'}
            {selectedLanguage === 'es' && 'Conecta con el mundo'}
            {selectedLanguage === 'fr' && 'Connectez-vous avec le monde'}
            {!['en', 'es', 'fr'].includes(selectedLanguage) && 'Connect with the world'}
          </h1>
          <p className="landing-page__hero-subtitle">
            {selectedLanguage === 'en' && 'Experience seamless communication with our modern chat platform'}
            {selectedLanguage === 'es' && 'Experimenta una comunicación fluida con nuestra plataforma de chat moderna'}
            {selectedLanguage === 'fr' && 'Découvrez une communication fluide avec notre plateforme de chat moderne'}
            {!['en', 'es', 'fr'].includes(selectedLanguage) && 'Experience seamless communication with our modern chat platform'}
          </p>
        </div>

        <SignInForm onSignIn={onSignIn} language={selectedLanguage} />
      </div>

      <div className="landing-page__footer">
        <p className="landing-page__footer-text">
          {selectedLanguage === 'en' && '© 2024 ChatRizz. All rights reserved.'}
          {selectedLanguage === 'es' && '© 2024 ChatRizz. Todos los derechos reservados.'}
          {selectedLanguage === 'fr' && '© 2024 ChatRizz. Tous droits réservés.'}
          {!['en', 'es', 'fr'].includes(selectedLanguage) && '© 2024 ChatRizz. All rights reserved.'}
        </p>
      </div>
    </div>
  );
};

export default LandingPage; 