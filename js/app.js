// js/app.js

// טעינת גופני הסת"ם/ניקוד המקומיים דרך FontFace API במקום @font-face ב-CSS.
// (סורק העיצוב של אוצריא חוסם font-family שאינו var(--font-*); @font-face מחייב
//  שם מילולי, ולכן טוענים כאן.) אם הטעינה נכשלת — ה-CSS נופל חזרה לגופני הגיבוי.
(function loadLocalFonts() {
    if (typeof FontFace === 'undefined' || !document.fonts) return;
    const FONTS = [
        ['Ashkenazi-Stam', 'fonts/Ashkenazi-Stam.ttf'],
        ['Sefardi-Stam',   'fonts/Sefardi-Stam.ttf'],
        ['Klasi-Stam',     'fonts/Klasi-Stam.ttf'],
        ['Standard-Nikud', 'fonts/Standard-Nikud.ttf'],
    ];
    for (const [family, url] of FONTS) {
        try {
            const ff = new FontFace(family, `url('${url}') format('truetype')`, { style: 'normal', weight: 'normal' });
            ff.load().then(loaded => document.fonts.add(loaded)).catch(() => {});
        } catch (e) { /* גיבוי ב-CSS יטפל */ }
    }
})();

const AppState = {
    settings: {
        stamFont: 'Klasi',
        nikudFont: 'Standard',
        stamFontSize: 25,
        nikudFontSize: 25,
        stamColor: '',
        nikudColor: '',
        hideStam: false,
        hideNikud: false,
        zoom: 100,
        nusach: 'ashkenaz',
        nusachLand: 'israel',
        lineSpacing: 1.3,
        swapColumns: false,    // false=סת"ם בימין, ניקוד בשמאל; true=הפוך
        hideRowBorders: false, // הסתרת קווי הפרדה בין שורות
        hideDivineName: false, // הסתרת שם השם (יהוה -> יקוק)
        centerSingleColumn: false, // כשטור אחד מוסתר - למרכז את הטור הגלוי (הגדרה נסתרת)
        startupMode: 'parasha' // 'parasha' | 'lastPosition'
    }
};

// מצב זמני (לא נשמר): האם כרגע מציגים את "הטור השני" (המוסתר) במקום הגלוי,
// באמצעות לחצן ההחלפה המהירה שבסרגל הניווט.
let _peekSecondColumn = false;

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

    // גופן: System:Name -> שם של גופן מערכת. אחרת -> -Stam / -Nikud (גופן מקומי).
    const resolveFont = (name, suffix) => {
        if (typeof name !== 'string') return `'${name}${suffix}', serif`;
        if (name.startsWith('System:')) {
            const fam = name.slice(7);
            return `'${fam}', 'David', serif`;
        }
        return `'${name}${suffix}', serif`;
    };
    root.style.setProperty('--font-stam', resolveFont(settings.stamFont, '-Stam'));
    root.style.setProperty('--font-nikud', resolveFont(settings.nikudFont, '-Nikud'));
    // גדלי הגופן המוצגים נקבעים ב-applyResponsiveFontScale (תלוי ברוחב החלון).
    // הם נכתבים כערך px מפורש - לא calc() - כדי שאוצריא תכבד אותם.
    root.style.setProperty('--line-spacing', String(settings.lineSpacing || 1.3));

    if (settings.stamColor) root.style.setProperty('--stam-font-color', settings.stamColor);
    if (settings.nikudColor) root.style.setProperty('--nikud-font-color', settings.nikudColor);

    applyColumnView();
    document.body.classList.toggle('swap-columns', !!settings.swapColumns);
    document.body.classList.toggle('hide-row-borders', !!settings.hideRowBorders);

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

    // התאמת גודל הגופן המוצג לרוחב החלון
    applyResponsiveFontScale();
}

