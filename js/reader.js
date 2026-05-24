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
 * המרה מספר עברי לגימטריה (לתצוגת מספרי פסוקים/פרקים)
 */
function numToHebrewGematria(n) {
    if (!n || n <= 0) return '';
    const map = ['','א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב','יג','יד','טו','טז','יז','יח','יט','כ',
        'כא','כב','כג','כד','כה','כו','כז','כח','כט','ל','לא','לב','לג','לד','לה','לו','לז','לח','לט','מ',
        'מא','מב','מג','מד','מה','מו','מז','מח','מט','נ'];
    if (n <= 50) return map[n];
    if (n < 100) return 'נ' + (n - 50 > 0 ? map[n - 50] : '');
    if (n < 150) return 'ק' + (n - 100 > 0 ? map[n - 100] : '');
    return String(n);
}

/**
 * בניית התוכן של עמודת המסמנים האמצעית עבור שורה.
 * prev = { ch, vs } - הפרק/פסוק האחרונים שהוצגו (לזיהוי "פרק חדש או לא").
 *
 * כללי הצגה:
 * - aliyaName: תמיד.
 * - פסוק (firstVerseNum): תמיד, אם השורה מתחילה בפסוק חדש.
 * - "פרק:פסוק" (במקום רק פסוק) רק כשבאמת מתחיל פרק חדש - שונה מהפרק שהיה לפני כן.
 *   כך מונעים "פרק חדש" מזויף בקריאות בין עליות שמתחילות באותו פרק.
 */
function buildMarkerContent(lineObj, prev) {
    const wrapper = document.createElement('div');
    wrapper.className = 'marker-wrapper';
    const curCh = lineObj.firstChapterNum;
    const curVs = lineObj.firstVerseNum;

    if (lineObj.aliyaName) {
        const aliyaSpan = document.createElement('span');
        aliyaSpan.className = 'marker-aliya';
        aliyaSpan.textContent = lineObj.aliyaName;
        wrapper.appendChild(aliyaSpan);
    }

    const isReallyNewChapter = curCh != null && curCh !== prev.ch;

    if (isReallyNewChapter) {
        const refSpan = document.createElement('span');
        refSpan.className = 'marker-ref marker-ref-chapter';
        const ch = numToHebrewGematria(curCh);
        const vs = numToHebrewGematria(curVs || 1);
        refSpan.textContent = `${ch}:${vs}`;
        wrapper.appendChild(refSpan);
    } else if (curVs != null) {
        const vsSpan = document.createElement('span');
        vsSpan.className = 'marker-ref marker-ref-verse';
        vsSpan.textContent = numToHebrewGematria(curVs);
        wrapper.appendChild(vsSpan);
    }

    return wrapper.children.length > 0 ? [wrapper] : [];
}

/**
 * הסתרת שם השם: י-ה-ו-ה -> י-ק-ו-ק (תוך שמירת ניקוד וטעמים).
 * הביטוי תופס י + (טעמים/ניקוד) + ה + (טעמים/ניקוד) + ו + (טעמים/ניקוד) + ה.
 */
function maskDivineName(text) {
    if (!text) return text;
    return text.replace(
        /י([֑-ׇֿ-]*)ה([֑-ׇֿ-]*)ו([֑-ׇֿ-]*)ה/g,
        'י$1ק$2ו$3ק'
    );
}

/**
 * ציור העמודה ל-HTML
 */
function renderColumnUI(columnLines) {
    const container = document.getElementById('reader-container');
    container.innerHTML = '';

    // כותרת אופציונלית (משמשת בהפטרות - שם הפטרה + ספר ופסוקים)
    if (window._currentHeader) {
        const headerEl = document.createElement('div');
        headerEl.className = 'reader-header';
        if (window._currentHeader.title) {
            const t = document.createElement('div');
            t.className = 'reader-header-title';
            t.textContent = window._currentHeader.title;
            headerEl.appendChild(t);
        }
        if (window._currentHeader.subtitle) {
            const s = document.createElement('div');
            s.className = 'reader-header-subtitle';
            s.textContent = window._currentHeader.subtitle;
            headerEl.appendChild(s);
        }
        container.appendChild(headerEl);
    }

    const page = document.createElement('div');
    page.className = 'reader-page';

    // מעקב אחרי הפרק והפסוק האחרונים שהוצגו - לזיהוי רצף
    const prev = { ch: null, vs: null };

    columnLines.forEach(lineObj => {
        const row = document.createElement('div');
        row.className = `reader-row layout-${lineObj.layout}`;

        const stamCell = document.createElement('div');
        stamCell.className = 'stam-col';

        // עמודת המסמנים האמצעית - מספרי פרק/פסוק ושם עליה
        const markersCell = document.createElement('div');
        markersCell.className = 'markers-col';
        const markerParts = buildMarkerContent(lineObj, prev);
        markerParts.forEach(p => markersCell.appendChild(p));

        // עדכון prev לפי השורה הנוכחית
        if (lineObj.firstChapterNum != null) prev.ch = lineObj.firstChapterNum;
        if (lineObj.firstVerseNum != null) prev.vs = lineObj.firstVerseNum;

        const nikudCell = document.createElement('div');
        nikudCell.className = 'nikud-col';

        let isGapNext = false;

        const maskName = !!(typeof AppState !== 'undefined' && AppState.settings && AppState.settings.hideDivineName);
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
            // אם stam ריק (קרי ולא כתיב) - דילוג על הוספת מילה לטור הסת"ם
            if (wordObj.stam) {
                const stamText = maskName ? maskDivineName(wordObj.stam) : wordObj.stam;
                const wordEl = document.createElement('div');
                wordEl.className = 'stam-word';
                let inZeira = false;
                let inRabati = false;
                for (let i = 0; i < stamText.length; i++) {
                    const char = stamText[i];
                    const code = char.charCodeAt(0);
                    if (code === 0xE020) { inZeira = true; continue; }
                    if (code === 0xE021) { inZeira = false; continue; }
                    if (code === 0xE022) { inRabati = true; continue; }
                    if (code === 0xE023) { inRabati = false; continue; }
                    const charEl = document.createElement('span');
                    charEl.className = 'stam-letter';
                    if (inZeira) charEl.classList.add('letter-zeira');
                    if (inRabati) charEl.classList.add('letter-rabati');
                    charEl.innerText = char;
                    wordEl.appendChild(charEl);
                }
                stamCell.appendChild(wordEl);
            }

            // --- הרכבת מילת הניקוד ---
            // אם nikud ריק (כתיב ולא קרי) - דילוג על טור הניקוד
            if (wordObj.nikud) {
                const nikudText = maskName ? maskDivineName(wordObj.nikud) : wordObj.nikud;
                const nikudWord = document.createElement('span');
                const nikudHtml = nikudText
                    .replace(/\uE020([\s\S]*?)\uE021/g, '<span class="letter-zeira">$1</span>')
                    .replace(/\uE022([\s\S]*?)\uE023/g, '<span class="letter-rabati">$1</span>');
                nikudWord.innerHTML = nikudHtml + ' ';
                nikudCell.appendChild(nikudWord);
            }
        });

        row.appendChild(stamCell);
        row.appendChild(markersCell);
        row.appendChild(nikudCell);
        page.appendChild(row);
    });

    container.appendChild(page);
}