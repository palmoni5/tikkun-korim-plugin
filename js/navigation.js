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
    section: 'torah', // 'torah' / 'neviim' / 'ketuvim' / 'haftarot'
    bookId: 'bereshit',
    parashaName: 'בראשית',
    methodId: 'ramah',
    tanachBookId: null,   // ספר נביאים/כתובים נבחר
    tanachChapter: 1,
    currentColumnIndex: 0,
    targetTokenIdx: -1,
    haftarahId: null,     // מזהה ההפטרה הנבחרת
    torahReadingId: null  // מזהה הקריאה לחג/מועד הנבחרת
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

// ממיר שם פרשה שמגיע מ-API של אוצריא (עם ניקוד) לשם שבו משתמש התוסף
function resolveParashaFromOtzaria(otzariaName) {
    const stripped = otzariaName.replace(/[֑-ׇ]/g, '').trim();
    // פרשות כפולות (למשל "תזריע-מצורע") - נפתח בראשונה
    const firstName = stripped.split(/[-–]/)[0].trim();
    console.log('[tikkun] resolveParashaFromOtzaria: input="' + otzariaName + '" stripped="' + stripped + '" firstName="' + firstName + '"');

    // מפה הפוכה: שם ב-kosher_dart → שם ב-TORAH_STRUCTURE
    const reverseMap = {};
    for (const [uiName, mappedName] of Object.entries(PARASHA_NAME_MAPPING)) {
        reverseMap[mappedName] = uiName;
    }
    console.log('[tikkun] reverseMap:', JSON.stringify(reverseMap));

    for (const candidate of [firstName, stripped]) {
        for (const [bookId, bookData] of Object.entries(TORAH_STRUCTURE)) {
            if (bookData.parashot.includes(candidate)) {
                console.log('[tikkun] direct match: candidate="' + candidate + '" → bookId=' + bookId);
                return { bookId, parashaName: candidate };
            }
        }
        const uiName = reverseMap[candidate];
        console.log('[tikkun] reverseMap lookup: candidate="' + candidate + '" → uiName="' + uiName + '"');
        if (uiName) {
            for (const [bookId, bookData] of Object.entries(TORAH_STRUCTURE)) {
                if (bookData.parashot.includes(uiName)) {
                    console.log('[tikkun] mapped match: candidate="' + candidate + '" → uiName="' + uiName + '" bookId=' + bookId);
                    return { bookId, parashaName: uiName };
                }
            }
        }
    }
    console.warn('[tikkun] no match found for:', otzariaName);
    return null;
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
        saveNavState();
        updateUIForSection();
        if (currentNavState.section === 'torah') {
            processedAll = null; // טעון מחדש
            navigateToCurrentParasha();
        } else if (currentNavState.section === 'haftarot') {
            populateHaftarahSelect();
            const firstId = window.HAFTAROT_LIST?.[0]?.id;
            if (firstId) {
                currentNavState.haftarahId = firstId;
                document.getElementById('select-haftarah').value = firstId;
                loadAndDisplayHaftarah();
            }
        } else if (currentNavState.section === 'torah_readings') {
            populateTorahReadingSelect();
            const land = (AppState.settings && AppState.settings.nusachLand) || 'israel';
            const list = (window.TORAH_READINGS_LIST || []).filter(r =>
                !r.land || r.land === 'both' || r.land === land);
            const firstId = list[0]?.id;
            if (firstId) {
                currentNavState.torahReadingId = firstId;
                document.getElementById('select-torah-reading').value = firstId;
                loadAndDisplayTorahReading();
            }
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
    const s = currentNavState.section;
    const isTorah = s === 'torah';
    const isHaftarot = s === 'haftarot';
    const isTorahReading = s === 'torah_readings';
    const isTanachBook = s === 'neviim' || s === 'ketuvim';
    document.getElementById('select-method').style.display = isTorah ? '' : 'none';
    document.getElementById('select-book').style.display = (isTorah || isTanachBook) ? '' : 'none';
    document.getElementById('select-parasha').style.display = isTorah ? '' : 'none';
    document.getElementById('select-aliya').style.display = isTorah ? '' : 'none';
    document.getElementById('select-chapter').style.display = isTanachBook ? '' : 'none';
    document.getElementById('select-haftarah').style.display = isHaftarot ? '' : 'none';
    document.getElementById('select-torah-reading').style.display = isTorahReading ? '' : 'none';
    if (isTorah) populateBookSelect();
    if (isTanachBook) populateTanachBookSelect();
    if (isHaftarot) populateHaftarahSelect();
    if (isTorahReading) populateTorahReadingSelect();
}

function populateTanachBookSelect() {
    if (currentNavState.section === 'torah') return;
    if (currentNavState.section === 'haftarot' || currentNavState.section === 'torah_readings') return;
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
            saveNavState();
            populateParashaSelect();
        } else {
            currentNavState.tanachBookId = e.target.value;
            currentNavState.tanachChapter = 1;
            saveNavState();
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
        saveNavState();
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
    // אופציה לעמוד אחד ארוך (כמו בנביאים/כתובים)
    const singleOpt = document.createElement('option');
    singleOpt.value = 'single_page';
    singleOpt.textContent = 'עמוד אחד ארוך';
    singleOpt.title = 'הצגת כל התורה ברצף, ללא חלוקה לעמודים';
    methodSelect.appendChild(singleOpt);

    methodSelect.value = currentNavState.methodId;
    methodSelect.addEventListener('change', (e) => {
        currentNavState.methodId = e.target.value;
        saveNavState();
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
    bookSelect.value = currentNavState.bookId;
    // onchange (לא addEventListener) - כדי שלא להתנגש עם populateTanachBookSelect
    bookSelect.onchange = (e) => {
        if (currentNavState.section === 'torah') {
            currentNavState.bookId = e.target.value;
            saveNavState();
            populateParashaSelect();
        } else {
            currentNavState.tanachBookId = e.target.value;
            currentNavState.tanachChapter = 1;
            saveNavState();
            populateChapterSelect();
            loadAndDisplayTanachBook();
        }
    };
    parashaSelect.onchange = (e) => {
        currentNavState.parashaName = e.target.value;
        saveNavState();
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
    // שמור על הפרשה הנוכחית אם היא תקפה לחומש זה, אחרת אפס לראשונה
    if (!parashot.includes(currentNavState.parashaName)) {
        currentNavState.parashaName = parashot[0];
    }
    parashaSelect.value = currentNavState.parashaName;
    populateAliyaSelect();
    navigateToCurrentParasha();
}

// המרת "42:5" לגימטריה עברית "מב, ה"
function formatVerseRefHebrew(ref) {
    const [ch, vs] = ref.split(':').map(s => parseInt(s, 10));
    return `${toHebrewNumeral(ch)}, ${toHebrewNumeral(vs)}`;
}

function formatHaftarahSegments(segments) {
    if (!segments || !segments.length) return '';
    const firstBook = segments[0].book;
    const sameBook = segments.every(s => s.book === firstBook);
    return segments.map((s, i) => {
        const range = s.from === s.to
            ? formatVerseRefHebrew(s.from)
            : `${formatVerseRefHebrew(s.from)} – ${formatVerseRefHebrew(s.to)}`;
        if (i === 0 || !sameBook) return `${s.book} ${range}`;
        return range;
    }).join('; ');
}

function populateAliyaSelect() {
    const sel = document.getElementById('select-aliya');
    if (!sel) return;
    sel.innerHTML = '';
    if (currentNavState.section !== 'torah') return;
    const bookName = TORAH_STRUCTURE[currentNavState.bookId].name;
    const normalized = normalizeParashaName(currentNavState.parashaName);
    const aliyot = (window.ALIYOT_INDEX?.[bookName]?.[currentNavState.parashaName])
                || (window.ALIYOT_INDEX?.[bookName]?.[normalized]) || [];

    // אפשרות "כל הפרשה" (לראש הפרשה)
    const allOpt = document.createElement('option');
    allOpt.value = '';
    allOpt.textContent = 'כל הפרשה';
    sel.appendChild(allOpt);

    aliyot.forEach((a, idx) => {
        const opt = document.createElement('option');
        opt.value = String(idx);
        opt.textContent = ALIYA_DISPLAY_NAMES[a.aliya] || a.aliya; // "ראשון", "שני", ...
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
    const aliyot = (window.ALIYOT_INDEX?.[bookName]?.[currentNavState.parashaName])
                || (window.ALIYOT_INDEX?.[bookName]?.[normalized]) || [];
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
    // norm: מסיר ניקוד, מקפים, ותווי PUA של זעירא/רבתי (U+E020-E023)
    const norm = (s) => s
        .replace(/[֑-ׇ־]/g, '')
        .replace(/[-]/g, '')
        .replace(/יקוק/g, 'יהוה');
    const normWords = words.map(norm);
    for (let i = fromIdx; i < tokens.length - words.length; i++) {
        if (tokens[i].type !== 'word') continue;
        let wIdx = 0, tIdx = i, ok = true;
        while (wIdx < normWords.length && tIdx < tokens.length) {
            const tok = tokens[tIdx];
            if (tok.type !== 'word') { tIdx++; continue; }
            const searchWord = normWords[wIdx];
            const tokenWord = norm(tok.value);
            if (tokenWord === searchWord) {
                wIdx++; tIdx++;
            } else if (searchWord.startsWith(tokenWord)) {
                // מילת החיפוש היא חיבור של כמה טוקנים שהיו מחוברים במקף
                // (למשל "אתהמשכן" = "את" + "המשכן" בטקסט המקורי)
                let built = tokenWord;
                tIdx++;
                while (built.length < searchWord.length && tIdx < tokens.length) {
                    const next = tokens[tIdx];
                    if (next.type !== 'word') { tIdx++; continue; }
                    built += norm(next.value);
                    tIdx++;
                    if (built === searchWord) break;
                    if (!searchWord.startsWith(built)) break;
                }
                if (built === searchWord) { wIdx++; } else { ok = false; break; }
            } else {
                ok = false; break;
            }
        }
        if (ok && wIdx === normWords.length) return i;
    }
    return -1;
}

// המרה מגימטריה עברית למספר (תומך בגרשיים: ט"ו, ט"ז וכו')
function gematriaToNumber(letters) {
    const values = {
        'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
        'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
        'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
        'ך': 20, 'ם': 40, 'ן': 50, 'ף': 80, 'ץ': 90
    };
    let total = 0;
    for (const ch of letters) {
        if (values[ch]) total += values[ch];
    }
    return total;
}

// ניקוי טקסט גולמי - מוציא חלקים שלא רלוונטיים
function cleanRawText(rawText) {
    // לפני הסרת תגיות - חילוץ סימוני פרקים (<h2>פרק X</h2>) ופסוקים ((אות))
    // והחלפתם ב-markers שלא יפוצלו על-ידי הפיצול הבא.
    rawText = rawText.replace(/<h2[^>]*>פרק\s+([א-ת"׳]+)\s*<\/h2>/gi, function(m, hLetters) {
        const cleanLetters = hLetters.replace(/["׳]/g, '');
        const n = gematriaToNumber(cleanLetters);
        return n > 0 ? ` CHAPTERMARK${n}MARK ` : ' ';
    });

    // הסרת שאר כותרות h1/h2/h3 כולל תוכן (אחרי שחילצנו את ה-h2 של הפרקים)
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
    // <big>X</big> - אם עברי, סמן כאות רבתי. תווי PUA: U+E022 התחלה, U+E023 סוף
    rawText = rawText.replace(/<big[^>]*>([\s\S]*?)<\/big>/g, (m, content) => {
        if (/[א-ת]/.test(content)) {
            return '' + content + '';
        }
        return content;
    });
    // <small>X</small> - אם עברי, סמן כאות זעירא. תווי PUA: U+E020 התחלה, U+E021 סוף
    rawText = rawText.replace(/<small[^>]*>([\s\S]*?)<\/small>/g, (m, content) => {
        if (/[א-ת]/.test(content)) {
            return '' + content + '';
        }
        return content;
    });
    // טיפול במבני HTML של כתיב/קרי באוצריא (mam-kq classes) - חייב להיות לפני הסרת תגיות.
    // U+E010 = start, U+E011 = middle (separator), U+E012 = end. כתיב או קרי ריקים אפשריים.
    // 0) זוג בסדר ההפוך: <span class="mam-kq-k">(כתיב)</span> <span class="mam-kq-q">[קרי]</span>
    rawText = rawText.replace(
        /<span[^>]*class="mam-kq-k"[^>]*>\(([^<()]+)\)[־]?<\/span>\s*<span[^>]*class="mam-kq-q"[^>]*>\[([^<\[\]]+)\]<\/span>/g,
        function(m, ketiv, qere) {
            var k = ketiv.trim().replace(/\s+/g, '').replace(/־/g, '');
            var q = qere.trim().replace(/\s+/g, '').replace(/־/g, '');
            return ' ' + k + '' + q + ' ';
        }
    );
    // 1) זוג כתיב+קרי: <span class="mam-kq-q">[קרי]</span> <span class="mam-kq-k">(כתיב)</span>
    rawText = rawText.replace(
        /<span[^>]*class="mam-kq-q"[^>]*>\[([^<\[\]]+)\]<\/span>\s*<span[^>]*class="mam-kq-k"[^>]*>\(([^<()]+)\)[־]?<\/span>/g,
        function(m, qere, ketiv) {
            var k = ketiv.trim().replace(/\s+/g, '').replace(/־/g, '');
            var q = qere.trim().replace(/\s+/g, '').replace(/־/g, '');
            return ' ' + k + '' + q + ' ';
        }
    );
    // 2) כתיב לבד (כתיב ולא קרי)
    rawText = rawText.replace(
        /<span[^>]*class="mam-kq-k"[^>]*>\(([^<()]+)\)[־]?<\/span>/g,
        function(m, ketiv) {
            var k = ketiv.trim().replace(/\s+/g, '').replace(/־/g, '');
            return ' ' + k + ' ';
        }
    );
    // 3) קרי לבד (קרי ולא כתיב)
    rawText = rawText.replace(
        /<span[^>]*class="mam-kq-q"[^>]*>\[([^<\[\]]+)\]<\/span>/g,
        function(m, qere) {
            var q = qere.trim().replace(/\s+/g, '').replace(/־/g, '');
            return ' ' + q + ' ';
        }
    );
    // <br> -> רווח
    rawText = rawText.replace(/<br\s*\/?>/gi, ' ');
    // הסרת שאר תגיות
    rawText = rawText.replace(/<[^>]*>?/gm, ' ');

    // פענוח HTML entities
    const decoder = document.createElement('textarea');
    decoder.innerHTML = rawText;
    rawText = decoder.value;

    // נורמליזציה: ׇ (U+05C7 קמץ קטן) -> ָ (U+05B8 קמץ רגיל)
    // הפונטים שלנו לא תומכים טוב ב-קמץ קטן וגורמים ל-font fallback של ה-כ ועוד אותיות.
    rawText = rawText.replace(/ׇ/g, 'ָ');

    // זיהוי "רווח ויזואלי" בטקסט אוצריא: רצף של 4+ NBSP (U+00A0) מסמן
    // הפסקה בין חלקי פסוק (משמש בעיקר בשירות כמו האזינו, הים). מסומנים
    // כ-SEGBREAKMARK שיתורגם ל-token segment_break ב-tokenizeText.
    rawText = rawText.replace(/ {4,}/g, ' SEGBREAKMARK ');

    // כתיב/קרי: (כתיב) [קרי] -> markers מיוחדים שלא מתפרקים
    // U+E010 = start, U+E011 = middle, U+E012 = end
    rawText = rawText.replace(
        /\(([^()\[\]]+?)\)(?:\s|&nbsp;|&thinsp;)*\[([^()\[\]]+?)\]/g,
        function(m, ketiv, qere) {
            var k = ketiv.trim().replace(/\s+/g, '').replace(/־/g, '');
            var q = qere.trim().replace(/\s+/g, '').replace(/־/g, '');
            return ' ' + k + '' + q + ' ';
        }
    );
    // הסדר ההפוך באוצריא: [קרי] (כתיב). מבטיחים שהתוכן ארוך מ-1 תו
    // (כדי לא לתפוס [פ] / [ס] / סימני פסוקים בודדים)
    rawText = rawText.replace(
        /\[([^()\[\]]{2,}?)\](?:\s|&nbsp;|&thinsp;)*\(([^()\[\]]{2,}?)\)/g,
        function(m, qere, ketiv) {
            var k = ketiv.trim().replace(/\s+/g, '').replace(/־/g, '');
            var q = qere.trim().replace(/\s+/g, '').replace(/־/g, '');
            return ' ' + k + '' + q + ' ';
        }
    );
    // המרת סימוני פסוקים (א),(ב) ל-markers (שמירת {פ}/{ס})
    rawText = rawText.replace(/\(([א-ת"׳]+)\)/g, function(match, inner) {
        if (inner === 'פ' || inner === 'ס') return match;
        const cleanLetters = inner.replace(/["׳]/g, '');
        const n = gematriaToNumber(cleanLetters);
        return n > 0 ? ` VERSEMARK${n}MARK ` : ' ';
    });
    // המרת מקף עברי לרווח
    rawText = rawText.replace(/־/g, ' ');
    // איחוד רווחים
    rawText = rawText.replace(/\s+/g, ' ').trim();
    return rawText;
}

// פונקציית טעינה משותפת עם retry ודיבוג.
// מחזירה { text, complete, aborted }:
//   text     - הטקסט שנטען (יכול להיות חלקי אם complete=false)
//   complete - true אם הספר נטען במלואו
//   aborted  - true אם הופסק בגלל fetchRequestId חדש (requestId != null בלבד)
async function fetchBookContentRaw(bookApiName, requestId) {
    const limit = 5000;
    const MAX_ITER = 500;
    const MAX_RETRIES = 3;
    let rawText = '';
    let offset = 0;
    let iter = 0;
    console.log(`[tikkun] start loading: ${bookApiName}`);

    while (iter++ < MAX_ITER) {
        if (requestId != null && requestId !== fetchRequestId) {
            console.log(`[tikkun] aborted: ${bookApiName} (request superseded)`);
            return { text: rawText, complete: false, aborted: true };
        }

        let chunk = null;
        for (let retry = 0; retry < MAX_RETRIES; retry++) {
            try {
                const res = await window.Otzaria.call('library.getBookContent', {
                    bookId: bookApiName, offset, limit
                });
                if (requestId != null && requestId !== fetchRequestId) {
                    return { text: rawText, complete: false, aborted: true };
                }
                if (res.success && res.data) {
                    chunk = (typeof res.data === 'string') ? res.data : JSON.stringify(res.data);
                    if (retry > 0) console.log(`[tikkun] retry ${retry} succeeded: ${bookApiName} offset=${offset}`);
                    break;
                }
                console.warn(`[tikkun] chunk fail (try ${retry + 1}/${MAX_RETRIES}) ${bookApiName} offset=${offset}:`, res.error);
            } catch (e) {
                console.warn(`[tikkun] chunk error (try ${retry + 1}/${MAX_RETRIES}) ${bookApiName} offset=${offset}:`, e.message || e);
            }
        }

        if (chunk === null) {
            console.error(`[tikkun] TRUNCATED: ${bookApiName} failed at offset=${offset} after ${MAX_RETRIES} retries. Loaded ${rawText.length} chars so far.`);
            return { text: rawText, complete: false, aborted: false };
        }

        rawText += chunk;
        if (chunk.length < limit) {
            console.log(`[tikkun] fully loaded: ${bookApiName} — ${rawText.length} chars total`);
            return { text: rawText, complete: true, aborted: false };
        }
        offset += limit;
    }

    console.warn(`[tikkun] MAX_ITER reached for ${bookApiName}, treating as complete (${rawText.length} chars)`);
    return { text: rawText, complete: true, aborted: false };
}

// טוען חומש מלא מ-bridge, עם cache
async function fetchFullBook(bookId) {
    if (TorahBookCache[bookId]) return TorahBookCache[bookId];
    const bookName = TORAH_STRUCTURE[bookId].name;
    const { text, complete } = await fetchBookContentRaw(bookName, null);
    if (complete) TorahBookCache[bookId] = text;
    return text;
}

// עזר: yield לאירועי דפדפן (לחיצות, scroll וכו') בין שלבי עיבוד כבדים.
// בלעדיו, ה-event loop חסום עד סוף הפונקציה והתפריטים נראים תקועים.
function yieldToUi() {
    return new Promise(r => setTimeout(r, 0));
}

// טעון את כל ספרי התורה ועיבוד מלא.
// משתמש ב-fetchRequestId הקיים (לא מגדיל אותו!) - כך שהקורא יוכל לוודא
// שהתוצאה עדיין רלוונטית בלי שנפריע ל-counter שלו.
async function loadAndProcessAll(methodId) {
    const myRequestId = fetchRequestId; // לא ++; נצפה לערך הנוכחי
    document.getElementById('reader-container').innerHTML =
        '<div style="text-align:center; padding: 40px;">טוען...</div>';
    window._currentHeader = null;

    const t0 = performance.now();

    const allRaw = await Promise.all(
        BOOKS_ORDER.map(bookId => fetchFullBook(bookId).then(text => {
            console.log(`[tikkun] loaded ${bookId}: ${text.length} chars`);
            return text;
        }))
    );
    if (myRequestId !== fetchRequestId) return null;

    await yieldToUi();

    // מעבד כל חומש בנפרד כדי לסמן בו קטעים מיוחדים (שירות) לפי שם הספר.
    // yield אחרי כל ספר כדי לא לחסום את ה-UI.
    const tokens = [];
    for (let i = 0; i < BOOKS_ORDER.length; i++) {
        const bookId = BOOKS_ORDER[i];
        const bookName = TORAH_STRUCTURE[bookId].name;
        const cleaned = cleanRawText(allRaw[i]);
        let bookTokens = window.PageLayoutEngine.tokenizeText(cleaned);
        if (window.SpecialLayouts) {
            bookTokens = window.SpecialLayouts.markSpecialSections(bookTokens, bookName);
        }
        if (i > 0) tokens.push({ type: 'book_break' });
        tokens.push(...bookTokens);
        await yieldToUi();
        if (myRequestId !== fetchRequestId) return null;
    }

    const bookStartTokenIdx = computeBookStartIndices(tokens);
    console.log(`[tikkun] book starts:`, bookStartTokenIdx);

    const isSinglePage = methodId === 'single_page';
    const layout = isSinglePage ? null : window.TORAH_LAYOUTS[methodId];
    const maxLines = isSinglePage ? Infinity : layout.linesPerPage;

    await yieldToUi();
    if (myRequestId !== fetchRequestId) return null;

    const allLines = window.PageLayoutEngine.paginateAllTokens(tokens, 36);
    console.log(`[tikkun] lines: ${allLines.length}, pages: ~${isSinglePage ? 1 : Math.ceil(allLines.length / maxLines)}`);

    await yieldToUi();
    if (myRequestId !== fetchRequestId) return null;

    annotateAliyotOnLines(tokens, allLines, bookStartTokenIdx);

    await yieldToUi();
    if (myRequestId !== fetchRequestId) return null;

    const pages = [];
    if (isSinglePage) {
        pages.push({
            startLineIdx: 0,
            endLineIdx: allLines.length,
            lines: allLines
        });
    } else {
        for (let i = 0; i < allLines.length; i += maxLines) {
            pages.push({
                startLineIdx: i,
                endLineIdx: Math.min(i + maxLines, allLines.length),
                lines: allLines.slice(i, i + maxLines)
            });
        }
    }

    processedAll = { tokens, allLines, pages, bookStartTokenIdx };
    paginatedColumns = pages.map(p => p.lines);

    console.log(`[tikkun] done in ${Math.round((performance.now() - t0) / 1000)}s`);
    return processedAll;
}

// המרת "עליה א" -> "ראשון" וכו' לתצוגה הקריאה
const ALIYA_DISPLAY_NAMES = {
    'עליה א': 'ראשון',
    'עליה ב': 'שני',
    'עליה ג': 'שלישי',
    'עליה ד': 'רביעי',
    'עליה ה': 'חמישי',
    'עליה ו': 'ששי',
    'עליה ז': 'שביעי',
    'מפטיר': 'מפטיר'
};

// עוברים על כל הפרשיות בתורה, ומוצאים את השורה שבה מתחילה כל פרשה ועליה.
// מסמנים `aliyaName` לתחילת עליה ו-`parashaName` לתחילת פרשה.
function annotateAliyotOnLines(tokens, allLines, bookStartTokenIdx) {
    // עזר - מציאת אינדקס השורה שמכילה טוקן מסוים
    const findLineForToken = (tokenIdx) => {
        for (let lineIdx = 0; lineIdx < allLines.length; lineIdx++) {
            const thisStart = allLines[lineIdx].startTokenIdx;
            const nextStart = (lineIdx + 1 < allLines.length)
                ? allLines[lineIdx + 1].startTokenIdx
                : Infinity;
            if (thisStart >= 0 && tokenIdx >= thisStart && tokenIdx < nextStart) {
                return lineIdx;
            }
        }
        return -1;
    };

    for (const bookId of BOOKS_ORDER) {
        const bookName = TORAH_STRUCTURE[bookId].name;
        const parashot = TORAH_STRUCTURE[bookId].parashot;
        const bookStart = bookStartTokenIdx[bookId] || 0;

        let searchFrom = bookStart;
        for (const parashaName of parashot) {
            const normalized = normalizeParashaName(parashaName);
            const parashaTokenIdx = window.findParashaStart
                ? window.findParashaStart(tokens, normalized, searchFrom)
                : -1;
            const parashaStart = parashaTokenIdx >= 0 ? parashaTokenIdx : searchFrom;

            // סימון שורת תחילת פרשה
            const parashaLineIdx = findLineForToken(parashaStart);
            if (parashaLineIdx >= 0 && !allLines[parashaLineIdx].parashaName) {
                allLines[parashaLineIdx].parashaName = parashaName;
            }

            const aliyot = (window.ALIYOT_INDEX?.[bookName]?.[parashaName])
                        || (window.ALIYOT_INDEX?.[bookName]?.[normalized]) || [];
            let aliyaSearchFrom = parashaStart;
            for (const a of aliyot) {
                const aliyaTokenIdx = findWordSequence(tokens, a.words, aliyaSearchFrom);
                if (aliyaTokenIdx < 0) continue;
                const aliyaLineIdx = findLineForToken(aliyaTokenIdx);
                if (aliyaLineIdx >= 0 && !allLines[aliyaLineIdx].aliyaName) {
                    allLines[aliyaLineIdx].aliyaName = ALIYA_DISPLAY_NAMES[a.aliya] || a.aliya;
                    // שמירה גם של שם העליה המקורי (לעדכון select-aliya)
                    allLines[aliyaLineIdx].aliyaIdx = aliyot.indexOf(a);
                }
                aliyaSearchFrom = aliyaTokenIdx + 1;
            }
            searchFrom = parashaStart + 1;
        }
    }
}

// === נביאים וכתובים ===
const TanachCache = {}; // bookId -> { rawText, chapters: [{ num, lineIdx }] }

async function loadAndDisplayTanachBook() {
    const myRequestId = ++fetchRequestId;
    document.getElementById('reader-container').innerHTML =
        '<div style="text-align:center; padding: 40px;">טוען...</div>';
    window._currentHeader = null;

    const book = window.TANACH_SECTIONS[currentNavState.section].books
        .find(b => b.id === currentNavState.tanachBookId);
    if (!book) return;

    let processed = TanachCache[book.id];
    if (!processed) {
        const { text: rawText, complete, aborted } = await fetchBookContentRaw(book.name, myRequestId);
        if (aborted || myRequestId !== fetchRequestId) return;
        if (!complete) console.warn(`[tikkun] Tanach book may be truncated: ${book.name}`);

        // ניקוי - cleanRawText כבר ממיר h2 ל-CHAPTERMARK ו-(אות) ל-VERSEMARK
        const cleaned = cleanRawText(rawText);
        let tokens = window.PageLayoutEngine.tokenizeText(cleaned);
        if (window.SpecialLayouts) {
            tokens = window.SpecialLayouts.markSpecialSections(tokens, book.name);
        }
        const allLines = window.PageLayoutEngine.paginateAllTokens(tokens, 36);

        // איתור באיזו שורה מתחיל כל פרק - לפי firstChapterNum של השורות
        const chapterToLineIdx = {};
        for (let lineIdx = 0; lineIdx < allLines.length; lineIdx++) {
            const ch = allLines[lineIdx].firstChapterNum;
            if (ch != null && chapterToLineIdx[ch] === undefined) {
                chapterToLineIdx[ch] = lineIdx;
            }
        }

        processed = { rawText, tokens, allLines, chapterToLineIdx };
        if (complete) TanachCache[book.id] = processed; // שמור רק אם נטען במלואו
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
    if (!map) {
        console.warn('[tikkun] no chapter map');
        return;
    }
    const lineIdx = map[chapterNum];
    if (typeof lineIdx !== 'number') {
        console.warn('[tikkun] chapter', chapterNum, 'not in map', map);
        return;
    }
    const container = document.getElementById('reader-container');
    if (!container) return;
    const rows = container.querySelectorAll('.reader-row');
    if (!rows[lineIdx]) {
        console.warn('[tikkun] row', lineIdx, 'not found, total rows:', rows.length);
        return;
    }
    // חישוב מיקום הגלילה באמצעות getBoundingClientRect (יותר אמין
    // משימוש ב-offsetTop, שעלול להתבסס על offsetParent שונה).
    const rowRect = rows[lineIdx].getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const scrollTarget = container.scrollTop + (rowRect.top - containerRect.top);
    container.scrollTo({ top: scrollTarget, behavior: 'smooth' });
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

    // שימוש בסימוני parashaName שחושבו ב-annotateAliyotOnLines —
    // כל שורת תחילת פרשה כבר מסומנת, כך שאין צורך לחפש מחדש ב-tokens
    // (חיפוש ב-tokens מתחיל מתחילת החומש ועלול לתפוס מופע קודם של אותה מילה).
    const lines = processedAll.allLines;
    let foundLineIdx = -1;
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        if (lines[lineIdx].parashaName === parashaName) {
            foundLineIdx = lineIdx;
            break;
        }
    }

    if (foundLineIdx < 0) {
        console.warn(`Parasha ${parashaName} not found in annotated lines`);
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
        const result = await loadAndProcessAll(currentNavState.methodId);
        if (myRequestId !== fetchRequestId) return;
        if (!result) return; // טעינה הופסקה בידי בקשה מאוחרת
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
    // ה-body הוגדר overflow:hidden, אז הגלילה היא בתוך ה-container עצמו.
    const container = document.getElementById('reader-container');
    if (scrollToLine > 0) {
        const rows = container.querySelectorAll('.reader-row');
        if (rows[scrollToLine]) {
            const offsetWithinContainer = rows[scrollToLine].offsetTop - container.offsetTop;
            container.scrollTo({ top: offsetWithinContainer, behavior: 'smooth' });
            return;
        }
    }
    // ברירת מחדל: גלילה לתחילת העמוד החדש
    container.scrollTop = 0;
}

document.getElementById('btn-next-col').addEventListener('click', () => {
    if (currentNavState.currentColumnIndex < paginatedColumns.length - 1) {
        currentNavState.currentColumnIndex++;
        renderCurrentColumn(0);
        saveNavState();
        setTimeout(syncSelectsToScrollPosition, 0);
    }
});

document.getElementById('btn-prev-col').addEventListener('click', () => {
    if (currentNavState.currentColumnIndex > 0) {
        currentNavState.currentColumnIndex--;
        renderCurrentColumn(0);
        saveNavState();
        setTimeout(syncSelectsToScrollPosition, 0);
    }
});

// =================================================================
// === סנכרון תפריטי הניווט לפי מיקום הגלילה ===
// =================================================================

// מוצא את אינדקס השורה הגלויה ב-container לפי offset נתון (לזיהוי מיקום בתפריטים)
function getFirstVisibleLineIndex(rowOffset = 4) {
    const container = document.getElementById('reader-container');
    if (!container) return -1;
    const rows = container.querySelectorAll('.reader-row');
    const scrollTop = container.scrollTop;
    const containerTop = container.offsetTop;
    let found = 0;
    for (let i = 0; i < rows.length; i++) {
        const rowTop = rows[i].offsetTop - containerTop;
        if (rowTop + rows[i].offsetHeight > scrollTop + 4) {
            if (found >= rowOffset) return i;
            found++;
        }
    }
    return rows.length - 1;
}

// מתרגם line index -> מספר פרק (לפי המפה של תנ"ך)
function lineIdxToChapter(lineIdx) {
    const map = window._currentTanachChapterMap;
    if (!map) return null;
    let lastCh = null;
    const sortedChapters = Object.keys(map).map(Number).sort((a, b) => a - b);
    for (const ch of sortedChapters) {
        if (map[ch] <= lineIdx) lastCh = ch;
        else break;
    }
    return lastCh;
}

// listener על גלילה ב-container - מעדכן את התפריטים העליונים
let _scrollSyncRaf = 0;
const _readerContainer = document.getElementById('reader-container');
if (_readerContainer) {
    _readerContainer.addEventListener('scroll', () => {
        if (_scrollSyncRaf) return;
        _scrollSyncRaf = requestAnimationFrame(() => {
            _scrollSyncRaf = 0;
            syncSelectsToScrollPosition();
        });
    });
}

function syncSelectsToScrollPosition() {
    const section = currentNavState.section;
    const lineIdx = getFirstVisibleLineIndex();
    if (lineIdx < 0) return;

    if (section === 'neviim' || section === 'ketuvim') {
        const ch = lineIdxToChapter(lineIdx);
        if (ch && ch !== currentNavState.tanachChapter) {
            currentNavState.tanachChapter = ch;
            const sel = document.getElementById('select-chapter');
            if (sel) sel.value = String(ch);
            saveNavState();
        }
    } else if (section === 'torah' && processedAll) {
        // עמוד תורה: זיהוי חומש, פרשה ועליה לפי השורה הגלויה
        const pageStartLineIdx = processedAll.pages[currentNavState.currentColumnIndex]?.startLineIdx || 0;
        const globalLineIdx = pageStartLineIdx + lineIdx;
        const line = processedAll.allLines[globalLineIdx];
        if (!line || line.startTokenIdx < 0) return;

        // זיהוי חומש: ה-book שתחילתו <= startTokenIdx
        const bookStarts = processedAll.bookStartTokenIdx || {};
        let curBook = null;
        for (const bookId of BOOKS_ORDER) {
            const start = bookStarts[bookId];
            if (start != null && start <= line.startTokenIdx) curBook = bookId;
            else break;
        }
        if (curBook && curBook !== currentNavState.bookId) {
            currentNavState.bookId = curBook;
            const bs = document.getElementById('select-book');
            if (bs) bs.value = curBook;
            // עדכון בורר הפרשות לחומש החדש (בלי לטעון מחדש - רק תצוגה)
            const parashaSelect = document.getElementById('select-parasha');
            parashaSelect.innerHTML = '';
            for (const p of TORAH_STRUCTURE[curBook].parashot) {
                const opt = document.createElement('option');
                opt.value = p;
                opt.textContent = p;
                parashaSelect.appendChild(opt);
            }
        }

        // זיהוי פרשה: חיפוש לאחור עד שמוצאים שורה עם parashaName
        let curParasha = null;
        for (let j = globalLineIdx; j >= 0; j--) {
            if (processedAll.allLines[j]?.parashaName) {
                curParasha = processedAll.allLines[j].parashaName;
                break;
            }
        }
        if (curParasha && curParasha !== currentNavState.parashaName) {
            currentNavState.parashaName = curParasha;
            const ps = document.getElementById('select-parasha');
            if (ps) ps.value = curParasha;
            // עדכון בורר העליות לפרשה החדשה (בלי לטעון מחדש)
            populateAliyaSelectQuiet();
            saveNavState();
        }

        // זיהוי עליה: חיפוש לאחור עד שמוצאים aliyaIdx, רק בתוך אותה פרשה
        let curAliyaIdx = null;
        for (let j = globalLineIdx; j >= 0; j--) {
            const l = processedAll.allLines[j];
            if (!l) continue;
            if (l.parashaName && l.parashaName !== curParasha) break; // עזיבת הפרשה
            if (l.aliyaIdx != null) {
                curAliyaIdx = l.aliyaIdx;
                break;
            }
        }
        const aliyaSel = document.getElementById('select-aliya');
        if (aliyaSel) {
            const newVal = curAliyaIdx != null ? String(curAliyaIdx) : '';
            if (aliyaSel.value !== newVal) aliyaSel.value = newVal;
        }
    }
}

// בונה את select-aliya לפי הפרשה הנוכחית בלי לקרוא ל-navigate (לסנכרון בלבד)
function populateAliyaSelectQuiet() {
    const sel = document.getElementById('select-aliya');
    if (!sel) return;
    sel.innerHTML = '';
    const bookName = TORAH_STRUCTURE[currentNavState.bookId].name;
    const normalized = normalizeParashaName(currentNavState.parashaName);
    const aliyot = (window.ALIYOT_INDEX?.[bookName]?.[currentNavState.parashaName])
                || (window.ALIYOT_INDEX?.[bookName]?.[normalized]) || [];
    const allOpt = document.createElement('option');
    allOpt.value = '';
    allOpt.textContent = 'כל הפרשה';
    sel.appendChild(allOpt);
    aliyot.forEach((a, idx) => {
        const opt = document.createElement('option');
        opt.value = String(idx);
        opt.textContent = ALIYA_DISPLAY_NAMES[a.aliya] || a.aliya;
        sel.appendChild(opt);
    });
}

// =================================================================
// === הפטרות ===
// =================================================================

// בניית select של הפטרות (פרשיות + מיוחדות בקבוצות optgroup)
function populateHaftarahSelect() {
    const sel = document.getElementById('select-haftarah');
    if (!sel) return;
    const list = window.HAFTAROT_LIST || [];
    sel.innerHTML = '';

    const groupParasha = document.createElement('optgroup');
    groupParasha.label = 'הפטרות פרשיות';
    const groupSpecial = document.createElement('optgroup');
    groupSpecial.label = 'שבתות מיוחדות וחגים';

    for (const h of list) {
        const opt = document.createElement('option');
        opt.value = h.id;
        opt.textContent = h.name;
        if (h.category === 'parasha') groupParasha.appendChild(opt);
        else groupSpecial.appendChild(opt);
    }
    sel.appendChild(groupParasha);
    sel.appendChild(groupSpecial);

    if (currentNavState.haftarahId) {
        sel.value = currentNavState.haftarahId;
    } else if (list.length > 0) {
        currentNavState.haftarahId = list[0].id;
        sel.value = list[0].id;
    }
    sel.onchange = (e) => {
        currentNavState.haftarahId = e.target.value;
        saveNavState();
        loadAndDisplayHaftarah();
    };
}

// בחירת הקטעים הרלוונטיים לפי הנוסח שנבחר (ברירת מחדל: אשכנזי)
function getHaftarahSegments(haftarah) {
    const nusach = (AppState && AppState.settings && AppState.settings.nusach) || 'ashkenaz';
    const segs = nusach === 'sephard' ? haftarah.sephard : haftarah.ashkenaz;
    return segs || haftarah.ashkenaz || [];
}

function compareVerse(ch1, vs1, ch2, vs2) {
    if (ch1 !== ch2) return ch1 - ch2;
    return vs1 - vs2;
}

// חיתוך טוקנים לפי טווח פסוקים מדויק (לפני pagination).
// מחזיר תת-מערך של tokens שמכיל בדיוק את הפסוקים בטווח, עם chapter_break בתחילה.
function sliceTokensByVerseRange(tokens, fromCh, fromVs, toCh, toVs) {
    let curCh = null, curVs = null;
    let startIdx = -1, endIdx = -1;

    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (t.type === 'chapter_break') {
            curCh = t.chapterNum;
            curVs = null;
            continue;
        }
        if (t.type === 'verse_break') {
            curVs = t.verseNum;
            if (curCh == null) continue; // הגנה במקרה קצה

            if (startIdx === -1 && compareVerse(curCh, curVs, fromCh, fromVs) >= 0) {
                startIdx = i;
            }
            if (startIdx !== -1 && compareVerse(curCh, curVs, toCh, toVs) > 0) {
                endIdx = i;
                break;
            }
        }
    }

    if (startIdx === -1) return [];
    if (endIdx === -1) endIdx = tokens.length;

    // נחזיר slice עם chapter_break מקדים כדי שה-pagination ידע באיזה פרק להתחיל
    const slice = tokens.slice(startIdx, endIdx);
    return [{ type: 'chapter_break', chapterNum: fromCh }, ...slice];
}

// טעינת ספר הנביא/כתוב המכיל את הפטרה (תוך שימוש ב-TanachCache)
async function loadTanachBookByName(bookName, requestId) {
    // חיפוש ב-cache לפי שם הספר
    const allBooks = [...(window.TANACH_NEVIIM || []), ...(window.TANACH_KETUVIM || [])];
    const book = allBooks.find(b => b.name === bookName);
    if (!book) {
        console.error('Book not found in tanach structure:', bookName);
        return null;
    }
    if (TanachCache[book.id]) return TanachCache[book.id];

    const { text: rawText, complete, aborted } = await fetchBookContentRaw(book.name, requestId);
    if (aborted) return null;
    if (!complete) console.warn(`[tikkun] Tanach book (haftarah) may be truncated: ${book.name}`);

    const cleaned = cleanRawText(rawText);
    let tokens = window.PageLayoutEngine.tokenizeText(cleaned);
    if (window.SpecialLayouts) {
        tokens = window.SpecialLayouts.markSpecialSections(tokens, book.name);
    }
    const allLines = window.PageLayoutEngine.paginateAllTokens(tokens, 36);
    const chapterToLineIdx = {};
    for (let lineIdx = 0; lineIdx < allLines.length; lineIdx++) {
        const ch = allLines[lineIdx].firstChapterNum;
        if (ch != null && chapterToLineIdx[ch] === undefined) {
            chapterToLineIdx[ch] = lineIdx;
        }
    }
    const processed = { rawText, tokens, allLines, chapterToLineIdx };
    if (complete) TanachCache[book.id] = processed; // שמור רק אם נטען במלואו
    return processed;
}

async function loadAndDisplayHaftarah() {
    const myRequestId = ++fetchRequestId;
    const container = document.getElementById('reader-container');
    container.innerHTML = '<div style="text-align:center; padding: 40px;">טוען...</div>';

    const id = currentNavState.haftarahId;
    const haftarah = (window.HAFTAROT_LIST || []).find(h => h.id === id);
    if (!haftarah) {
        container.innerHTML = '<div style="text-align:center; padding: 40px;">הפטרה לא נמצאה.</div>';
        return;
    }
    const segs = getHaftarahSegments(haftarah);
    if (!segs.length) {
        container.innerHTML = '<div style="text-align:center; padding: 40px;">אין הפטרה מוגדרת.</div>';
        return;
    }

    // עבור כל קטע - טען את הספר וחתוך טוקנים מדויקים לטווח הפסוקים
    let combinedTokens = [];
    for (let sIdx = 0; sIdx < segs.length; sIdx++) {
        const seg = segs[sIdx];
        const processed = await loadTanachBookByName(seg.book, myRequestId);
        if (myRequestId !== fetchRequestId) return;
        if (!processed) continue;

        const [fromCh, fromVs] = seg.from.split(':').map(s => parseInt(s, 10));
        const [toCh, toVs] = seg.to.split(':').map(s => parseInt(s, 10));
        const tokenSlice = sliceTokensByVerseRange(processed.tokens, fromCh, fromVs, toCh, toVs);

        if (sIdx > 0) {
            // הפסקה בין קטעי הפטרה מפוצלת (petucha = ירידת שורה ללא יישור)
            combinedTokens.push({ type: 'petucha' });
        }
        combinedTokens = combinedTokens.concat(tokenSlice);
    }

    if (myRequestId !== fetchRequestId) return;

    // עיבוד הטוקנים לשורות (חדשות, מדויקות לטווח)
    const combinedLines = window.PageLayoutEngine.paginateAllTokens(combinedTokens, 36);

    // השורה האחרונה של הפטרה - לא להפעיל יישור מלא (justify),
    // כך שסיום הפטרה יוכל להיגמר באמצע שורה בלי "מריחה" עד הסוף.
    if (combinedLines.length > 0) {
        combinedLines[combinedLines.length - 1].layout = 'petucha';
    }

    paginatedColumns = [combinedLines];
    currentNavState.currentColumnIndex = 0;
    processedAll = null;
    window._currentTanachChapterMap = null;

    // הגדרת כותרת ההפטרה לפי הנוסח הנבחר
    window._currentHeader = {
        title: haftarah.name,
        subtitle: 'הפטרה: ' + formatHaftarahSegments(segs)
    };

    renderCurrentColumn();
}

// =================================================================
// === קריאות התורה לחגים/מועדים/ר"ח/חנוכה/שבתות מיוחדות ===
// =================================================================

function populateTorahReadingSelect() {
    const sel = document.getElementById('select-torah-reading');
    if (!sel) return;
    const rawList = window.TORAH_READINGS_LIST || [];
    // סינון לפי מנהג (א"י/חו"ל) - 'both' נשאר תמיד.
    // AppState הוא const ב-app.js, אז ניגשים אליו ישירות (לא דרך window).
    const land = (typeof AppState !== 'undefined' && AppState.settings && AppState.settings.nusachLand) || 'israel';
    const list = rawList.filter(r => !r.land || r.land === 'both' || r.land === land);
    const categories = window.TORAH_READINGS_CATEGORIES || {};
    sel.innerHTML = '';

    // קיבוץ לפי קטגוריה (סדר לפי בקשת המשתמש):
    // ר"ח, פסח, שבועות, תשעה באב, ר"ה, יו"כ, סוכות, חנוכה, פורים, שבתות מיוחדות, תעניות
    const catOrder = ['roshChodesh','pesach','shavuot','roshHashana','yomKippur',
                      'sukkot','chanukah','purim','specialShabbat','fast','modern','other'];
    for (const cat of catOrder) {
        const items = list.filter(h => h.category === cat);
        if (!items.length) continue;
        const grp = document.createElement('optgroup');
        grp.label = categories[cat] || cat;
        for (const h of items) {
            const opt = document.createElement('option');
            opt.value = h.id;
            opt.textContent = h.name;
            grp.appendChild(opt);
        }
        sel.appendChild(grp);
    }

    if (currentNavState.torahReadingId) {
        sel.value = currentNavState.torahReadingId;
    } else if (list.length > 0) {
        currentNavState.torahReadingId = list[0].id;
        sel.value = list[0].id;
    }
    sel.onchange = (e) => {
        currentNavState.torahReadingId = e.target.value;
        saveNavState();
        loadAndDisplayTorahReading();
    };
}

// טעינת חומש מהאוצריא (cache משותף ל-TorahBookCache הקיים)
async function loadTorahBookByName(bookHeName, requestId) {
    // מציאת ה-bookId לפי השם העברי
    let bookId = null;
    for (const id of BOOKS_ORDER) {
        if (TORAH_STRUCTURE[id].name === bookHeName) { bookId = id; break; }
    }
    if (!bookId) return null;

    if (TorahBookCache[bookId + '_processed']) return TorahBookCache[bookId + '_processed'];

    const rawText = await fetchFullBook(bookId);
    if (requestId != null && requestId !== fetchRequestId) return null;
    const cleaned = cleanRawText(rawText);
    let tokens = window.PageLayoutEngine.tokenizeText(cleaned);
    if (window.SpecialLayouts) {
        tokens = window.SpecialLayouts.markSpecialSections(tokens, bookHeName);
    }
    const allLines = window.PageLayoutEngine.paginateAllTokens(tokens, 36);
    const processed = { tokens, allLines };
    TorahBookCache[bookId + '_processed'] = processed;
    return processed;
}

async function loadAndDisplayTorahReading() {
    const myRequestId = ++fetchRequestId;
    const container = document.getElementById('reader-container');
    container.innerHTML = '<div style="text-align:center; padding: 40px;">טוען...</div>';
    window._currentHeader = null;

    const reading = (window.TORAH_READINGS_LIST || []).find(r => r.id === currentNavState.torahReadingId);
    if (!reading) {
        container.innerHTML = '<div style="text-align:center; padding: 40px;">קריאה לא נמצאה.</div>';
        return;
    }
    if (!reading.aliyot || !reading.aliyot.length) {
        container.innerHTML = '<div style="text-align:center; padding: 40px;">אין קריאת תורה מוגדרת.</div>';
        return;
    }

    // עבור כל עליה - טען חומש וחתוך את הטוקנים לפי טווח הפסוקים.
    // שמירת מיקום תחילת כל עליה ב-combinedTokens כדי לסמן aliyaName בעמודה המרכזית.
    // הפסק (petucha) מוסף **רק** במעבר לא רציף במקור (למשל מפטיר ממקום אחר בתורה).
    // אם הטקסט רציף - לא מוסיפים petucha; אם יש פתוחה/סתומה במקור היא תבוא דרך החיתוך.
    let combinedTokens = [];
    const aliyaMarkers = []; // { tokenIdx, label, aliyaKey }
    let lastAliyaKey = null;
    let lastTo = null; // { book, ch, vs } - הפסוק האחרון שצורף
    const cmpV = (chA, vsA, chB, vsB) => chA !== chB ? chA - chB : vsA - vsB;

    for (let aIdx = 0; aIdx < reading.aliyot.length; aIdx++) {
        const a = reading.aliyot[aIdx];
        const processed = await loadTorahBookByName(a.book, myRequestId);
        if (myRequestId !== fetchRequestId) return;
        if (!processed) continue;

        const [fromCh, fromVs] = a.from.split(':').map(s => parseInt(s, 10));
        const [toCh, toVs] = a.to.split(':').map(s => parseInt(s, 10));
        const tokenSlice = sliceTokensByVerseRange(processed.tokens, fromCh, fromVs, toCh, toVs);

        // הפסק רק במעבר לא רציף במקור
        const isNewAliya = a.aliya !== lastAliyaKey;
        if (isNewAliya && lastTo) {
            const sameBook = a.book === lastTo.book;
            const isAdjacent = sameBook && (
                (fromCh === lastTo.ch && fromVs === lastTo.vs + 1) ||
                (fromCh === lastTo.ch + 1 && fromVs === 1)
            );
            const isOverlap = sameBook && cmpV(fromCh, fromVs, lastTo.ch, lastTo.vs) <= 0;
            if (!isAdjacent && !isOverlap) {
                combinedTokens.push({ type: 'petucha' });
            }
            // בעליות רציפות במקור - לא להוסיף הפסקה. ה-aliyaName יסומן ב-line שמכיל
            // את המילה הראשונה של העליה (גם אם היא בסוף שורה של עליה קודמת).
        }
        // סימון תחילת העליה (רק עליה חדשה, לא segs נוספים של אותה עליה)
        if (isNewAliya) {
            aliyaMarkers.push({
                tokenIdx: combinedTokens.length,
                label: a.aliyaLabel,
                aliyaKey: a.aliya
            });
        }
        combinedTokens = combinedTokens.concat(tokenSlice);
        lastAliyaKey = a.aliya;
        lastTo = { book: a.book, ch: toCh, vs: toVs };
    }

    if (myRequestId !== fetchRequestId) return;

    const combinedLines = window.PageLayoutEngine.paginateAllTokens(combinedTokens, 36);

    // סימון aliyaName ב-line שמכיל את המילה הראשונה של העליה.
    // אם המילה הראשונה נכנסה לסוף שורה של עליה קודמת - נסמן באותה שורה.
    for (const marker of aliyaMarkers) {
        // מצא את ה-index של ה-word token הראשון אחרי marker.tokenIdx
        let firstWordIdx = -1;
        for (let j = marker.tokenIdx; j < combinedTokens.length; j++) {
            if (combinedTokens[j].type === 'word') {
                firstWordIdx = j;
                break;
            }
        }
        if (firstWordIdx < 0) continue;
        // מצא את ה-line שמכיל את firstWordIdx
        for (let i = 0; i < combinedLines.length; i++) {
            const line = combinedLines[i];
            const nextStart = (i + 1 < combinedLines.length)
                ? combinedLines[i + 1].startTokenIdx
                : Infinity;
            if (line.startTokenIdx >= 0 &&
                line.startTokenIdx <= firstWordIdx &&
                firstWordIdx < nextStart) {
                if (!line.aliyaName) line.aliyaName = marker.label;
                break;
            }
        }
    }

    if (combinedLines.length > 0) {
        combinedLines[combinedLines.length - 1].layout = 'petucha';
    }

    paginatedColumns = [combinedLines];
    currentNavState.currentColumnIndex = 0;
    processedAll = null;
    window._currentTanachChapterMap = null;

    // חישוב טווחים רציפים לכותרת:
    // עליות שמהאותו ספר ושפסוקיהן עוקבים/חופפים - נמזגות לטווח אחד.
    const segments = computeContinuousSegments(reading.aliyot);
    const subtitle = segments.map(s =>
        `${s.book} ${formatVerseRefHebrew(s.from)} – ${formatVerseRefHebrew(s.to)}`
    ).join('; ');
    window._currentHeader = { title: reading.name, subtitle: 'קריאה: ' + subtitle };

    renderCurrentColumn();
}

// =================================================================
// === שמירה ושחזור מיקום ניווט ===
// =================================================================

let _saveNavDebounce = null;
function saveNavState() {
    clearTimeout(_saveNavDebounce);
    _saveNavDebounce = setTimeout(async () => {
        try {
            const state = {
                section: currentNavState.section,
                bookId: currentNavState.bookId,
                parashaName: currentNavState.parashaName,
                methodId: currentNavState.methodId,
                tanachBookId: currentNavState.tanachBookId,
                tanachChapter: currentNavState.tanachChapter,
                currentColumnIndex: currentNavState.currentColumnIndex,
                haftarahId: currentNavState.haftarahId,
                torahReadingId: currentNavState.torahReadingId
            };
            await window.Otzaria.call('storage.set', { key: 'tikkunNavState', value: state });
        } catch (e) {
            console.warn('[tikkun] Failed to save nav state:', e);
        }
    }, 1500);
}

async function loadNavState() {
    try {
        const res = await window.Otzaria.call('storage.get', { key: 'tikkunNavState' });
        if (res.success && res.data) {
            Object.assign(currentNavState, res.data);
            console.log('[tikkun] Nav state restored:', res.data);
        }
    } catch (e) {
        console.warn('[tikkun] Failed to load nav state:', e);
    }
}

// ממזג עליות עוקבות/חופפות לטווחים רציפים (לצורך תצוגה בכותרת)
function computeContinuousSegments(aliyot) {
    if (!aliyot.length) return [];
    const parseRef = (s) => s.split(':').map(n => parseInt(n, 10));
    const cmp = (chA, vsA, chB, vsB) => chA !== chB ? chA - chB : vsA - vsB;

    const segs = [];
    let cur = { book: aliyot[0].book, from: aliyot[0].from, to: aliyot[0].to };
    for (let i = 1; i < aliyot.length; i++) {
        const a = aliyot[i];
        const [curToCh, curToVs] = parseRef(cur.to);
        const [aFromCh, aFromVs] = parseRef(a.from);
        const [aToCh, aToVs] = parseRef(a.to);

        const sameBook = a.book === cur.book;
        // עוקב: פסוק הבא באותו פרק או פסוק 1 בפרק הבא
        const isAdjacent = sameBook && (
            (aFromCh === curToCh && aFromVs === curToVs + 1) ||
            (aFromCh === curToCh + 1 && aFromVs === 1)
        );
        // חופף: מתחיל בתוך הטווח הקיים (למשל מפטיר חופף לסוף עליה ז')
        const isOverlap = sameBook && cmp(aFromCh, aFromVs, curToCh, curToVs) <= 0;

        if (isAdjacent || isOverlap) {
            // הרחב את ה-to אם החדש מאוחר יותר
            if (cmp(aToCh, aToVs, curToCh, curToVs) > 0) {
                cur.to = a.to;
            }
        } else {
            segs.push(cur);
            cur = { book: a.book, from: a.from, to: a.to };
        }
    }
    segs.push(cur);
    return segs;
}