// === ניהול תצוגת הטורים (הסתרה / החלפה מהירה / מירכוז) ===
// מחשב איזה טור מוסתר *בפועל* מתוך ההגדרות ומצב ההחלפה הזמני (_peekSecondColumn),
// ומחיל את ה-classes על ה-body. כן מעדכן את לחצן ההחלפה המהירה שבסרגל הניווט.
function applyColumnView() {
    const s = AppState.settings;

    let hideStam = !!s.hideStam;
    let hideNikud = !!s.hideNikud;
    // "טור יחיד" = בדיוק אחד מהטורים מוסתר. רק אז רלוונטיים ההחלפה והמירכוז.
    const singleHidden = (hideStam !== hideNikud);

    // אם אין מצב טור-יחיד - מאפסים את ההצצה הזמנית.
    if (!singleHidden) _peekSecondColumn = false;

    // הצצה: מחליפה איזה טור מוסתר בפועל (מציגה את הטור השני).
    if (_peekSecondColumn && singleHidden) {
        const t = hideStam; hideStam = hideNikud; hideNikud = t;
    }

    document.body.classList.toggle('hide-stam-column', hideStam);
    document.body.classList.toggle('hide-nikud-column', hideNikud);
    document.body.classList.toggle('col-centered', singleHidden && !!s.centerSingleColumn);
    document.body.classList.toggle('peek-active', _peekSecondColumn && singleHidden);

    // עדכון לחצן ההחלפה המהירה: מוצג רק במצב טור-יחיד.
    const swapBtn = document.getElementById('btn-swap-col');
    if (swapBtn) {
        swapBtn.style.display = singleHidden ? '' : 'none';
        swapBtn.classList.toggle('peek-on', _peekSecondColumn);
        swapBtn.textContent = _peekSecondColumn ? 'חזור לטור הראשי' : 'הצג טור שני';
    }
}

// החלפה מהירה בין הטור הגלוי לטור המוסתר (הצצה זמנית, לא נשמר).
function toggleSecondColumn() {
    _peekSecondColumn = !_peekSecondColumn;
    applyColumnView();
}

// === התאמת גודל גופן מוצג לרוחב החלון ===
// גדלי הגופן בהגדרות מכוונים לרוחב העמוד המלא (reader-page, max-width ~1250px).
// כאשר חלון המשתמש צר מרוחב הייחוס, מקטינים את הגופן *המוצג* באופן יחסי כך
// שהשורות (שאורכן קבוע ב~36 תווים) ימשיכו להיכנס לרוחב הזמין - בלי לשנות את
// הערכים השמורים בהגדרות. מעל רוחב הייחוס העמוד תחום ב-max-width, ולכן הגופן
// אינו גדל מעבר לגודל שבהגדרות (cap ב-1).
function computeFontScale() {
    // רוחב הייחוס שאליו מכוונים גדלי הגופן (max-width של reader-page).
    const REFERENCE_WIDTH = 1250;
    // ריווחים אופקיים: reader-wrapper (1em*2) + reader-page (0.75em*2) ≈ 56px.
    const HORIZONTAL_PADDING = 56;
    const winWidth = window.innerWidth || REFERENCE_WIDTH;
    const available = winWidth - HORIZONTAL_PADDING;
    const reference = REFERENCE_WIDTH - HORIZONTAL_PADDING;
    // מקדם ביטחון: מקטינים מעט יותר מהיחס המדויק, כי רוחב המילים בפועל משתנה
    // (אותיות רחבות, טעמים) ולעיתים יש חריגה קלה מהשורה. 0.95 מותיר מרווח.
    const SAFETY = 0.95;
    let scale = (available / reference) * SAFETY;
    // לא מגדילים מעבר ל-100% (העמוד תחום ב-max-width), ולא מקטינים מתחת ל-45%.
    return Math.max(0.45, Math.min(1, scale));
}

