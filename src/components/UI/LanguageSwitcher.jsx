import React from 'react';
import { useTranslation } from 'react-i18next';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-3">
      <GlobeAltIcon className="w-4 h-4 text-gray-500" />
      <div className="flex bg-gray-100 rounded-lg p-0.5">
        <button
          onClick={() => changeLanguage('en')}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
            i18n.language === 'en'
              ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-200'
              : 'text-gray-600 hover:text-gray-800 hover:bg-white'
          }`}
        >
          English
        </button>
        <button
          onClick={() => changeLanguage('km')}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
            i18n.language === 'km'
              ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-200'
              : 'text-gray-600 hover:text-gray-800 hover:bg-white'
          }`}
        >
          ភាសាខ្មែរ
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;