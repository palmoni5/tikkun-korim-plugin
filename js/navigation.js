// js/navigation.js

const TORAH_STRUCTURE = {
    "bereshit": { name: "בראשית", parashot: ["בראשית", "נח", "לך לך", "וירא", "חיי שרה", "תולדות", "ויצא", "וישלח", "וישב", "מקץ", "ויגש", "ויחי"] },
    "shemot": { name: "שמות", parashot: ["שמות", "וארא", "בא", "בשלח", "יתרו", "משפטים", "תרומה", "תצוה", "כי תשא", "ויקהל", "פקודי"] },
    "vayikra": { name: "ויקרא", parashot: ["ויקרא", "צו", "שמיני", "תזריע", "מצורע", "אחרי מות", "קדושים", "אמור", "בהר", "בחוקותי"] },
    "bamidbar": { name: "במדבר", parashot: ["במדבר", "נשא", "בהעלותך", "שלח לך", "קרח", "חקת", "בלק", "פנחס", "מטות", "מסעי"] },
    "devarim": { name: "דברים", parashot: ["דברים", "ואתחנן", "עקב", "ראה", "שופטים", "כי תצא", "כי תבוא", "נצבים", "וילך", "האזינו", "וזאת הברכה"] }
};

let currentNavState = { bookId: 'bereshit', parashaName: 'בראשית', currentColumnIndex: 0 };
let paginatedColumns = [];

function initNavigation() {
    populateBookSelect();
}

function populateBookSelect() {
    const bookSelect = document.getElementById('select-book');
    bookSelect.innerHTML = '';
    for (const [bookId, bookData] of Object.entries(TORAH_STRUCTURE)) {
        const option = document.createElement('option');
        option.value = bookId;
        option.textContent = bookData.name;
        bookSelect.appendChild(option);
    }
    bookSelect.addEventListener('change', (e) => {
        currentNavState.bookId = e.target.value;
        populateParashaSelect();
    });
    populateParashaSelect();
}

function populateParashaSelect() {
    const parashaSelect = document.getElementById('select-parasha');
    parashaSelect.innerHTML = '';
    const parashot = TORAH_STRUCTURE[currentNavState.bookId].parashot;
    
    parashot.forEach(parashaName => {
        const option = document.createElement('option');
        option.value = parashaName;
        option.textContent = parashaName;
        parashaSelect.appendChild(option);
    });
    
    currentNavState.parashaName = parashot[0];
    parashaSelect.addEventListener('change', (e) => {
        currentNavState.parashaName = e.target.value;
        fetchTextFromOtzaria();
    });
    
    fetchTextFromOtzaria();
}

// שליפת הטקסט מאוצריא (API מתוקן לפי ההנחיות)
async function fetchTextFromOtzaria() {
    document.getElementById('reader-container').innerHTML = '<div style="text-align:center; padding: 40px;">טוען טקסט מאוצריא... (אנא המתן)</div>';
    
    let rawText = "";
    const bookName = TORAH_STRUCTURE[currentNavState.bookId].name;
    const parashaName = currentNavState.parashaName;

    try {
        if (window.Otzaria) {
            let currentOffset = 0;
            const limit = 5000;
            
            // הלולאה עוקפת את הגבלת ה-5000 תווים של ה-API
            while (true) {
                const res = await window.Otzaria.call('library.getBookContent', {
                    bookId: bookName,
                    section: parashaName,
                    offset: currentOffset,
                    limit: limit
                });
                
                if (res.success && res.data) {
                    rawText += (typeof res.data === 'string') ? res.data : JSON.stringify(res.data);
                    
                    // אם הנתונים שחזרו קטנים מהלימיט - סימן שהגענו לסוף הפרשה
                    if (res.data.length < limit) {
                        break; 
                    }
                    currentOffset += limit;
                } else {
                    console.error("API Error:", res.error);
                    if (rawText.length === 0) {
                        rawText = `שגיאה בשליפת הטקסט: ${res.error?.message || "לא ידועה"}`;
                    }
                    break;
                }
            }
            
            // ניקוי HTML מתגיות (אם ה-API מחזיר אותן)
            rawText = rawText.replace(/<[^>]*>?/gm, ' ');
        }
    } catch (error) {
        console.error("API Fetch Error:", error);
        rawText = "שגיאה פנימית בטעינת הטקסט מאוצריא.";
    }

    paginatedColumns = dynamicPaginate(rawText);
    currentNavState.currentColumnIndex = 0;
    renderCurrentColumn();
}

function renderCurrentColumn() {
    if (paginatedColumns.length > 0) {
        const columnData = paginatedColumns[currentNavState.currentColumnIndex];
        // מפעיל את הפונקציה מ-reader.js
        renderColumnUI(columnData); 
        document.getElementById('column-indicator').textContent = `עמודה ${currentNavState.currentColumnIndex + 1} מתוך ${paginatedColumns.length}`;
    }
}

document.getElementById('btn-next-col').addEventListener('click', () => {
    if (currentNavState.currentColumnIndex < paginatedColumns.length - 1) {
        currentNavState.currentColumnIndex++;
        renderCurrentColumn();
    }
});

document.getElementById('btn-prev-col').addEventListener('click', () => {
    if (currentNavState.currentColumnIndex > 0) {
        currentNavState.currentColumnIndex--;
        renderCurrentColumn();
    }
});