// js/settings.js

document.addEventListener('DOMContentLoaded', () => {
    const dialog = document.getElementById('settings-dialog');
    const btnSettings = document.getElementById('btn-settings');
    const btnClose = document.getElementById('btn-close-settings');

    // פתיחה וסגירה של הדיאלוג
    btnSettings.addEventListener('click', () => {
        syncUIToState(); // עדכון ה-UI למצב השמור לפני הפתיחה
        dialog.showModal();
    });
    btnClose.addEventListener('click', () => dialog.close());

    // מיפוי האלמנטים בדיאלוג
    const inputs = {
        stamFont: document.getElementById('setting-stam-font'),
        nikudFont: document.getElementById('setting-nikud-font'),
        stamFontSize: document.getElementById('setting-stam-size'),
        nikudFontSize: document.getElementById('setting-nikud-size'),
        hideStam: document.getElementById('setting-hide-stam'),
        hideNikud: document.getElementById('setting-hide-nikud')
    };

    // פונקציה שמסנכרנת את ערכי ה-DOM מה-State
    function syncUIToState() {
        inputs.stamFont.value = AppState.settings.stamFont;
        inputs.nikudFont.value = AppState.settings.nikudFont;
        inputs.stamFontSize.value = AppState.settings.stamFontSize;
        inputs.nikudFontSize.value = AppState.settings.nikudFontSize;
        inputs.hideStam.checked = AppState.settings.hideStam;
        inputs.hideNikud.checked = AppState.settings.hideNikud;
        
        document.getElementById('stam-size-val').innerText = AppState.settings.stamFontSize;
        document.getElementById('nikud-size-val').innerText = AppState.settings.nikudFontSize;
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