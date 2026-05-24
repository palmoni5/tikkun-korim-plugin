// js/app.js

const AppState = {
    settings: {
        stamFont: 'Ashkenazi',
        nikudFont: 'Standard',
        stamFontSize: 28,
        nikudFontSize: 24,
        stamColor: '',
        nikudColor: '',
        hideStam: false,
        hideNikud: false,
        zoom: 100, // אחוזי זום של התצוגה (50-200)
        nusach: 'ashkenaz', // נוסח הפטרה: 'ashkenaz' / 'sephard'
        nusachLand: 'israel', // מנהג לקריאות חגים: 'israel' / 'diaspora'
        lineSpacing: 1.3 // מרווח בין שורות (1.0 - 2.4)
    }
};

function hexToRgba(hex, alpha) {
    if (!hex || typeof hex !== 'string') return `rgba(0, 0, 0, ${alpha})`;
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function applyTheme(themePayload) {
    if (!themePayload) return;
    const root = document.documentElement;

    if (themePayload.colorScheme) {
        const cs = themePayload.colorScheme;
        // משתני color-* לפי DESIGN_GUIDE של אוצריא
        if (cs.primary)   root.style.setProperty('--color-primary',   cs.primary);
        if (cs.onPrimary) root.style.setProperty('--color-on-primary', cs.onPrimary);
        if (cs.secondary)   root.style.setProperty('--color-secondary',   cs.secondary);
        if (cs.onSecondary) root.style.setProperty('--color-on-secondary', cs.onSecondary);
        if (cs.surface)   root.style.setProperty('--color-surface',   cs.surface);
        if (cs.onSurface) root.style.setProperty('--color-on-surface', cs.onSurface);
        if (cs.surfaceContainerHighest) {
            root.style.setProperty('--color-surface-container-highest', cs.surfaceContainerHighest);
        }
        if (cs.error)   root.style.setProperty('--color-error',   cs.error);
        if (cs.onError) root.style.setProperty('--color-on-error', cs.onError);
        if (cs.outline) root.style.setProperty('--color-outline', cs.outline);

        // גוונים עדינים עם שקיפות
        if (cs.primary) {
            root.style.setProperty('--color-primary-subtle', hexToRgba(cs.primary, 0.12));
        }
        if (cs.secondary) {
            root.style.setProperty('--color-secondary-subtle', hexToRgba(cs.secondary, 0.12));
        }

        document.body.classList.toggle('dark-mode', themePayload.mode === 'dark');
    }

    if (themePayload.typography) {
        const t = themePayload.typography;
        const root2 = document.documentElement;
        if (t.fontFamily) {
            root2.style.setProperty('--font-main', `'${t.fontFamily}', 'David', serif`);
        }
        if (t.fontSize) {
            root2.style.setProperty('--font-size-base', `${t.fontSize}px`);
        }
        if (t.lineHeight) {
            root2.style.setProperty('--line-height', String(t.lineHeight));
        }
    }
}

async function loadSettings() {
    try {
        const res = await window.Otzaria.call('storage.get', { key: 'tikkunSettings' });
        // לפי ה-SDK החדש, התשובה ארוזה באובייקט: { success, data, error }
        if (res.success && res.data) {
            AppState.settings = { ...AppState.settings, ...res.data };
        }
        applySettingsToUI();
    } catch (error) {
        console.error('Failed to load plugin settings:', error);
    }
}

function applySettingsToUI() {
    const root = document.documentElement;
    const { settings } = AppState;

    root.style.setProperty('--font-stam', `'${settings.stamFont}-Stam', serif`);
    root.style.setProperty('--font-nikud', `'${settings.nikudFont}-Nikud', serif`);
    root.style.setProperty('--stam-font-size', `${settings.stamFontSize}px`);
    root.style.setProperty('--nikud-font-size', `${settings.nikudFontSize}px`);
    root.style.setProperty('--line-spacing', String(settings.lineSpacing || 1.3));

    if (settings.stamColor) root.style.setProperty('--stam-font-color', settings.stamColor);
    if (settings.nikudColor) root.style.setProperty('--nikud-font-color', settings.nikudColor);

    document.body.classList.toggle('hide-stam-column', settings.hideStam);
    document.body.classList.toggle('hide-nikud-column', settings.hideNikud);

    // זום: לא משנה את חישוב השורות, רק את התצוגה.
    // נשתמש ב-CSS zoom (לא transform) - הוא משנה את הגדלים בפועל,
    // כך שכשהזום > 100% תופיע גלילה אופקית אוטומטית.
    const zoomEl = document.getElementById('reader-container');
    if (zoomEl) {
        const z = Math.max(50, Math.min(200, settings.zoom || 100));
        zoomEl.style.zoom = z / 100;
        // ניקוי שאריות transform מגרסה קודמת
        zoomEl.style.transform = '';
        zoomEl.style.transformOrigin = '';
    }
    // ודא שה-body מאפשר גלילה אופקית כשהתוכן רחב מהמסך
    document.body.style.overflowX = 'auto';
}

// === אירועי מחזור חיים מול ה-SDK של אוצריא ===
if (window.Otzaria) {
    window.Otzaria.on('plugin.boot', async (payload) => {
        console.log('Plugin Booting...', payload);
        
        if (payload.theme) {
            applyTheme(payload.theme);
        }
        
        // טעינת הגדרות מקומיות
        await loadSettings();
        
        // **רק עכשיו** מותר להתחיל לטעון את רשימת החומשים ולקרוא ל-API!
        if (typeof initNavigation === 'function') {
            initNavigation();
        }
    });

    window.Otzaria.on('theme.changed', (theme) => {
        applyTheme(theme);
    });
}