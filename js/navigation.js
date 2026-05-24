// js/navigation.js

const TORAH_STRUCTURE = {
    "bereshit": { name: "בראשית", parashot: ["בראשית", "נח", "לך לך", "וירא", "חיי שרה", "תולדות", "ויצא", "וישלח", "וישב", "מקץ", "ויגש", "ויחי"] },
    "shemot": { name: "שמות", parashot: ["שמות", "וארא", "בא", "בשלח", "יתרו", "משפטים", "תרומה", "תצוה", "כי תשא", "ויקהל", "פקודי"] },
    "vayikra": { name: "ויקרא", parashot: ["ויקרא", "צו", "שמיני", "תזריע", "מצורע", "אחרי מות", "קדושים", "אמור", "בהר", "בחוקותי"] },
    "bamidbar": { name: "במדבר", parashot: ["במדבר", "נשא", "בהעלותך", "שלח לך", "קרח", "חקת", "בלק", "פנחס", "מטות", "מסעי"] },
    "devarim": { name: "דברים", parashot: ["דברים", "ואתחנן", "עקב", "ראה", "שופטים", "כי תצא", "כי תבוא", "נצבים", "וילך", "האזינו", "וזאת הברכה"] }
};

// המרה משם פרשה בUI לשם פרשה ב-PARASHA_OPENINGS
const PARASHA_NAME_MAPPING = {
    'בחוקותי': 'בחקתי',
    'בהעלותך': 'בהעלתך',
    'שלח לך': 'שלח',
    'פנחס': 'פינחס'
};

const BOOKS_ORDER = ['bereshit', 'shemot', 'vayikra', 'bamidbar', 'devarim'];

let currentNavState = {
    section: 'torah', // 'torah' / 'neviim' / 'ketuvim'
    bookId: 'bereshit',
    parashaName: 'בראשית',
    methodId: 'ramah',
    tanachBookId: null,   // ספר נביאים/כתובים נבחר
    tanachChapter: 1,
    currentColumnIndex: 0,
    targetTokenIdx: -1
};

// Cache - כל חומש נטען פעם אחת
const TorahBookCache = {};
// כל הטקסט המעובד: { tokens, lines, pages, parashaPositions }
let processedAll = null;
let paginatedColumns = [];
let fetchRequestId = 0;

function normalizeParashaName(uiName) {
    return PARASHA_NAME_MAPPING[uiName] || uiName;
}

function initNavigation() {
    populateSectionSelect();
    populateMethodSelect();
    populateBookSelect();
    populateTanachBookSelect();
    updateUIForSection(); // הצגת בוררים מתאימים
}

function populateSectionSelect() {
    const sel = document.getElementById('select-section');
    if (!sel) return;
    sel.innerHTML = '';
    for (const [id, sec] of Object.entries(window.TANACH_SECTIONS)) {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = sec.name;
        sel.appendChild(opt);
    }
    sel.value = currentNavState.section;
    sel.addEventListener('change', (e) => {
        currentNavState.section = e.target.value;
        updateUIForSection();
        if (currentNavState.section === 'torah') {
            processedAll = null; // טעון מחדש
            navigateToCurrentParasha();
        } else {
            // נביאים/כתובים: בחר ספר ראשון
            const books = window.TANACH_SECTIONS[currentNavState.section].books;
            currentNavState.tanachBookId = books[0].id;
            currentNavState.tanachChapter = 1;
            populateTanachBookSelect();
            populateChapterSelect();
            loadAndDisplayTanachBook();
        }
    });
}

function updateUIForSection() {
    const isTorah = currentNavState.section === 'torah';
    document.getElementById('select-method').style.display = isTorah ? '' : 'none';
    document.getElementById('select-book').style.display = isTorah ? '' : 'none';
    document.getElementById('select-parasha').style.display = isTorah ? '' : 'none';
    document.getElementById('select-aliya').style.display = isTorah ? '' : 'none';
    document.getElementById('select-chapter').style.display = isTorah ? 'none' : '';
    // ה-select-book משמש לתורה; לנביאים/כתובים נצטרך select אחר.
    // לפשטות, נשתמש שוב ב-select-book אם זה לא תורה, אבל נמלא בו ספרי נ"ך
    if (!isTorah) {
        populateTanachBookSelect();
    }
}

