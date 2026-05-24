// js/reader.js

const MAX_CHARS_PER_LINE = 36;
const LINES_PER_COLUMN = 42;

/**
 * חותך את הטקסט הגולמי של אוצריא ל-42 שורות, ומזהה פתוחות/סתומות.
 */
function dynamicPaginate(rawText) {
    const columns = [];
    let currentColumn = [];
    
    // ניקוי סימני פיסוק זרים והכנה, פיצול לפי מילים.
    // נתייחס ל-(פ)/[פ]/{פ} כסימן לפתוחה, ול-(ס)/[ס]/{ס} כסתומה
    // (בטקסט מכון ממרא של אוצריא הסימן מופיע כסוגריים מסולסלים)
    const words = rawText.replace(/[\n\r]/g, ' ')
                         .replace(/\(פ\)|\[פ\]|\{פ\}/g, ' {PETUCHA} ')
                         .replace(/\(ס\)|\[ס\]|\{ס\}/g, ' {SETUMA} ')
                         .split(/\s+/)
                         .filter(w => w.trim().length > 0);
                         
    let currentLine = [];
    let charCount = 0;
    let layoutType = "regular"; // 'regular', 'petucha', 'setuma'

    for (let i = 0; i < words.length; i++) {
        const word = words[i];

        if (word === '{PETUCHA}') {
            // פרשה פתוחה: סוגרים את השורה הנוכחית (אם יש בה משהו) ומגדירים אותה כפתוחה
            if (currentLine.length > 0) {
                currentColumn.push({ words: currentLine, layout: 'petucha' });
                currentLine = [];
                charCount = 0;
                checkColumnFull();
            } else if (currentColumn.length > 0) {
                // אם השורה ריקה, השורה הקודמת נחשבת פתוחה
                currentColumn[currentColumn.length - 1].layout = 'petucha';
            }
            continue;
        }

        if (word === '{SETUMA}') {
            // פרשה סתומה: מוסיפים סמן מיוחד לתוך השורה ומגדירים את הפריסה
            currentLine.push({ nikud: '{GAP}', stam: '{GAP}' });
            layoutType = 'setuma';
            charCount += 9; // הרווח שקול לכ-9 תווים
            continue;
        }
        
        // יצירת טקסט ללא ניקוד לטובת טור הסת"ם
        const wordStam = word.replace(/[\u0591-\u05C7]/g, ''); 
        currentLine.push({ stam: wordStam, nikud: word });
        charCount += wordStam.length + 1;

        // חותכים שורה אם הגענו למקסימום תווים
        if (charCount >= MAX_CHARS_PER_LINE || i === words.length - 1) {
            currentColumn.push({ words: currentLine, layout: layoutType });
            currentLine = [];
            charCount = 0;
            layoutType = 'regular'; // איפוס לשורה הבאה
            checkColumnFull();
        }
    }

    // הוספת שארית לשורה/עמודה
    if (currentLine.length > 0) {
        currentColumn.push({ words: currentLine, layout: layoutType });
    }
    if (currentColumn.length > 0) {
        columns.push(currentColumn);
    }

    return columns;

    // פונקציית עזר לבדיקה אם העמודה התמלאה ב-42 שורות
    function checkColumnFull() {
        if (currentColumn.length === LINES_PER_COLUMN) {
            columns.push(currentColumn);
            currentColumn = [];
        }
    }
}

/**
 * ציור העמודה ל-HTML
 */
function renderColumnUI(columnLines) {
    const container = document.getElementById('reader-container');
    container.innerHTML = ''; 

    const page = document.createElement('div');
    page.className = 'reader-page';

    columnLines.forEach(lineObj => {
        const row = document.createElement('div');
        row.className = `reader-row layout-${lineObj.layout}`;

        const stamCell = document.createElement('div');
        stamCell.className = 'stam-col';
        
        const nikudCell = document.createElement('div');
        nikudCell.className = 'nikud-col';

        let isGapNext = false;

        lineObj.words.forEach(wordObj => {
            if (wordObj.stam === '{GAP}') {
                // הזרקת אלמנט רווח לסתומה
                const spacer1 = document.createElement('div');
                spacer1.className = 'halachic-spacer spacer-setuma';
                stamCell.appendChild(spacer1);

                const spacer2 = document.createElement('span');
                spacer2.className = 'halachic-spacer spacer-setuma';
                nikudCell.appendChild(spacer2);
                return;
            }

            // --- הרכבת מילת סת"ם עם אותיות לחיתוך/מתיחה ---
            // תמיכה ב-markers: ... = אות זעירא, ... = אות רבתי
            const wordEl = document.createElement('div');
            wordEl.className = 'stam-word';

            let inZeira = false;
            let inRabati = false;
            for (let i = 0; i < wordObj.stam.length; i++) {
                const char = wordObj.stam[i];
                if (char === '') { inZeira = true; continue; }
                if (char === '') { inZeira = false; continue; }
                if (char === '') { inRabati = true; continue; }
                if (char === '') { inRabati = false; continue; }
                const charEl = document.createElement('span');
                charEl.className = 'stam-letter';
                if (inZeira) charEl.classList.add('letter-zeira');
                if (inRabati) charEl.classList.add('letter-rabati');
                charEl.innerText = char;
                wordEl.appendChild(charEl);
            }
            stamCell.appendChild(wordEl);

            // --- הרכבת מילת הניקוד ---
            const nikudWord = document.createElement('span');
            // ניקוי markers מהניקוד והחלפתם ב-span עם class מתאים
            const nikudHtml = wordObj.nikud
                .replace(/([\s\S]*?)/g, '<span class="letter-zeira">$1</span>')
                .replace(/([\s\S]*?)/g, '<span class="letter-rabati">$1</span>');
            nikudWord.innerHTML = nikudHtml + ' ';
            nikudCell.appendChild(nikudWord);
        });

        row.appendChild(stamCell);
        row.appendChild(nikudCell);
        page.appendChild(row);
    });

    container.appendChild(page);
}