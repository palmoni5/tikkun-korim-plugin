// js/settings.js

document.addEventListener('DOMContentLoaded', () => {
    const dialog = document.getElementById('settings-dialog');
    const btnSettings = document.getElementById('btn-settings');
    const btnClose = document.getElementById('btn-close-settings');

    // פתיחה/סגירה של הדיאלוג (toggle - לחיצה חוזרת סוגרת)
    btnSettings.addEventListener('click', () => {
        if (dialog.open) {
            dialog.close();
        } else {
            syncUIToState();
            dialog.showModal();
        }
    });
    btnClose.addEventListener('click', () => dialog.close());

    // סגירה בלחיצה מחוץ לדיאלוג (על ה-backdrop)
    dialog.addEventListener('click', (e) => {
        // לחיצה על ה-dialog עצמו (לא על תוכן פנימי) = לחיצה על ה-backdrop
        const rect = dialog.getBoundingClientRect();
        const inside = (
            e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom
        );
        if (!inside) {
            dialog.close();
        }
    });

    // מיפוי האלמנטים בדיאלוג
    const inputs = {
        stamFont: document.getElementById('setting-stam-font'),
        nikudFont: document.getElementById('setting-nikud-font'),
        stamFontSize: document.getElementById('setting-stam-size'),
        nikudFontSize: document.getElementById('setting-nikud-size'),
        hideStam: document.getElementById('setting-hide-stam'),
        hideNikud: document.getElementById('setting-hide-nikud'),
        zoom: document.getElementById('setting-zoom'),
        nusach: document.getElementById('setting-nusach'),
        nusachLand: document.getElementById('setting-nusach-land'),
        lineSpacing: document.getElementById('setting-line-spacing')
    };

    // פונקציה שמסנכרנת את ערכי ה-DOM מה-State
    function syncUIToState() {
        inputs.stamFont.value = AppState.settings.stamFont;
        inputs.nikudFont.value = AppState.settings.nikudFont;
        inputs.stamFontSize.value = AppState.settings.stamFontSize;
        inputs.nikudFontSize.value = AppState.settings.nikudFontSize;
        inputs.hideStam.checked = AppState.settings.hideStam;
        inputs.hideNikud.checked = AppState.settings.hideNikud;
        if (inputs.zoom) inputs.zoom.value = AppState.settings.zoom || 100;
        if (inputs.nusach) inputs.nusach.value = AppState.settings.nusach || 'ashkenaz';
        if (inputs.nusachLand) inputs.nusachLand.value = AppState.settings.nusachLand || 'israel';
        if (inputs.lineSpacing) inputs.lineSpacing.value = AppState.settings.lineSpacing || 1.3;

        document.getElementById('stam-size-val').innerText = AppState.settings.stamFontSize;
        document.getElementById('nikud-size-val').innerText = AppState.settings.nikudFontSize;
        const zoomVal = document.getElementById('zoom-val');
        if (zoomVal) zoomVal.innerText = AppState.settings.zoom || 100;
        const lineSpacingVal = document.getElementById('line-spacing-val');
        if (lineSpacingVal) lineSpacingVal.innerText = AppState.settings.lineSpacing || 1.3;
    }

    // פונקציה לעדכון ושמירה ברגע שיש שינוי באחד האלמנטים
    function handleSettingChange(key, value) {
        AppState.settings[key] = value;
        applySettingsToUI(); // מתוך app.js - מחיל את ה-CSS
        saveSettingsToStorage();
    }

    // הוספת מאזינים
    inputs.stamFont.addEventListener('change', (e) => handleSettingChange('stamFont', e.target.value));
    inputs.nikudFont.addEventListener('change', (e) => handleSettingChange('nikudFont', e.target.value));
    
    inputs.stamFontSize.addEventListener('input', (e) => {
        document.getElementById('stam-size-val').innerText = e.target.value;
        handleSettingChange('stamFontSize', parseInt(e.target.value));
    });
    
    inputs.nikudFontSize.addEventListener('input', (e) => {
        document.getElementById('nikud-size-val').innerText = e.target.value;
        handleSettingChange('nikudFontSize', parseInt(e.target.value));
    });

    inputs.hideStam.addEventListener('change', (e) => handleSettingChange('hideStam', e.target.checked));
    inputs.hideNikud.addEventListener('change', (e) => handleSettingChange('hideNikud', e.target.checked));
    if (inputs.zoom) {
        inputs.zoom.addEventListener('input', (e) => {
            const v = parseInt(e.target.value);
            document.getElementById('zoom-val').innerText = v;
            handleSettingChange('zoom', v);
        });
    }
    if (inputs.nusach) {
        inputs.nusach.addEventListener('change', (e) => {
            AppState.settings.nusach = e.target.value;
            saveSettingsToStorage();
            // אם כעת מציגים הפטרה - טען מחדש בנוסח החדש
            if (currentNavState && currentNavState.section === 'haftarot' && typeof loadAndDisplayHaftarah === 'function') {
                loadAndDisplayHaftarah();
            }
        });
    }
    if (inputs.nusachLand) {
        inputs.nusachLand.addEventListener('change', (e) => {
            AppState.settings.nusachLand = e.target.value;
            saveSettingsToStorage();
            // אם כעת מציגים קריאת חג - סינון הרשימה מחדש
            if (currentNavState && currentNavState.section === 'torah_readings' && typeof populateTorahReadingSelect === 'function') {
                populateTorahReadingSelect();
                // אם הקריאה הנוכחית לא קיימת במנהג החדש - לטעון את הראשונה
                const list = (window.TORAH_READINGS_LIST || []).filter(r =>
                    r.land === 'both' || r.land === AppState.settings.nusachLand);
                const stillExists = list.some(r => r.id === currentNavState.torahReadingId);
                if (!stillExists && list.length > 0) {
                    currentNavState.torahReadingId = list[0].id;
                    document.getElementById('select-torah-reading').value = list[0].id;
                    loadAndDisplayTorahReading();
                }
            }
        });
    }
    if (inputs.lineSpacing) {
        inputs.lineSpacing.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            document.getElementById('line-spacing-val').innerText = v.toFixed(1);
            handleSettingChange('lineSpacing', v);
        });
    }
});

// שמירת ההגדרות ב-Storage המקומי של אוצריא
function saveSettingsToStorage() {
    if (window.Otzaria) {
        window.Otzaria.call('storage.set', { 
            key: 'tikkunSettings', 
            value: AppState.settings 
        }).catch(err => console.error("Error saving settings:", err));
    }
}