function applyResponsiveFontScale() {
    const root = document.documentElement;
    const { settings } = AppState;
    const scale = computeFontScale();
    // כותבים ערך px מפורש (לא calc) כדי שאוצריא תכבד את הגודל.
    root.style.setProperty('--stam-font-size', `${(settings.stamFontSize * scale).toFixed(2)}px`);
    root.style.setProperty('--nikud-font-size', `${(settings.nikudFontSize * scale).toFixed(2)}px`);
    // גופן הבסיס של השורה (כאחוז) - מקטין יחד את הרווחים בין השורות, גובה
    // השורה והמסמנים, באותו יחס כמו הגופן.
    root.style.setProperty('--row-font-scale', `${(scale * 100).toFixed(1)}%`);
}

// עדכון קנה המידה בכל שינוי גודל חלון (עם debounce קל למניעת חישוב יתר).
if (typeof window !== 'undefined') {
    let _fontScaleTimer = null;
    window.addEventListener('resize', () => {
        if (_fontScaleTimer) clearTimeout(_fontScaleTimer);
        _fontScaleTimer = setTimeout(applyResponsiveFontScale, 100);
    });
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

        // שחזור מיקום הניווט השמור (לפני initNavigation כדי שהסלקטים ייאתחלו נכון)
        if (typeof loadNavState === 'function') {
            await loadNavState();
        }

        // פתיחה בפרשת השבוע הקרובה (אם נתמך ע"י גרסת אוצריא ומוגדר בהגדרות)
        console.log('[tikkun] startupMode:', AppState.settings.startupMode);
        if (AppState.settings.startupMode !== 'lastPosition' && typeof resolveParashaFromOtzaria === 'function') {
            try {
                const calData = await window.Otzaria.call('calendar.getJewishDate', {});
                console.log('[tikkun] calendar.getJewishDate response:', JSON.stringify(calData));
                const jewishDate = calData?.success ? calData.data : null;
                const parashaRaw = jewishDate?.parasha;
                if (typeof parashaRaw === 'string' && parashaRaw.trim()) {
                    console.log('[tikkun] parasha from API:', parashaRaw);
                    const resolved = resolveParashaFromOtzaria(parashaRaw);
                    console.log('[tikkun] resolved parasha:', JSON.stringify(resolved));
                    if (resolved) {
                        currentNavState.section = 'torah';
                        currentNavState.bookId = resolved.bookId;
                        currentNavState.parashaName = resolved.parashaName;
                        currentNavState.currentColumnIndex = 0;
                        console.log('[tikkun] navigating to parasha:', resolved.parashaName, 'in', resolved.bookId);
                    } else {
                        console.warn('[tikkun] could not resolve parasha name:', parashaRaw);
                    }
                } else {
                    console.warn('[tikkun] parasha field missing or empty. parashaRaw =', parashaRaw);
                }
            } catch (e) {
                console.warn('[tikkun] Could not fetch parasha from calendar:', e);
            }
        }

        // **רק עכשיו** מותר להתחיל לטעון את רשימת החומשים ולקרוא ל-API!
        if (typeof initNavigation === 'function') {
            initNavigation();
        }

        // לסקציות שאינן תורה: initNavigation תמיד מפעיל Torah.
        // צריך להפעיל ידנית את תוכן הסקציה המשוחזרת.
        const sect = (typeof currentNavState !== 'undefined') ? currentNavState.section : 'torah';
        if (sect === 'haftarot' && typeof loadAndDisplayHaftarah === 'function') {
            loadAndDisplayHaftarah();
        } else if (sect === 'torah_readings' && typeof loadAndDisplayTorahReading === 'function') {
            loadAndDisplayTorahReading();
        } else if ((sect === 'neviim' || sect === 'ketuvim') && typeof loadAndDisplayTanachBook === 'function') {
            loadAndDisplayTanachBook();
        }
    });

    window.Otzaria.on('theme.changed', (theme) => {
        applyTheme(theme);
    });
}