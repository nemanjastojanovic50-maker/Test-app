import { useTheme } from '../hooks/useTheme'
import { useLanguage } from '../hooks/useLanguage'

export default function SettingsPanel({ onClose }) {
  const [theme, setTheme] = useTheme()
  const [lang, setLang, t] = useLanguage()

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 320,
        maxWidth: '90vw',
        background: 'var(--app-panel-bg)',
        color: 'var(--app-text)',
        borderLeft: '1px solid var(--app-border)',
        boxShadow: 'var(--app-shadow-strong)',
        zIndex: 1000,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{t('settings')}</h2>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 24,
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1,
            opacity: 0.7,
            color: 'inherit',
          }}
        >
          ×
        </button>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{t('theme')}</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setTheme('light')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: theme === 'light' ? '2px solid var(--app-primary)' : '1px solid var(--app-border)',
              background: theme === 'light' ? 'var(--app-primary)' : 'transparent',
              color: theme === 'light' ? '#fff' : 'var(--app-text)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            {t('light')}
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: theme === 'dark' ? '2px solid var(--app-primary)' : '1px solid var(--app-border)',
              background: theme === 'dark' ? 'var(--app-primary)' : 'transparent',
              color: theme === 'dark' ? '#fff' : 'var(--app-text)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            {t('dark')}
          </button>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{t('language')}</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setLang('en')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: lang === 'en' ? '2px solid var(--app-primary)' : '1px solid var(--app-border)',
              background: lang === 'en' ? 'var(--app-primary)' : 'transparent',
              color: lang === 'en' ? '#fff' : 'var(--app-text)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            {t('english')}
          </button>
          <button
            type="button"
            onClick={() => setLang('sr')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: lang === 'sr' ? '2px solid var(--app-primary)' : '1px solid var(--app-border)',
              background: lang === 'sr' ? 'var(--app-primary)' : 'transparent',
              color: lang === 'sr' ? '#fff' : 'var(--app-text)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            {t('serbian')}
          </button>
        </div>
      </div>
    </div>
  )
}
