import React, { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme>('system');

  // Effet pour initialiser le thème au chargement
  useEffect(() => {
    // Récupérer le thème depuis le localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    
    if (savedTheme) {
      // Si un thème est sauvegardé, l'utiliser
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Sinon, utiliser le thème système par défaut
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme('system');
      applyTheme('system');
      localStorage.setItem('theme', 'system');
    }
  }, []);

  // Effet pour gérer les changements de thème système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Fonction pour appliquer le thème
  const applyTheme = (newTheme: Theme) => {
    document.documentElement.classList.remove('dark');

    if (newTheme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    } else if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-medium text-text">Thème</h3>
      <div className="flex gap-2 p-1 bg-surface rounded-xl">
        <button
          onClick={() => handleThemeChange('light')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            theme === 'light'
              ? 'bg-background text-primary shadow-sm'
              : 'text-text-light hover:bg-surface-hover'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="text-sm">Clair</span>
        </button>
        <button
          onClick={() => handleThemeChange('dark')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            theme === 'dark'
              ? 'bg-background text-primary shadow-sm'
              : 'text-text-light hover:bg-surface-hover'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <span className="text-sm">Sombre</span>
        </button>
        <button
          onClick={() => handleThemeChange('system')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            theme === 'system'
              ? 'bg-background text-primary shadow-sm'
              : 'text-text-light hover:bg-surface-hover'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-sm">Système</span>
        </button>
      </div>
    </div>
  );
} 