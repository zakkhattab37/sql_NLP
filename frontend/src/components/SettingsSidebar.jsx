import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SettingsSidebar({ isDark, toggleTheme, toggleLanguage }) {
  const { t, i18n } = useTranslation();

  return (
    <aside className="sidebar glass-panel">
      <div style={{ fontWeight: 600, marginBottom: "1.5rem", fontSize: 18, background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        {t('settings') || "Settings"}
      </div>
      
      <button className="glass-btn" onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start' }}>
        <span style={{ fontSize: '18px' }}>{isDark ? '☀️' : '🌙'}</span> 
        {t('theme_toggle', { defaultValue: 'Toggle Theme' })}
      </button>

      <button className="glass-btn" onClick={toggleLanguage} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start' }}>
        <span style={{ fontSize: '18px' }}>🌐</span> 
        {i18n.language === 'en' ? t('switch_ar', { defaultValue: 'عربي' }) : t('switch_en', { defaultValue: 'English' })}
      </button>
    </aside>
  );
}
