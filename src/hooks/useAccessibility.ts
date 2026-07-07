import { useState, useEffect } from 'react';

export type AccessibilityTheme = 'light' | 'dark' | 'contrast';
export type FontSizeScale = 'sm' | 'md' | 'lg' | 'xl';

export function useAccessibility() {
  const [theme, setTheme] = useState<AccessibilityTheme>(() => {
    const saved = localStorage.getItem('civic-theme');
    return (saved as AccessibilityTheme) || 'light';
  });

  const [fontSize, setFontSize] = useState<FontSizeScale>(() => {
    const saved = localStorage.getItem('civic-font-size');
    return (saved as FontSizeScale) || 'md';
  });

  // Apply theme classes to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-contrast');
    root.classList.add(`theme-${theme}`);
    localStorage.setItem('civic-theme', theme);
  }, [theme]);

  // Apply font size scales to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg', 'font-size-xl');
    root.classList.add(`font-size-${fontSize}`);
    localStorage.setItem('civic-font-size', fontSize);
  }, [fontSize]);

  /**
   * Helper to announce custom notifications to screen readers using dynamic aria-live
   */
  const announceToScreenReader = (message: string) => {
    const announcerId = 'sr-announcer';
    let announcer = document.getElementById(announcerId);

    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = announcerId;
      announcer.style.position = 'absolute';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.padding = '0';
      announcer.style.margin = '-1px';
      announcer.style.overflow = 'hidden';
      announcer.style.clip = 'rect(0, 0, 0, 0)';
      announcer.style.border = '0';
      announcer.setAttribute('aria-live', 'assertive');
      announcer.setAttribute('aria-atomic', 'true');
      document.body.appendChild(announcer);
    }

    announcer.textContent = '';
    // Use timeout to ensure screen reader registers the text modification
    setTimeout(() => {
      if (announcer) announcer.textContent = message;
    }, 100);
  };

  return {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    announceToScreenReader
  };
}
