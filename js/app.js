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
        zoom: 100 // אחוזי זום של התצוגה (50-200)
    }
};

function applyTheme(themePayload) {
    if (!themePayload) return;
    const root = document.documentElement;
    
    if (themePayload.colorScheme) {
        for (const [key, value] of Object.entries(themePayload.colorScheme)) {
            const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
            root.style.setProperty(`--md-sys-color-${cssKey}`, value);
        }
        // צביעת הרקע הראשי והטקסט בצבעי הערכת נושא
        document.body.style.backgroundColor = themePayload.colorScheme.surface;
        document.body.style.color = themePayload.colorScheme.onSurface;
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

    root.style.setProperty('--stam-font-family', `'${settings.stamFont}-Stam', sans-serif`);
    root.style.setProperty('--nikud-font-family', `'${settings.nikudFont}-Nikud', sans-serif`);
    root.style.setProperty('--stam-font-size', `${settings.stamFontSize}px`);
    root.style.setProperty('--nikud-font-size', `${settings.nikudFontSize}px`);

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