function populateTanachBookSelect() {
    if (currentNavState.section === 'torah') return;
    const sel = document.getElementById('select-book');
    sel.innerHTML = '';
    const books = window.TANACH_SECTIONS[currentNavState.section].books;
    for (const b of books) {
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.textContent = b.name;
        sel.appendChild(opt);
    }
    // הצג ספר זה
    sel.style.display = '';
    if (!currentNavState.tanachBookId) {
        currentNavState.tanachBookId = books[0].id;
    }
    sel.value = currentNavState.tanachBookId;
    // listener חד-פעמי (בודק כי הוא מקבל אירועים גם בתורה)
    sel.onchange = (e) => {
        if (currentNavState.section === 'torah') {
            // לתורה - הניווט לפי הקוד הקיים
            currentNavState.bookId = e.target.value;
            populateParashaSelect();
        } else {
            currentNavState.tanachBookId = e.target.value;
            currentNavState.tanachChapter = 1;
            populateChapterSelect();
            loadAndDisplayTanachBook();
        }
    };
    populateChapterSelect();
}

function populateChapterSelect() {
    const sel = document.getElementById('select-chapter');
    sel.innerHTML = '';
    if (currentNavState.section === 'torah') return;
    const book = window.TANACH_SECTIONS[currentNavState.section].books
        .find(b => b.id === currentNavState.tanachBookId);
    if (!book) return;
    for (let i = 1; i <= book.chapters; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `פרק ${toHebrewNumeral(i)}`;
        sel.appendChild(opt);
    }
    sel.value = currentNavState.tanachChapter || 1;
    sel.onchange = (e) => {
        currentNavState.tanachChapter = parseInt(e.target.value);
        scrollToChapter(currentNavState.tanachChapter);
    };
}

function toHebrewNumeral(n) {
    const map = ['','א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב','יג','יד','טו','טז','יז','יח','יט','כ',
        'כא','כב','כג','כד','כה','כו','כז','כח','כט','ל','לא','לב','לג','לד','לה','לו','לז','לח','לט','מ',
        'מא','מב','מג','מד','מה','מו','מז','מח','מט','נ'];
    if (n <= 50) return map[n];
    // לפרקים מעל 50 - תהלים יכול להגיע ל-150
    if (n < 100) {
        return 'נ' + (n - 50 > 0 ? map[n - 50] : '');
    } else if (n < 150) {
        return 'ק' + (n - 100 > 0 ? map[n - 100] : '');
    }
    return 'קנ';
}

function populateMethodSelect() {
    const methodSelect = document.getElementById('select-method');
    if (!methodSelect) return;
    methodSelect.innerHTML = '';
    const methods = TorahLayoutsAPI.getMethods();
    for (const m of methods) {
        const option = document.createElement('option');
        option.value = m.id;
        option.textContent = m.name;
        option.title = m.fullName;
        methodSelect.appendChild(option);
    }
    methodSelect.value = currentNavState.methodId;
    methodSelect.addEventListener('change', (e) => {
        currentNavState.methodId = e.target.value;
        // טעון מחדש (חישוב עמודים תלוי בשיטה)
        processedAll = null;
        navigateToCurrentParasha();
    });
}

