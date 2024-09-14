import React from 'react';

function LanguageSelector({ selectedLanguage, onLanguageChange }) {
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    // Add more languages as needed
  ];

  return (
    <select value={selectedLanguage} onChange={(e) => onLanguageChange(e.target.value)}>
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>{lang.name}</option>
      ))}
    </select>
  );
}

export default LanguageSelector;