import React from 'react';

export default function LanguageSwitcher({ locale, setLocale }) {
  return (
    <div className="lang-switcher-pill">
      <button 
        className={`lang-btn ${locale === 'fr' ? 'active' : ''}`} 
        onClick={() => setLocale('fr')}
      >
        FR
      </button>
      <span className="lang-divider">·</span>
      <button 
        className={`lang-btn ${locale === 'en' ? 'active' : ''}`} 
        onClick={() => setLocale('en')}
      >
        EN
      </button>
    </div>
  );
}