function populateBookSelect() {
    const bookSelect = document.getElementById('select-book');
    const parashaSelect = document.getElementById('select-parasha');
    bookSelect.innerHTML = '';
    for (const [bookId, bookData] of Object.entries(TORAH_STRUCTURE)) {
        const option = document.createElement('option');
        option.value = bookId;
        option.textContent = bookData.name;
        bookSelect.appendChild(option);
    }
    // onchange (לא addEventListener) - כדי שלא להתנגש עם populateTanachBookSelect
    bookSelect.onchange = (e) => {
        if (currentNavState.section === 'torah') {
            currentNavState.bookId = e.target.value;
            populateParashaSelect();
        } else {
            currentNavState.tanachBookId = e.target.value;
            currentNavState.tanachChapter = 1;
            populateChapterSelect();
            loadAndDisplayTanachBook();
        }
    };
    parashaSelect.onchange = (e) => {
        currentNavState.parashaName = e.target.value;
        populateAliyaSelect();
        navigateToCurrentParasha();
    };
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
    populateAliyaSelect();
    navigateToCurrentParasha();
}

function populateAliyaSelect() {
    const sel = document.getElementById('select-aliya');
    if (!sel) return;
    sel.innerHTML = '';
    if (currentNavState.section !== 'torah') return;
    const bookName = TORAH_STRUCTURE[currentNavState.bookId].name;
    const normalized = normalizeParashaName(currentNavState.parashaName);
    const aliyot = (window.ALIYOT_INDEX?.[bookName]?.[normalized]) || [];

    // אפשרות "כל הפרשה" (לראש הפרשה)
    const allOpt = document.createElement('option');
    allOpt.value = '';
    allOpt.textContent = 'כל הפרשה';
    sel.appendChild(allOpt);

    aliyot.forEach((a, idx) => {
        const opt = document.createElement('option');
        opt.value = String(idx);
        opt.textContent = a.aliya; // "עליה א", "עליה ב", ...
        sel.appendChild(opt);
    });
    sel.value = '';
    sel.onchange = (e) => {
        const idx = e.target.value;
        if (idx === '') {
            navigateToCurrentParasha();
            return;
        }
        scrollToAliya(parseInt(idx));
    };
}

function scrollToAliya(idx) {
    if (!processedAll) return;
    const bookName = TORAH_STRUCTURE[currentNavState.bookId].name;
    const normalized = normalizeParashaName(currentNavState.parashaName);
    const aliyot = (window.ALIYOT_INDEX?.[bookName]?.[normalized]) || [];
    const a = aliyot[idx];
    if (!a) return;

    // מצא בעמודים הנוכחיים את המיקום של רצף המילים שמתחיל את העליה
    const tokens = processedAll.tokens;
    const targetWords = a.words;
    // התחל לחפש מתחילת הפרשה
    const bookStart = (processedAll.bookStartTokenIdx || {})[currentNavState.bookId] || 0;
    const parashaTokenIdx = window.findParashaStart(tokens, normalized, bookStart);
    const startFrom = parashaTokenIdx >= 0 ? parashaTokenIdx : bookStart;

    const aliyaTokenIdx = findWordSequence(tokens, targetWords, startFrom);
    if (aliyaTokenIdx < 0) {
        console.warn('Aliya not found:', a.aliya);
        return;
    }

    // מצא שורה ועמוד
    const lines = processedAll.allLines;
    let foundLineIdx = -1;
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const thisStart = lines[lineIdx].startTokenIdx;
        const nextStart = (lineIdx + 1 < lines.length) ? lines[lineIdx + 1].startTokenIdx : Infinity;
        if (thisStart >= 0 && aliyaTokenIdx >= thisStart && aliyaTokenIdx < nextStart) {
            foundLineIdx = lineIdx;
            break;
        }
    }
    if (foundLineIdx < 0) return;

    for (let pIdx = 0; pIdx < processedAll.pages.length; pIdx++) {
        const p = processedAll.pages[pIdx];
        if (foundLineIdx >= p.startLineIdx && foundLineIdx < p.endLineIdx) {
            currentNavState.currentColumnIndex = pIdx;
            renderCurrentColumn(foundLineIdx - p.startLineIdx);
            return;
        }
    }
}

