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

    // מיפוי האלמנטים בדיאלוג
    const inputs = {
        stamFont: document.getElementById('setting-stam-font'),
        nikudFont: document.getElementById('setting-nikud-font'),
        stamFontSize: document.getElementById('setting-stam-size'),
        nikudFontSize: document.getElementById('setting-nikud-size'),
        hideStam: document.getElementById('setting-hide-stam'),
        hideNikud: document.getElementById('setting-hide-nikud'),
        zoom: document.getElementById('setting-zoom')
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

        document.getElementById('stam-size-val').innerText = AppState.settings.stamFontSize;
        document.getElementById('nikud-size-val').innerText = AppState.settings.nikudFontSize;
        const zoomVal = document.getElementById('zoom-val');
        if (zoomVal) zoomVal.innerText = AppState.settings.zoom || 100;
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