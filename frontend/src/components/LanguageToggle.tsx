'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: 'ja' | 'en') => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white shadow-lg hover:shadow-xl transition-all border border-gray-200"
        aria-label="言語を選択 / Select language"
      >
        <Image
          src="/assets/logo/language.png"
          alt="Language"
          width={24}
          height={24}
          className="object-contain"
        />
        <span className="text-sm font-medium text-gray-700">
          {language === 'ja' ? '日本語' : 'English'}
        </span>
        <svg
          className={`w-4 h-4 text-gray-700 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => handleLanguageChange('ja')}
            className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
              language === 'ja' ? 'bg-gray-100 font-semibold text-black' : 'text-gray-700'
            }`}
          >
            日本語
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
              language === 'en' ? 'bg-gray-100 font-semibold text-black' : 'text-gray-700'
            }`}
          >
            English
          </button>
        </div>
      )}
    </div>
  );
}