function findWordSequence(tokens, words, fromIdx) {
    const norm = (s) => s.replace(/[֑-ׇ־]/g, '').replace(/יקוק/g, 'יהוה');
    const normWords = words.map(norm);
    for (let i = fromIdx; i < tokens.length - words.length; i++) {
        if (tokens[i].type !== 'word') continue;
        let wIdx = 0, tIdx = i, ok = true;
        while (wIdx < normWords.length && tIdx < tokens.length) {
            const tok = tokens[tIdx];
            if (tok.type !== 'word') { tIdx++; continue; }
            if (norm(tok.value) !== normWords[wIdx]) { ok = false; break; }
            wIdx++; tIdx++;
        }
        if (ok && wIdx === normWords.length) return i;
    }
    return -1;
}

// ניקוי טקסט גולמי - מוציא חלקים שלא רלוונטיים
function cleanRawText(rawText) {
    // הסרת כותרות h1/h2 כולל תוכן
    rawText = rawText.replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, ' ');
    // אם הטקסט מתחיל ב-</h..> חלקי (כי ה-bridge חתך באמצע h1)
    const head = rawText.substring(0, 300);
    const lastCloseH = head.lastIndexOf('</h');
    if (lastCloseH >= 0) {
        const tagEnd = rawText.indexOf('>', lastCloseH);
        if (tagEnd >= 0 && tagEnd < 300) {
            rawText = rawText.substring(tagEnd + 1);
        }
    }
    // הסרת footnote markers
    rawText = rawText.replace(/<sup[^>]*class="footnote-marker"[^>]*>[\s\S]*?<\/sup>/gi, ' ');
    rawText = rawText.replace(/<i[^>]*class="footnote"[^>]*>[\s\S]*?<\/i>/gi, ' ');
    // <big>X</big> - שמור תוכן
    rawText = rawText.replace(/<big[^>]*>([\s\S]*?)<\/big>/g, '$1');
    // <small>X</small> - אם עברי, סמן כאות זעירא
    rawText = rawText.replace(/<small[^>]*>([\s\S]*?)<\/small>/g, (m, content) => {
        if (/[א-ת]/.test(content)) {
            return '' + content + '';
        }
        return content;
    });
    // <br> -> רווח
    rawText = rawText.replace(/<br\s*\/?>/gi, ' ');
    // הסרת שאר תגיות
    rawText = rawText.replace(/<[^>]*>?/gm, ' ');
    // פענוח HTML entities
    const decoder = document.createElement('textarea');
    decoder.innerHTML = rawText;
    rawText = decoder.value;

    // כתיב/קרי: (כתיב) [קרי] -> markers מיוחדים שלא מתפרקים
    // U+E010 = start, U+E011 = middle, U+E012 = end
    rawText = rawText.replace(
        /\(([^()\[\]]+?)\)(?:\s|&nbsp;|&thinsp;)*\[([^()\[\]]+?)\]/g,
        function(m, ketiv, qere) {
            var k = ketiv.trim().replace(/\s+/g, '');
            var q = qere.trim().replace(/\s+/g, '');
            return '' + k + '' + q + '';
        }
    );
    // הסרת סימוני פסוקים (א),(ב) - שמירת {פ}/{ס}
    rawText = rawText.replace(/\(([א-ת"׳]+)\)/g, function(match, inner) {
        if (inner === 'פ' || inner === 'ס') return match;
        return ' ';
    });
    // המרת מקף עברי לרווח
    rawText = rawText.replace(/־/g, ' ');
    // איחוד רווחים
    rawText = rawText.replace(/\s+/g, ' ').trim();
    return rawText;
}

// טוען חומש מלא מ-bridge, עם cache
async function fetchFullBook(bookId) {
    if (TorahBookCache[bookId]) return TorahBookCache[bookId];
    const bookName = TORAH_STRUCTURE[bookId].name;
    let rawText = '';
    let offset = 0;
    const limit = 5000;
    const MAX_ITER = 500;
    let iter = 0;
    while (iter++ < MAX_ITER) {
        try {
            const res = await window.Otzaria.call('library.getBookContent', {
                bookId: bookName,
                offset: offset,
                limit: limit
            });
            if (res.success && res.data) {
                const chunk = (typeof res.data === 'string') ? res.data : JSON.stringify(res.data);
                rawText += chunk;
                if (chunk.length < limit) break;
                offset += limit;
            } else {
                console.error('Failed to load book', bookName, res.error);
                break;
            }
        } catch (e) {
            console.error('Exception loading book', bookName, e);
            break;
        }
    }
    TorahBookCache[bookId] = rawText;
    return rawText;
}

// טעון את כל ספרי התורה ועיבוד מלא
async function loadAndProcessAll(methodId) {
    document.getElementById('reader-container').innerHTML =
        '<div style="text-align:center; padding: 40px;">טוען...</div>';

    const t0 = performance.now();

    const allRaw = await Promise.all(
        BOOKS_ORDER.map(bookId => fetchFullBook(bookId).then(text => {
            console.log(`[tikkun] loaded ${bookId}: ${text.length} chars`);
            return text;
        }))
    );

    await new Promise(r => setTimeout(r, 10));

    // צירוף עם marker מפריד בין חומשים - 4 שורות ריקות בכתב סת"ם אמיתי
    const combined = allRaw.join(' BOOKBREAKMARKER ');
    const cleaned = cleanRawText(combined);
    const tokens = window.PageLayoutEngine.tokenizeText(cleaned);

    // מיפוי תחילת כל חומש ב-tokens לפי book_break tokens
    const bookStartTokenIdx = computeBookStartIndices(tokens);
    console.log(`[tikkun] book starts:`, bookStartTokenIdx);

    const layout = window.TORAH_LAYOUTS[methodId];
    const maxLines = layout.linesPerPage;
    const allLines = window.PageLayoutEngine.paginateAllTokens(tokens, 36);
    console.log(`[tikkun] lines: ${allLines.length}, pages: ~${Math.ceil(allLines.length / maxLines)}`);

    const pages = [];
    for (let i = 0; i < allLines.length; i += maxLines) {
        pages.push({
            startLineIdx: i,
            endLineIdx: Math.min(i + maxLines, allLines.length),
            lines: allLines.slice(i, i + maxLines)
        });
    }

    processedAll = { tokens, allLines, pages, bookStartTokenIdx };
    paginatedColumns = pages.map(p => p.lines);

    console.log(`[tikkun] done in ${Math.round((performance.now() - t0) / 1000)}s`);
    return processedAll;
}

// === נביאים וכתובים ===
const TanachCache = {}; // bookId -> { rawText, chapters: [{ num, lineIdx }] }

async function loadAndDisplayTanachBook() {
    const myRequestId = ++fetchRequestId;
    document.getElementById('reader-container').innerHTML =
        '<div style="text-align:center; padding: 40px;">טוען...</div>';

    const book = window.TANACH_SECTIONS[currentNavState.section].books
        .find(b => b.id === currentNavState.tanachBookId);
    if (!book) return;

    let processed = TanachCache[book.id];
    if (!processed) {
        // טעינה מ-bridge
        let rawText = '';
        let offset = 0;
        const limit = 5000;
        const MAX_ITER = 500;
        let iter = 0;
        while (iter++ < MAX_ITER) {
            try {
                const res = await window.Otzaria.call('library.getBookContent', {
                    bookId: book.name,
                    offset: offset,
                    limit: limit
                });
                if (myRequestId !== fetchRequestId) return;
                if (res.success && res.data) {
                    const chunk = (typeof res.data === 'string') ? res.data : JSON.stringify(res.data);
                    rawText += chunk;
                    if (chunk.length < limit) break;
                    offset += limit;
                } else {
                    console.error('Failed to load tanach book', book.name, res.error);
                    break;
                }
            } catch (e) {
                console.error('Exception loading tanach book', book.name, e);
                break;
            }
        }

        // לפני ניקוי, נחלץ את מיקומי הפרקים מתוך <h2>פרק X</h2>
        const chapterPositions = [];
        const h2Regex = /<h2[^>]*>פרק\s+([א-ת"׳]+)<\/h2>/g;
        let m;
        while ((m = h2Regex.exec(rawText)) !== null) {
            chapterPositions.push({ rawIdx: m.index, label: m[1] });
        }

        // לפצל את הטקסט לפי הפרקים, ולסמן כל פרק ב-marker מיוחד
        // כדי שנוכל אחר כך לזהות תחילת כל פרק ב-tokens
        let processedRaw = '';
        let lastEnd = 0;
        chapterPositions.forEach((cp, idx) => {
            processedRaw += rawText.substring(lastEnd, cp.rawIdx);
            processedRaw += ` CHAPTERMARK${idx + 1}MARK `;
            // דילוג על תגית h2 עצמה
            const endH2 = rawText.indexOf('</h2>', cp.rawIdx);
            lastEnd = endH2 + 5;
        });
        processedRaw += rawText.substring(lastEnd);

        // ניקוי
        const cleaned = cleanRawText(processedRaw);
        const tokens = window.PageLayoutEngine.tokenizeText(cleaned);
        const allLines = window.PageLayoutEngine.paginateAllTokens(tokens, 36);

        // איתור באיזו שורה מתחיל כל פרק - לפי ה-CHAPTERMARK
        const chapterToLineIdx = {};
        for (let i = 0; i < tokens.length; i++) {
            const t = tokens[i];
            if (t.type === 'word' && /^CHAPTERMARK\d+MARK$/.test(t.value)) {
                const num = parseInt(t.value.match(/\d+/)[0]);
                // מצא את השורה הבאה אחרי הטוקן הזה
                for (let lineIdx = 0; lineIdx < allLines.length; lineIdx++) {
                    if (allLines[lineIdx].startTokenIdx > i) {
                        chapterToLineIdx[num] = lineIdx;
                        break;
                    }
                }
            }
        }

        // הסרת הטוקנים של ה-CHAPTERMARK מהשורות עצמן (בלי לפגוע ב-startTokenIdx)
        for (const line of allLines) {
            line.words = line.words.filter(w => !/^CHAPTERMARK\d+MARK$/.test(w.stam));
        }

        processed = { rawText, tokens, allLines, chapterToLineIdx };
        TanachCache[book.id] = processed;
    }

    if (myRequestId !== fetchRequestId) return;

    // הצגה: עמוד אחד ארוך עם כל השורות
    paginatedColumns = [processed.allLines];
    currentNavState.currentColumnIndex = 0;
    processedAll = null; // לא משתמשים בלוגיקה של תורה
    window._currentTanachChapterMap = processed.chapterToLineIdx;

    renderCurrentColumn();
    // גלילה לפרק הנבחר
    if (currentNavState.tanachChapter) {
        setTimeout(() => scrollToChapter(currentNavState.tanachChapter), 50);
    }
}

function scrollToChapter(chapterNum) {
    const map = window._currentTanachChapterMap;
    if (!map) return;
    const lineIdx = map[chapterNum];
    if (typeof lineIdx !== 'number') return;
    const rows = document.querySelectorAll('.reader-row');
    if (rows[lineIdx]) {
        rows[lineIdx].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// מיפוי bookId -> אינדקס תחילתו בtokens
function computeBookStartIndices(tokens) {
    const indices = { bereshit: 0 };
    const order = ['shemot', 'vayikra', 'bamidbar', 'devarim'];
    let count = 0;
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type === 'book_break') {
            if (count < order.length) {
                indices[order[count]] = i + 1;
                count++;
            }
        }
    }
    return indices;
}

// מחפש באיזה עמוד נמצאת תחילת פרשה
function findPageForParasha(parashaName) {
    if (!processedAll) return { pageIdx: 0, lineInPage: 0 };
    const normalized = normalizeParashaName(parashaName);
    // חיפוש מתחיל מתחילת החומש הנוכחי (כדי לא לתפוס מופע מוקדם של אותה מילה)
    const bookStart = (processedAll.bookStartTokenIdx || {})[currentNavState.bookId] || 0;
    const startTokenIdx = window.findParashaStart(processedAll.tokens, normalized, bookStart);
    if (startTokenIdx < 0) {
        console.warn(`Parasha ${normalized} not found in tokens`);
        return { pageIdx: 0, lineInPage: 0 };
    }

    // מצא את השורה שה-startTokenIdx שלה מוקדם או שווה ל-startTokenIdx של הפרשה,
    // וה-startTokenIdx של השורה הבאה גדול ממנו.
    const lines = processedAll.allLines;
    let foundLineIdx = -1;
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const thisStart = lines[lineIdx].startTokenIdx;
        const nextStart = (lineIdx + 1 < lines.length) ? lines[lineIdx + 1].startTokenIdx : Infinity;
        if (thisStart >= 0 && startTokenIdx >= thisStart && startTokenIdx < nextStart) {
            foundLineIdx = lineIdx;
            break;
        }
    }

    if (foundLineIdx < 0) {
        console.warn(`Line for token ${startTokenIdx} not found`);
        return { pageIdx: 0, lineInPage: 0 };
    }

    // מצא את העמוד שמכיל את השורה
    for (let pIdx = 0; pIdx < processedAll.pages.length; pIdx++) {
        const p = processedAll.pages[pIdx];
        if (foundLineIdx >= p.startLineIdx && foundLineIdx < p.endLineIdx) {
            return { pageIdx: pIdx, lineInPage: foundLineIdx - p.startLineIdx };
        }
    }
    return { pageIdx: 0, lineInPage: 0 };
}

// טעון (אם צריך) וגלל לפרשה
async function navigateToCurrentParasha() {
    const myRequestId = ++fetchRequestId;

    if (!processedAll) {
        await loadAndProcessAll(currentNavState.methodId);
        if (myRequestId !== fetchRequestId) return;
    }

    const loc = findPageForParasha(currentNavState.parashaName);
    const target = (typeof loc === 'number') ? { pageIdx: loc, lineInPage: 0 } : loc;
    currentNavState.currentColumnIndex = target.pageIdx;
    renderCurrentColumn(target.lineInPage);
}

function renderCurrentColumn(scrollToLine = 0) {
    if (paginatedColumns.length === 0) {
        document.getElementById('column-indicator').textContent = 'אין נתונים';
        return;
    }
    const columnData = paginatedColumns[currentNavState.currentColumnIndex];
    renderColumnUI(columnData);

    document.getElementById('column-indicator').textContent =
        `עמוד ${currentNavState.currentColumnIndex + 1} מתוך ${paginatedColumns.length}`;

    // גלילה: לתחילת העמוד או לשורה ספציפית (תחילת פרשה)
    const container = document.getElementById('reader-container');
    if (scrollToLine > 0) {
        const rows = container.querySelectorAll('.reader-row');
        if (rows[scrollToLine]) {
            rows[scrollToLine].scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
    }
    // ברירת מחדל: גלילה לתחילת העמוד
    container.scrollIntoView({ behavior: 'auto', block: 'start' });
    window.scrollTo({ top: 0, behavior: 'auto' });
}

document.getElementById('btn-next-col').addEventListener('click', () => {
    if (currentNavState.currentColumnIndex < paginatedColumns.length - 1) {
        currentNavState.currentColumnIndex++;
        renderCurrentColumn(0);
    }
});

document.getElementById('btn-prev-col').addEventListener('click', () => {
    if (currentNavState.currentColumnIndex > 0) {
        currentNavState.currentColumnIndex--;
        renderCurrentColumn(0);
    }
});
