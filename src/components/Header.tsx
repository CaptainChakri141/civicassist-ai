import React from 'react';
import { 
  Sun, 
  Moon, 
  Eye, 
  Languages, 
  MessageSquare, 
  Search, 
  AlertTriangle, 
  FileText,
  Accessibility
} from 'lucide-react';

import type { AccessibilityTheme, FontSizeScale } from '../hooks/useAccessibility';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  theme: AccessibilityTheme;
  setTheme: (theme: AccessibilityTheme) => void;
  fontSize: FontSizeScale;
  setFontSize: (size: FontSizeScale) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

const headerTranslations: Record<string, Record<string, string>> = {
  en: {
    title: 'CivicAssist AI',
    companion: 'AI Companion',
    services: 'Services & Eligibility',
    report: 'Report Public Issue',
    simplifier: 'Policy Simplifier',
    theme: 'Theme',
    fontSize: 'Font Size',
    lang: 'Language',
    a11ySettings: 'Accessibility Settings',
    logoAlt: 'CivicAssist Shield Logo'
  },
  es: {
    title: 'CivicAssist AI',
    companion: 'Compañero IA',
    services: 'Servicios y Elegibilidad',
    report: 'Reportar Incidencia',
    simplifier: 'Simplificador de Políticas',
    theme: 'Tema',
    fontSize: 'Tamaño de Fuente',
    lang: 'Idioma',
    a11ySettings: 'Ajustes de Accesibilidad',
    logoAlt: 'Escudo CivicAssist'
  },
  fr: {
    title: 'CivicAssist AI',
    companion: 'Compagnon IA',
    services: 'Services & Éligibilité',
    report: 'Signaler un problème',
    simplifier: 'Simplificateur de Directives',
    theme: 'Thème',
    fontSize: 'Taille de Police',
    lang: 'Langue',
    a11ySettings: 'Paramètres d\'accessibilité',
    logoAlt: 'Logo Bouclier CivicAssist'
  },
  hi: {
    title: 'नागरिक सहायता एआई',
    companion: 'एआई साथी',
    services: 'सेवाएं और पात्रता',
    report: 'जन शिकायत दर्ज करें',
    simplifier: 'नीति सरलीकरण',
    theme: 'थीम',
    fontSize: 'फ़ॉन्ट आकार',
    lang: 'भाषा',
    a11ySettings: 'एक्सेसिबिलिटी सेटिंग्स',
    logoAlt: 'नागरिक सहायता प्रतीक'
  }
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  theme,
  setTheme,
  fontSize,
  setFontSize,
  language,
  setLanguage
}) => {
  const t = headerTranslations[language] || headerTranslations.en;

  const themes: { value: AccessibilityTheme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun size={16} /> },
    { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
    { value: 'contrast', label: 'Contrast', icon: <Eye size={16} /> }
  ];

  const fontSizes: { value: FontSizeScale; label: string }[] = [
    { value: 'sm', label: 'A-' },
    { value: 'md', label: 'A' },
    { value: 'lg', label: 'A+' },
    { value: 'xl', label: 'A++' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'hi', label: 'हिन्दी' }
  ];

  return (
    <header className="site-header" role="banner">
      <div className="header-container">
        {/* Brand Logo and Title */}
        <div className="brand-wrapper">
          <div className="brand-logo" aria-hidden="true">
            <Accessibility size={28} className="logo-icon" />
          </div>
          <h1 className="brand-title">{t.title}</h1>
        </div>

        {/* Accessibility Toolbox */}
        <div className="a11y-toolbox" aria-label={t.a11ySettings}>
          {/* Theme Selector */}
          <div className="toolbox-group" role="group" aria-label={t.theme}>
            {themes.map((th) => (
              <button
                key={th.value}
                className={`toolbox-btn ${theme === th.value ? 'active' : ''}`}
                onClick={() => setTheme(th.value)}
                aria-pressed={theme === th.value}
                title={`${t.theme}: ${th.value}`}
              >
                {th.icon}
                <span className="sr-only">{th.label} {t.theme}</span>
              </button>
            ))}
          </div>

          {/* Font Size Scaling Selector */}
          <div className="toolbox-group" role="group" aria-label={t.fontSize}>
            {fontSizes.map((f) => (
              <button
                key={f.value}
                className={`toolbox-btn text-scale-btn ${fontSize === f.value ? 'active' : ''}`}
                onClick={() => setFontSize(f.value)}
                aria-pressed={fontSize === f.value}
                title={`${t.fontSize}: ${f.value}`}
              >
                <span className="font-size-indicator">{f.label}</span>
                <span className="sr-only">{t.fontSize} {f.value}</span>
              </button>
            ))}
          </div>

          {/* Language Selector */}
          <div className="toolbox-dropdown-wrapper">
            <Languages size={16} className="dropdown-icon" aria-hidden="true" />
            <select
              className="toolbox-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label={t.lang}
            >
              {languages.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <nav className="site-nav" role="navigation" aria-label="Main Navigation">
        <ul className="nav-list">
          <li>
            <button
              className={`nav-link ${currentTab === 'chat' ? 'active' : ''}`}
              onClick={() => setCurrentTab('chat')}
              aria-current={currentTab === 'chat' ? 'page' : undefined}
            >
              <MessageSquare size={18} className="nav-icon" aria-hidden="true" />
              <span>{t.companion}</span>
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentTab === 'services' ? 'active' : ''}`}
              onClick={() => setCurrentTab('services')}
              aria-current={currentTab === 'services' ? 'page' : undefined}
            >
              <Search size={18} className="nav-icon" aria-hidden="true" />
              <span>{t.services}</span>
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentTab === 'report' ? 'active' : ''}`}
              onClick={() => setCurrentTab('report')}
              aria-current={currentTab === 'report' ? 'page' : undefined}
            >
              <AlertTriangle size={18} className="nav-icon" aria-hidden="true" />
              <span>{t.report}</span>
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentTab === 'simplifier' ? 'active' : ''}`}
              onClick={() => setCurrentTab('simplifier')}
              aria-current={currentTab === 'simplifier' ? 'page' : undefined}
            >
              <FileText size={18} className="nav-icon" aria-hidden="true" />
              <span>{t.simplifier}</span>
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};
