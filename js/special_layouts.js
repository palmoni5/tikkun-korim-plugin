// js/special_layouts.js
// =================================================================
// פריסות מיוחדות לקטעי שירה ורשימה בתנ"ך.
//
// סוגי פריסה:
// - shira_parallel  (אריח על גבי אריח): כל שורה = ביתי ימני | רווח | ביתי שמאלי
//                   (שירת האזינו, עשרת בני המן, מלכי כנען, מלכי האמורי)
// - shira_zigzag    (אריח על גבי לבנה): פריסת זיגזג -
//                   שורות זוגיות = שני בלוקים בקצוות עם רווח באמצע,
//                   שורות אי-זוגיות = בלוק יחיד באמצע (שירת הים, שירת דבורה).
// - list_pairs      (רשימת זוגות): כל שורה = שם בצד אחד, מילת חיבור בצד השני
//                   (עשרת בני המן, מלכי כנען).
//
// הזיהוי מתבצע לפי טווח (book, fromCh:fromVs, toCh:toVs) -
// יותר אמין מאשר התאמת מילה (כי "אז" וכד' מופיע במקומות רבים).
// =================================================================

// סימן הטעם 'אתנחתא' (U+0591) - חוצה את הפסוק לשני חציים.
// משמש לפיצול שורות בפריסת shira_parallel.
const ATNACHTA = '֑';

const SPECIAL_SECTIONS = [
    // ===== תורה =====
    {
        id: 'shirat_hayam',
        name: 'שירת הים',
        book: 'שמות',
        fromCh: 15, fromVs: 1,
        toCh: 15, toVs: 19,
        layout: 'manual_zigzag',
        cssClass: 'compact-lg',
        // חלוקה מדויקת לפי כתר ארם צובה (ויקיטקסט). 30 שורות.
        // שורה 1 = שורה רחבה אחת (100%) "אז ישיר משה... ויאמרו".
        manualRows: [[{"w":100,"n":10}],[{"w":25,"n":1},{"w":50,"n":5},{"w":25,"n":1}],[{"w":50,"n":3},{"w":50,"n":5}],[{"w":25,"n":1},{"w":50,"n":3},{"w":25,"n":1}],[{"w":50,"n":2},{"w":50,"n":4}],[{"w":25,"n":1},{"w":50,"n":5},{"w":25,"n":1}],[{"w":50,"n":4},{"w":50,"n":5}],[{"w":25,"n":1},{"w":50,"n":4},{"w":25,"n":1}],[{"w":50,"n":3},{"w":50,"n":3}],[{"w":25,"n":1},{"w":50,"n":4},{"w":25,"n":1}],[{"w":50,"n":3},{"w":50,"n":3}],[{"w":25,"n":1},{"w":50,"n":4},{"w":25,"n":1}],[{"w":50,"n":3},{"w":50,"n":3}],[{"w":25,"n":1},{"w":50,"n":4},{"w":25,"n":1}],[{"w":50,"n":3},{"w":50,"n":3}],[{"w":25,"n":1},{"w":50,"n":4},{"w":25,"n":1}],[{"w":50,"n":3},{"w":50,"n":3}],[{"w":25,"n":1},{"w":50,"n":4},{"w":25,"n":1}],[{"w":50,"n":4},{"w":50,"n":4}],[{"w":25,"n":1},{"w":50,"n":3},{"w":25,"n":1}],[{"w":50,"n":3},{"w":50,"n":3}],[{"w":25,"n":1},{"w":50,"n":4},{"w":25,"n":1}],[{"w":50,"n":3},{"w":50,"n":3}],[{"w":25,"n":1},{"w":50,"n":4},{"w":25,"n":1}],[{"w":50,"n":3},{"w":50,"n":4}],[{"w":25,"n":1},{"w":50,"n":4},{"w":25,"n":1}],[{"w":50,"n":3},{"w":50,"n":3}],[{"w":25,"n":1},{"w":50,"n":4},{"w":25,"n":1}],[{"w":67,"n":6},{"w":33,"n":3}],[{"w":25,"n":3},{"w":75,"n":6}]],
    },
    {
        id: 'shirat_haazinu',
        name: 'שירת האזינו',
        book: 'דברים',
        fromCh: 32, fromVs: 1,
        toCh: 32, toVs: 43,
        layout: 'segment_pairs',
        cssClass: 'compact-md justify-cells',
        // הפריסה מבוססת על הרווחים הוויזואליים בטקסט אוצריא + מעברים
        // נוספים שמוזרקים על-ידי extraBreaks. כל מערך מתאר רצף מילים שצריך
        // להופיע ברצף; אחרי המילה האחרונה ברצף יוזרק segment_break.
        extraBreaks: [
            ['כטל','אמרתי'],
            ['דרכיו','משפט'],
            ['ולא','חכם'],
            ['ימות','עולם'],
            ['אביך','ויגדך'],
            ['בני','אדם'],
            ['ילל','ישמן'],
            ['יעיר','קנו'],
            ['כנפיו','יקחהו'],
            ['תנובת','שדי'],
            ['חלב','כרים'],
            ['כליות','חטה'],
            ['ישרון','ויבעט'],
            ['אלוה','עשהו'],
            ['יקנאהו','בזרים'],
            ['לשדים','לא','אלה'],
            ['חדשים','מקרב','באו'],
            ['ילדך','תשי'],
            ['יהוה','וינאץ'],
            ['אסתירה','פני','מהם'],
            ['דור','תהפכת','המה'],
            ['קנאוני','בלא','אל'],
            ['אקניאם','בלא','עם'],
            ['אש','קדחה','באפי'],
            ['ארץ','ויבלה'],
            ['אספה','עלימו','רעות'],
            ['רעב','ולחמי','רשף'],
            ['בהמת','אשלח','בם'],
            ['מחוץ','תשכל','חרב'],
            ['בחור','גם','בתולה'],
            ['אמרתי','אפאיהם'],
            // תוספת שניה
            ['ומחדרים','אימה'],
            ['אויב','אגור'],
            ['ידנו','רמה'],
            ['עצות','המה'],
            ['ישכילו','זאת'],
            ['אחד','אלף'],
            ['צורם','מכרם'],
            ['כצורנו','צורם'],
            ['סדם','גפנם'],
            ['ענבי','רוש'],
            ['תנינם','יינם'],
            ['כמס','עמדי'],
            ['נקם','ושלם'],
            ['יום','אידם'],
            ['יהוה','עמו'],
            ['אזלת','יד'],
            ['אי','אלהימו'],
            ['זבחימו','יאכלו'],
            ['יקומו','ויעזרכם'],
            ['אני','הוא'],
            ['אמית','ואחיה'],
            ['במשפט','ידי'],
            ['תאכל','בשר'],
            ['עבדיו','יקום'],
        ],
    },

    // ===== נביאים =====
    {
        id: 'malchei_knaan',
        name: 'מלכי כנען',
        book: 'יהושע',
        fromCh: 12, fromVs: 9,
        toCh: 12, toVs: 24,
        layout: 'list_quad',
        pairSeparator: 'אחד',
        cssClass: 'compact',
        justifyLineBefore: true, // בכתבי היד אין פתוחה לפני; השורה צריכה להיות מיושרת.
        // 16 שורות - פסוק לכל שורה.
        // 4 תאים בכל שורה: [מלך X] [אחד] [מלך Y] [אחד].
    },
    {
        id: 'shirat_devorah',
        name: 'שירת דבורה',
        book: 'שופטים',
        fromCh: 5, fromVs: 1,
        toCh: 5, toVs: 31,
        layout: 'manual_zigzag',
        cssClass: 'compact',
        // חלוקה מדויקת לפי כתר ארם צובה (ויקיטקסט). כל איבר במערך = שורה.
        // כל שורה = מערך של תאים, כל תא: { w: רוחב באחוזים, n: מספר מילים }.
        // הסדר מימין לשמאל (תא ראשון = הצד הימני של השורה).
        manualRows: [[{"w":50,"n":5},{"w":50,"n":2}],[{"w":25,"n":1},{"w":50,"n":3},{"w":25,"n":1}],[{"w":50,"n":3},{"w":50,"n":3}],[{"w":25,"n":1},{"w":50,"n":4},{"w":25,"n":1}],[{"w":50,"n":3},{"w":50,"n":2}],[{"w":25,"n":1},{"w":50,"n":3},{"w":25,"n":1}],[{"w":50,"n":4},{"w":50,"n":3}],[{"w":25,"n":1},{"w":50,"n":4},{"w":25,"n":1}],[{"w":50,"n":5},{"w":50,"n":3}],[{"w":25,"n":1},{"w":50,"n":4},{"w":25,"n":1}],[{"w":50,"n":4},{"w":50,"n":3}],[{"w":17,"n":1},{"w":66,"n":6},{"w":17,"n":1}],[{"w":50,"n":5},{"w":50,"n":3}],[{"w":25,"n":1},{"w":50,"n":3},{"w":25,"n":1}],[{"w":50,"n":2},{"w":50,"n":3}],[{"w":25,"n":1},{"w":50,"n":3},{"w":25,"n":1}],[{"w":50,"n":6},{"w":50,"n":3}],[{"w":25,"n":1},{"w":50,"n":4},{"w":25,"n":1}],[{"w":50,"n":2},{"w":50,"n":4}],[{"w":25,"n":1},{"w":50,"n":3},{"w":25,"n":1}],[{"w":50,"n":3},{"w":50,"n":5}],[{"w":25,"n":1},{"w":50,"n":5},{"w":25,"n":1}],[{"w":50,"n":3},{"w":50,"n":3}],[{"w":25,"n":1},{"w":50,"n":3},{"w":25,"n":1}],[{"w":50,"n":3},{"w":50,"n":3}],[{"w":25,"n":1},{"w":50,"n":4},{"w":25,"n":1}],[{"w":50,"n":5},{"w":50,"n":4}],[{"w":25,"n":1},{"w":50,"n":4},{"w":25,"n":1}],[{"w":50,"n":2},{"w":50,"n":4}],[{"w":25,"n":1},{"w":50,"n":4},{"w":25,"n":1}],[{"w":50,"n":3},{"w":50,"n":3}],[{"w":25,"n":1},{"w":50,"n":3},{"w":25,"n":1}],[{"w":50,"n":4},{"w":50,"n":3}],[{"w":25,"n":1},{"w":50,"n":3},{"w":25,"n":1}],[{"w":50,"n":3},{"w":50,"n":3}],[{"w":25,"n":1},{"w":50,"n":4},{"w":25,"n":1}],[{"w":50,"n":2},{"w":50,"n":4}],[{"w":25,"n":1},{"w":50,"n":3},{"w":25,"n":1}],[{"w":50,"n":3},{"w":50,"n":2}],[{"w":25,"n":1},{"w":50,"n":4},{"w":25,"n":1}],[{"w":50,"n":2},{"w":50,"n":7}],[{"w":25,"n":1},{"w":50,"n":5},{"w":25,"n":1}],[{"w":50,"n":2},{"w":50,"n":5}],[{"w":25,"n":1},{"w":50,"n":3},{"w":25,"n":1}],[{"w":50,"n":3},{"w":50,"n":3}],[{"w":25,"n":1},{"w":50,"n":3},{"w":25,"n":1}],[{"w":50,"n":2},{"w":50,"n":3}],[{"w":25,"n":1},{"w":50,"n":3},{"w":25,"n":1}],[{"w":50,"n":4},{"w":50,"n":3}],[{"w":25,"n":1},{"w":50,"n":5},{"w":25,"n":1}],[{"w":75,"n":7},{"w":25,"n":3}],[{"w":25,"n":1},{"w":50,"n":4},{"w":25,"n":1}],[{"w":50,"n":2},{"w":50,"n":4}],[{"w":25,"n":1},{"w":50,"n":4},{"w":25,"n":1}],[{"w":50,"n":3},{"w":50,"n":2}],[{"w":25,"n":1},{"w":50,"n":3},{"w":25,"n":1}],[{"w":50,"n":3},{"w":50,"n":5}],[{"w":50,"n":4},{"w":50,"n":4}]],
    },
    {
        id: 'shirat_david_smb',
        name: 'שירת דוד',
        book: 'שמואל ב',
        // הקטע מתחיל בפסוק א ("וידבר דוד...") כדי שגם הוא ייפרס בפריסת השירה.
        fromCh: 22, fromVs: 1,
        toCh: 22, toVs: 51,
        layout: 'segment_pairs',
        // כתב קומפקטי, אבל ללא יישור לשני הכיוונים (טורים לא מיושרים)
        // הפריסה מבוססת בעיקר על רווחי NBSP×8 שבמסד אוצריא + מעברים נוספים
        // שמוזרקים על-ידי extraBreaks במקומות שחסרים בטקסט.
        cssClass: 'compact flex-cells',
        extraBreaks: [
            ['השירה','הזאת'],
            ['יהוה','אתו'],
            ['סלעי','ומצדתי'],
            ['וקרן','ישעי'],
            ['שמים','יהוה'],
            ['למרחב','אתי'],
            ['יהוה','כצדקתי'],
            ['דרכי','יהוה'],
        ],
        suppressBreaks: [
            ['ומפלטי','לי'],
        ],
    },

    {
        id: 'aseret_bnei_haman',
        name: 'עשרת בני המן',
        book: 'אסתר',
        // התחום מורחב כדי לכלול גם את "אִישׁ" (סוף פסוק ו) ואת "עֲשֶׂרֶת"
        // (תחילת פסוק י). המסגרת היוצרת 11 שורות לפריסה אריח על גבי אריח.
        fromCh: 9, fromVs: 6,
        toCh: 9, toVs: 10,
        layout: 'list_alternating',
        // טרים: שמירה רק על המילה האחרונה של פסוק 6 ("אִישׁ") ועל
        // המילה הראשונה של פסוק 10 ("עֲשֶׂרֶת"). שאר 20 המילים = 10 זוגות (ואת+שם).
        trim: { startKeepLast: 1, endKeepFirst: 1 },
        // 11 שורות: זוגות (מילה במיקום זוגי בימין, מילה במיקום אי-זוגי בשמאל).
        // שורה 1: איש | ואת ... שורה 11: ויזתא | עשרת.
    },
];

/**
 * מחזיר את הקטע המיוחד הראשון שמתאים ל-(book, chapter, verse).
 * @returns {Object|null} ההגדרה, או null אם אין התאמה.
 */
function findSpecialSection(book, ch, vs) {
    for (const sec of SPECIAL_SECTIONS) {
        if (sec.book !== book) continue;
        if (ch < sec.fromCh || ch > sec.toCh) continue;
        if (ch === sec.fromCh && vs < sec.fromVs) continue;
        if (ch === sec.toCh && vs > sec.toVs) continue;
        return sec;
    }
    return null;
}

/**
 * סורק את הטוקנים אחרי tokenizeText ומחדיר special_start/special_end
 * סביב כל קטע שמופיע ב-SPECIAL_SECTIONS עבור הספר הנוכחי.
 *
 * @param {Array} tokens - טוקנים מ-tokenizeText
 * @param {string} bookName - שם הספר ('שמות', 'דברים', 'אסתר' וכו')
 * @returns {Array} טוקנים חדשים עם special_start/special_end.
 */
function markSpecialSections(tokens, bookName) {
    if (!bookName) return tokens;

    const out = [];
    let curCh = null, curVs = null;
    let activeSection = null; // הקטע שאנחנו בתוכו כרגע

    const checkAndOpen = () => {
        if (activeSection) return;
        if (curCh == null || curVs == null) return;
        const sec = findSpecialSection(bookName, curCh, curVs);
        if (sec) {
            activeSection = sec;
            // העברת ה-pelekh והפסוק הנוכחיים אל special_start כדי שמילים בתחילת
            // הקטע (לפני verse_break הבא) יקבלו את ה-verseNum הנכון.
            out.push({ type: 'special_start', section: sec, openingChapter: curCh, openingVerse: curVs });
        }
    };

    const checkAndClose = () => {
        if (!activeSection) return;
        if (curCh == null || curVs == null) return;
        const stillIn = findSpecialSection(bookName, curCh, curVs);
        if (!stillIn || stillIn.id !== activeSection.id) {
            out.push({ type: 'special_end' });
            activeSection = null;
        }
    };

    for (let i = 0; i < tokens.length; i++) {
        const tok = tokens[i];

        if (tok.type === 'chapter_break') {
            curCh = tok.chapterNum;
            curVs = null;
            checkAndClose();
            out.push(tok);
            continue;
        }
        if (tok.type === 'verse_break') {
            curVs = tok.verseNum;
            checkAndClose();
            out.push(tok);
            checkAndOpen();
            continue;
        }
        out.push(tok);
    }

    if (activeSection) {
        out.push({ type: 'special_end' });
    }

    const trimmed = applyBoundaryTrimming(out);
    const withExtras = injectExtraBreaks(trimmed);
    return suppressSegmentBreaks(withExtras);
}

/**
 * עבור כל קטע עם section.extraBreaks, מוצא רצפי מילים תואמים בתוך הקטע
 * ומזריק segment_break מיד אחרי הופעת המילה האחרונה ברצף.
 * משווה לפי stam (ללא ניקוד/טעמים) כדי להיות עמיד לטעמים שונים.
 */
function injectExtraBreaks(tokens) {
    const result = [];
    let activeExtras = null; // המערך הנוכחי של extraBreaks (פעיל בתוך קטע)
    // כדי להשוות, נחזיק את הזרם של word stam-ים אחרונים שראינו
    const recent = []; // מילים אחרונות (stam)

    const cleanStam = (w) => w
        .replace(/[֑-ׇ]/g, '')              // ניקוד וטעמים
        .replace(/[-]/g, '')   // סימוני זעירא/רבתי (PUA)
        .replace(/[-]/g, '')   // סימוני כתיב/קרי (PUA)
        .replace(/־/g, ' ');

    for (let i = 0; i < tokens.length; i++) {
        const tok = tokens[i];
        if (tok.type === 'special_start') {
            activeExtras = (tok.section && tok.section.extraBreaks) || null;
            recent.length = 0;
            result.push(tok);
            continue;
        }
        if (tok.type === 'special_end') {
            activeExtras = null;
            recent.length = 0;
            result.push(tok);
            continue;
        }
        result.push(tok);

        if (!activeExtras || tok.type !== 'word') continue;
        const stam = cleanStam(tok.value);
        // טוקן יכול להכיל מַקָּף שהומר לרווח; נשבור לחתיכות כדי להתאים לתת-מילה.
        const pieces = stam.split(/\s+/).filter(p => p.length > 0);
        for (const piece of pieces) recent.push(piece);
        // הגבל את אורך ה-recent למקסימום אורך תבנית
        const maxLen = Math.max(...activeExtras.map(p => p.length));
        while (recent.length > maxLen) recent.shift();

        // בדוק אם איזשהי תבנית מסתיימת כאן
        for (const pattern of activeExtras) {
            if (recent.length < pattern.length) continue;
            let ok = true;
            for (let pi = 0; pi < pattern.length; pi++) {
                if (recent[recent.length - pattern.length + pi] !== pattern[pi]) {
                    ok = false;
                    break;
                }
            }
            if (ok) {
                result.push({ type: 'segment_break' });
                break; // לא להזריק כפול לאותו מקום
            }
        }
    }
    return result;
}

/**
 * עבור כל קטע עם section.suppressBreaks, מוצא רצפי מילים תואמים בתוך הקטע
 * ומבטל את ה-segment_break / verse_break שמופיע מיד אחרי הרצף.
 */
function suppressSegmentBreaks(tokens) {
    const result = [];
    let activeSuppress = null;
    const recent = [];
    let pendingSuppress = false;

    const cleanStam = (w) => w
        .replace(/[֑-ׇ]/g, '')
        .replace(/[-]/g, '')
        .replace(/[-]/g, '')
        .replace(/־/g, ' ');

    for (let i = 0; i < tokens.length; i++) {
        const tok = tokens[i];
        if (tok.type === 'special_start') {
            activeSuppress = (tok.section && tok.section.suppressBreaks) || null;
            recent.length = 0;
            pendingSuppress = false;
            result.push(tok);
            continue;
        }
        if (tok.type === 'special_end') {
            activeSuppress = null;
            recent.length = 0;
            pendingSuppress = false;
            result.push(tok);
            continue;
        }

        if (pendingSuppress && tok.type === 'segment_break') {
            pendingSuppress = false;
            continue;
        }
        if (pendingSuppress && tok.type === 'verse_break') {
            pendingSuppress = false;
            result.push(Object.assign({}, tok, { suppressFlush: true }));
            continue;
        }

        result.push(tok);

        if (!activeSuppress || tok.type !== 'word') continue;
        const stam = cleanStam(tok.value);
        const pieces = stam.split(/\s+/).filter(p => p.length > 0);
        for (const piece of pieces) recent.push(piece);
        const maxLen = Math.max(...activeSuppress.map(p => p.length));
        while (recent.length > maxLen) recent.shift();

        for (const pattern of activeSuppress) {
            if (recent.length < pattern.length) continue;
            let ok = true;
            for (let pi = 0; pi < pattern.length; pi++) {
                if (recent[recent.length - pattern.length + pi] !== pattern[pi]) {
                    ok = false;
                    break;
                }
            }
            if (ok) {
                pendingSuppress = true;
                break;
            }
        }
    }
    return result;
}

/**
 * עבור כל special_start עם section.trim.startKeepLast=N:
 *   מזיז את special_start כך שיהיה ממש לפני ה-N מילים האחרונות
 *   של הפסוק הראשון בקטע. שאר המילים של אותו פסוק יישארו לפני special_start
 *   ועוברות עיבוד טקסט רגיל.
 *
 * עבור כל special_end עם section.trim.endKeepFirst=M:
 *   מזיז את special_end כך שיהיה ממש אחרי M המילים הראשונות
 *   של הפסוק האחרון בקטע.
 */
function applyBoundaryTrimming(tokens) {
    const result = tokens.slice();

    // עיבוד startKeepLast
    for (let i = 0; i < result.length; i++) {
        const tok = result[i];
        if (tok.type !== 'special_start') continue;
        const section = tok.section;
        if (!section || !section.trim || section.trim.startKeepLast == null) continue;
        const n = section.trim.startKeepLast;

        // מצא את ה-verse_break/special_end הבא אחרי i
        let endIdx = result.length;
        for (let j = i + 1; j < result.length; j++) {
            const t = result[j];
            if (t.type === 'verse_break' || t.type === 'special_end' || t.type === 'chapter_break') {
                endIdx = j;
                break;
            }
        }
        // אסוף את אינדקסי המילים בין i+1 ל-endIdx-1
        const wordIndices = [];
        for (let j = i + 1; j < endIdx; j++) {
            if (result[j].type === 'word') wordIndices.push(j);
        }
        if (wordIndices.length <= n) continue; // כל המילים נשמרות כבר
        // אינדקס המילה הראשונה שנשמרת בקטע (תהיה N-th מהסוף)
        const keepFromIdx = wordIndices[wordIndices.length - n];
        // הסר את special_start ממקומו והכנס לפני keepFromIdx
        const ss = result.splice(i, 1)[0];
        // אחרי splice, indices לאחר i הוזזו ב--1, אז keepFromIdx → keepFromIdx-1
        result.splice(keepFromIdx - 1, 0, ss);
        i = keepFromIdx - 1; // המשך מהמיקום החדש
    }

    // עיבוד endKeepFirst
    for (let i = 0; i < result.length; i++) {
        const tok = result[i];
        if (tok.type !== 'special_end') continue;
        // מצא את special_start המתאים (אחורנית)
        let startIdx = -1;
        for (let j = i - 1; j >= 0; j--) {
            if (result[j].type === 'special_start') { startIdx = j; break; }
        }
        if (startIdx < 0) continue;
        const section = result[startIdx].section;
        if (!section || !section.trim || section.trim.endKeepFirst == null) continue;
        const m = section.trim.endKeepFirst;

        // מצא את verse_break/chapter_break האחרון לפני i (תחילת הפסוק האחרון בקטע)
        let lastBreak = startIdx;
        for (let j = i - 1; j > startIdx; j--) {
            const t = result[j];
            if (t.type === 'verse_break' || t.type === 'chapter_break') {
                lastBreak = j;
                break;
            }
        }
        // אסוף אינדקסי מילים בין lastBreak+1 ל-i-1
        const wordIndices = [];
        for (let j = lastBreak + 1; j < i; j++) {
            if (result[j].type === 'word') wordIndices.push(j);
        }
        if (wordIndices.length <= m) continue;
        // אינדקס המילה ה-m-th (0-indexed: m-1)
        const keepToIdx = wordIndices[m - 1];
        // הסר special_end והכנס מיד אחרי keepToIdx
        const se = result.splice(i, 1)[0];
        result.splice(keepToIdx + 1, 0, se);
        i = keepToIdx + 1;
    }

    return result;
}

/**
 * חוצה רשימת מילים לפי הופעת אתנחתא (U+0591). מחזיר את האינדקס של המילה
 * שמכילה אתנחתא, +1 (כלומר נקודת החיתוך). אם לא נמצאה - מחזיר חצי.
 */
function findAtnachtaSplit(words) {
    for (let i = 0; i < words.length; i++) {
        const w = words[i];
        const text = w.nikud || w.stam || '';
        if (text.indexOf(ATNACHTA) >= 0) {
            return i + 1; // לאחר המילה עם האתנחתא
        }
    }
    return Math.ceil(words.length / 2);
}

/**
 * בונה שורות פריסה במבנה shira_parallel: כל פסוק מתחלק לחצי ימני וחצי שמאלי
 * לפי האתנחתא. נדרש מערך פסוקים (verses) כשכל פסוק הוא מערך של words.
 *
 * @param {Array<Array>} verses - רשימת פסוקים, כל פסוק = מערך words.
 * @returns {Array} שורות עם { layout: 'shira_parallel', rightWords, leftWords }
 */
function buildParallelLines(verses) {
    const lines = [];
    let lastVerse = null;
    for (const verseWords of verses) {
        if (!verseWords.length) continue;
        const splitAt = findAtnachtaSplit(verseWords);
        const line = {
            layout: 'shira_parallel',
            specialKind: 'shira',
            rightWords: verseWords.slice(0, splitAt),
            leftWords: verseWords.slice(splitAt)
        };
        const vn = verseWords[0] && verseWords[0].verseNum;
        if (vn != null && vn !== lastVerse) {
            line.firstVerseNum = vn;
            lastVerse = vn;
        }
        lines.push(line);
    }
    return lines;
}

/**
 * בונה שורות פריסה במבנה shira_zigzag: שורות לסירוגין -
 * שורה זוגית (אינדקס 0) = שני בלוקים עם רווח באמצע ("right | spacer | left")
 * שורה אי-זוגית (אינדקס 1) = בלוק יחיד באמצע ("spacer | center | spacer")
 *
 * החיתוך מבוצע לפי אתנחתא ולפי סוף פסוק - כל "חצי פסוק" נחשב כיחידה.
 *
 * @param {Array<Array>} verses - רשימת פסוקים
 * @returns {Array} שורות
 */
/**
 * בונה שורות לפי הרווחים הוויזואליים בטקסט אוצריא עצמו (segment_break tokens).
 * כל קטע (רצף מילים בין סגמנט-ברייקים או גבולות פסוק) נקרא "סגמנט".
 * סגמנטים זוגיים יוצרים שורות 50/50: סגמנט ראשון מימין, שני משמאל.
 * אם יש מספר אי-זוגי של סגמנטים, האחרון יחיד יוצר שורה משלו (50% מימין, ריק משמאל)
 * או יחבר לסגמנט הבא.
 *
 * @param {Array} sectionTokens - הטוקנים בתוך הקטע
 * @param {Object} context - openingVerse, openingChapter
 */
function buildSegmentPairsLines(sectionTokens, context) {
    // אסוף סגמנטים: כל סגמנט = מערך מילים עם verseNum
    const segments = [];
    let curSeg = [];
    let curVerse = (context && context.openingVerse) || null;

    const flushSeg = () => {
        if (curSeg.length) segments.push({ words: curSeg, verseNum: curSeg[0].verseNum });
        curSeg = [];
    };

    for (const tok of sectionTokens) {
        if (tok.type === 'verse_break') {
            if (!tok.suppressFlush) flushSeg();
            curVerse = tok.verseNum;
            continue;
        }
        if (tok.type === 'segment_break') {
            flushSeg();
            continue;
        }
        if (tok.type === 'chapter_break') continue;
        if (tok.type === 'petucha' || tok.type === 'setuma') continue;
        if (tok.type !== 'word') continue;

        const word = tok.value;
        // טיפול בכתיב-קרי (PUA  /  ככל ש-cleanRawText הזריקה אותם)
        // המבנה: U+E010 כתיב U+E011 קרי U+E012
        const kqMatch = word.match(new RegExp('\\u' + 'E010' + '([\\s\\S]*?)\\u' + 'E011' + '([\\s\\S]*?)\\u' + 'E012'));
        if (kqMatch) {
            const ketivRaw = kqMatch[1]; // צד הסת"ם
            const qereRaw  = kqMatch[2]; // צד המנוקד
            const ketivStam = ketivRaw.replace(/[֑-ׇ]/g, '');
            const qereStam  = qereRaw.replace(/[֑-ׇ]/g, '');
            if (!ketivStam && !qereStam) continue;
            curSeg.push({ stam: ketivStam, nikud: qereRaw, verseNum: curVerse });
            continue;
        }
        const wordStam = word.replace(/[֑-ׇ]/g, '');
        if (wordStam === '') continue;
        curSeg.push({ stam: wordStam, nikud: word, verseNum: curVerse });
    }
    flushSeg();

    // קבץ זוגות סגמנטים לשורות: כל 2 סגמנטים → שורה 50/50
    const lines = [];
    let lastVerseShown = null;
    for (let i = 0; i < segments.length; i += 2) {
        const right = segments[i];
        const left = segments[i + 1];
        const line = {
            layout: 'shira_zigzag',
            specialKind: 'shira',
            zigzagRow: 'manual',
            manualCells: [
                { width: 50, words: right.words },
                { width: 50, words: left ? left.words : [] }
            ]
        };
        // סמן מספר פסוק אם זה תחילת פסוק חדש
        const vn = right.verseNum;
        if (vn != null && vn !== lastVerseShown) {
            line.firstVerseNum = vn;
            lastVerseShown = vn;
        }
        lines.push(line);
    }
    return lines;
}

/**
 * בונה שורות לפי טבלת חלוקה ידנית (manualRows).
 * כל שורה = מערך תאים: [{ w: רוחב באחוזים, n: מספר מילים }, ...].
 * המילים נצרכות בסדר רציף מהקלט.
 */
function buildManualRowsLines(flatWords, manualRows) {
    const lines = [];
    let wi = 0;
    let lastVerse = null;
    for (let ri = 0; ri < manualRows.length; ri++) {
        const row = manualRows[ri];
        const isLastRow = ri === manualRows.length - 1;
        const cells = [];
        let lineFirstVerse = null;
        for (let ci = 0; ci < row.length; ci++) {
            const cellSpec = row[ci];
            const isLastCell = isLastRow && ci === row.length - 1;
            const cellWords = [];
            // התא האחרון של השורה האחרונה - אוסף את כל המילים הנותרות
            // (במקום לאבד מילים בגלל מספרי תאים לא מדויקים).
            const targetN = isLastCell ? Infinity : cellSpec.n;
            for (let k = 0; k < targetN && wi < flatWords.length; k++) {
                const w = flatWords[wi];
                if (lineFirstVerse == null && w.verseNum != null && w.verseNum !== lastVerse) {
                    lineFirstVerse = w.verseNum;
                    lastVerse = w.verseNum;
                }
                cellWords.push(w);
                wi++;
            }
            cells.push({ width: cellSpec.w, words: cellWords });
        }
        const line = {
            layout: 'shira_zigzag',
            specialKind: 'shira',
            zigzagRow: 'manual',
            manualCells: cells
        };
        if (lineFirstVerse != null) line.firstVerseNum = lineFirstVerse;
        lines.push(line);
    }
    return lines;
}

function buildZigzagLines(verses) {
    // זרימה רציפה של מילים דרך תאים בגדלים משתנים.
    // תבנית: שורה זוגית = 2 תאים (50%/50%), שורה אי-זוגית = 3 תאים (25%/50%/25%).
    // כל תא מקבל מילים עד שאינו יכול לקבל עוד; אז המילה הבאה עוברת לתא הבא.
    //
    // קיבולת תווים מקורבת (יחסית ל-maxCharsPerLine=36 ברוחב 100%):
    //   50% ≈ 18 תווים, 25% ≈ 9 תווים. ניתן לחרוג מעט להכלת מילה שלמה.
    const CAP_50 = 18;
    const CAP_25 = 9;

    // שטיחת כל המילים יחד (כבר עם verseNum)
    const flatWords = [];
    for (const verseWords of verses) {
        for (const w of verseWords) flatWords.push(w);
    }
    if (flatWords.length === 0) return [];

    const wordLen = (w) => (w.stam || '').length + 1; // +1 לרווח

    const lines = [];
    let wi = 0;
    let rowParity = 0;
    let lastVerse = null;

    while (wi < flatWords.length) {
        let line;
        let lineFirstVerse = null;
        const capacities = rowParity === 0 ? [CAP_50, CAP_50] : [CAP_25, CAP_50, CAP_25];
        const cells = [[], [], []];

        for (let ci = 0; ci < capacities.length; ci++) {
            const cap = capacities[ci];
            let cellChars = 0;
            while (wi < flatWords.length) {
                const w = flatWords[wi];
                const wl = wordLen(w);
                // אפשר את המילה הראשונה גם אם היא לבד גדולה מהקיבולת
                if (cells[ci].length > 0 && cellChars + wl > cap) break;
                if (lineFirstVerse == null && w.verseNum != null && w.verseNum !== lastVerse) {
                    lineFirstVerse = w.verseNum;
                    lastVerse = w.verseNum;
                }
                cells[ci].push(w);
                cellChars += wl;
                wi++;
            }
        }

        if (rowParity === 0) {
            line = {
                layout: 'shira_zigzag',
                specialKind: 'shira',
                zigzagRow: 'double',
                rightWords: cells[0],
                leftWords: cells[1]
            };
        } else {
            line = {
                layout: 'shira_zigzag',
                specialKind: 'shira',
                zigzagRow: 'triple',
                rightWords: cells[0],
                centerWords: cells[1],
                leftWords: cells[2]
            };
        }
        if (lineFirstVerse != null) line.firstVerseNum = lineFirstVerse;
        lines.push(line);
        rowParity = 1 - rowParity;
    }
    return lines;
}

/**
 * בונה שורות פריסה במבנה list_pairs: כל שורה = שם בצד אחד, מילת מפריד בצד השני.
 *
 * pairOrder:
 *   'sep_then_words' (עשרת בני המן): מפריד מופיע לפני שם הקבוצה.
 *                    טקסט "ואת פלמוני ואת אלמוני" → שתי שורות:
 *                    שורה: rightWords=[פלמוני], leftWords=[ואת]
 *                    שורה: rightWords=[אלמוני], leftWords=[ואת]
 *
 *   'words_then_sep' (מלכי כנען): מפריד מופיע אחרי שם הקבוצה.
 *                    טקסט "מלך יריחו אחד מלך העי אחד" → שתי שורות:
 *                    שורה: rightWords=[מלך, יריחו], leftWords=[אחד]
 *                    שורה: rightWords=[מלך, העי],   leftWords=[אחד]
 *
 * @param {Array} words - מילים ברצף מהקטע (מאוחד מכל הפסוקים).
 * @param {string} separator - מילת המפריד (ללא ניקוד).
 * @param {string} pairOrder - 'sep_then_words' או 'words_then_sep'.
 * @returns {Array} שורות
 */
function buildListPairsLines(words, separator, pairOrder = 'words_then_sep') {
    const cleanWord = (w) => (w.stam || '').replace(/[־-]/g, '');
    const isSep = (w) => cleanWord(w) === separator;
    const lines = [];
    let i = 0;

    // בכל המקרים: השם בצד ימין של השורה, מילת המפריד בצד שמאל.
    const pushLine = (nameWords, sepWord) => {
        if (nameWords.length === 0 && !sepWord) return;
        lines.push({
            layout: 'list_pairs',
            specialKind: 'list',
            rightWords: nameWords,
            leftWords: sepWord ? [sepWord] : []
        });
    };

    if (pairOrder === 'words_then_sep') {
        // 'מלכי כנען': "מלך X אחד" - אסוף עד "אחד", ואז זוג (שם, אחד)
        while (i < words.length) {
            const nameWords = [];
            while (i < words.length && !isSep(words[i])) {
                nameWords.push(words[i]);
                i++;
            }
            if (i < words.length && isSep(words[i])) {
                pushLine(nameWords, words[i]);
                i++;
            } else {
                pushLine(nameWords, null);
            }
        }
    } else {
        // 'sep_then_words': "ואת X" - שמירה לעת עתה אם יידרש בעתיד
        const leadingWords = [];
        while (i < words.length && !isSep(words[i])) {
            leadingWords.push(words[i]);
            i++;
        }
        if (leadingWords.length > 0) pushLine(leadingWords, null);
        while (i < words.length) {
            const sepWord = words[i];
            i++;
            const nameWords = [];
            while (i < words.length && !isSep(words[i])) {
                nameWords.push(words[i]);
                i++;
            }
            if (nameWords.length > 0) pushLine(nameWords, sepWord);
            else pushLine([], sepWord);
        }
    }
    return lines;
}

/**
 * בונה שורות פריסה במבנה list_alternating: לוקח רצף מילים שטוח ומחלק לזוגות
 * סמוכים. בכל זוג: המילה במיקום זוגי (0,2,4...) מימין, המילה במיקום אי-זוגי
 * (1,3,5...) משמאל.
 *
 * דוגמה (עשרת בני המן, 22 מילים → 11 שורות):
 *   words = [איש, ואת, פרשנדתא, ואת, ..., ויזתא, עשרת]
 *   row 1: right=[איש],      left=[ואת]
 *   row 2: right=[פרשנדתא],  left=[ואת]
 *   ...
 *   row 11: right=[ויזתא],   left=[עשרת]
 *
 * @param {Array} words - רצף מילים שטוח
 * @returns {Array} שורות
 */
/**
 * בונה שורות פריסה במבנה list_quad: כל פסוק = שורה אחת עם 4 תאים סדורים
 * משמאל לימין (ב-RTL מימין לשמאל): [שם 1] [מפריד] [שם 2] [מפריד].
 *
 * הפיצול בוצע לפי הופעות מילת המפריד (כולל גרסת ו"ו): "אחד" / "ואחד".
 * מתאים לפסוקים שמכילים שתי מופעי המפריד (למשל יהושע יב, ט-כג עם 2 מלכים
 * לפסוק) או גרסת סיום (פסוק כד עם "ואחד" סופי).
 */
function buildQuadLines(verses, separator) {
    const cleanWord = (w) => (w.stam || '').replace(/[־-]/g, '');
    const isSep = (w) => {
        const c = cleanWord(w);
        return c === separator || c === ('ו' + separator);
    };
    const lines = [];
    let lastVerse = null;
    for (const verseWords of verses) {
        if (!verseWords.length) continue;
        // פיצול לקבוצות: רצף-מילים-של-שם, ואז המפריד כקבוצה נפרדת.
        const groups = [];
        let current = [];
        for (const w of verseWords) {
            if (isSep(w)) {
                if (current.length) groups.push(current);
                groups.push([w]);
                current = [];
            } else {
                current.push(w);
            }
        }
        if (current.length) groups.push(current);

        const line = {
            layout: 'list_quad',
            specialKind: 'list_quad',
            cells: groups
        };
        const vn = verseWords[0].verseNum;
        if (vn != null && vn !== lastVerse) {
            line.firstVerseNum = vn;
            lastVerse = vn;
        }
        lines.push(line);
    }
    return lines;
}

function buildAlternatingLines(words) {
    const lines = [];
    let lastVerse = null;
    for (let i = 0; i < words.length; i += 2) {
        const rightW = words[i];
        const leftW = words[i + 1];
        const line = {
            layout: 'list_alternating',
            specialKind: 'list',
            rightWords: [rightW],
            leftWords: leftW ? [leftW] : []
        };
        // המסומן בעמודת המסמנים הוא המילה השמאלית (ואת/עשרת) - היא תחילת
        // הפסוק החדש. לדוגמה בעשרת בני המן: "ואת" של פסוק ז מופיע בשמאל של
        // שורה 1 (יחד עם איש שבימין מפסוק ו) - ולכן שורה 1 מסומנת ז.
        const sourceVerse = (leftW && leftW.verseNum != null) ? leftW.verseNum
            : (rightW && rightW.verseNum);
        if (sourceVerse != null && sourceVerse !== lastVerse) {
            line.firstVerseNum = sourceVerse;
            lastVerse = sourceVerse;
        }
        lines.push(line);
    }
    return lines;
}

/**
 * הפונקציה המרכזית: לוקח את הטוקנים מהקטע (מ-special_start עד special_end),
 * את הגדרת הקטע, ומחזיר רשימת שורות מוכנות לרינדור.
 *
 * @param {Array} sectionTokens - הטוקנים בתוך הקטע (בלי special_start/end).
 * @param {Object} section - ההגדרה מ-SPECIAL_SECTIONS.
 * @returns {Array} שורות מיוחדות
 */
function buildSpecialLines(sectionTokens, section, context) {
    // קבץ את המילים לפי פסוקים. כל פסוק = { verseNum, words: [...] }.
    // verseNum נשמר עבור כל מילה לאחר flatten כך שניתן לסמן מעברי פסוק
    // בשורות המתאימות בעמודת המסמנים.
    //
    // context.openingVerse / context.openingChapter: הפסוק/הפרק שהיו פעילים
    // ממש לפני שהקטע נפתח. נצרך כי applyBoundaryTrimming יכול להזיז את
    // special_start כך שהמילה הראשונה בקטע נמצאת לפני verse_break הבא.
    const verses = [];
    let curVerse = {
        verseNum: (context && context.openingVerse) || null,
        words: []
    };
    const flushVerse = () => {
        if (curVerse.words.length) verses.push(curVerse);
        curVerse = { verseNum: null, words: [] };
    };

    for (const tok of sectionTokens) {
        if (tok.type === 'verse_break') {
            flushVerse();
            curVerse.verseNum = tok.verseNum;
            continue;
        }
        if (tok.type === 'chapter_break') {
            continue;
        }
        if (tok.type === 'petucha' || tok.type === 'setuma') {
            continue;
        }
        if (tok.type !== 'word') continue;

        const word = tok.value;
        // טיפול בכתיב-קרי: התבנית "ketivqere" - הכתיב יוצג בטור סת"ם
        // והקרי בטור ניקוד (זהה לטיפול ב-paginateAllTokens).
        const kqMatch = word.match(new RegExp(
            '\\u' + 'E010' + '([\\s\\S]*?)\\u' + 'E011' + '([\\s\\S]*?)\\u' + 'E012'
        ));
        if (kqMatch) {
            const ketivRaw = kqMatch[1]; // צד הסת"ם
            const qereRaw  = kqMatch[2]; // צד המנוקד
            const ketivStam = ketivRaw.replace(/[֑-ׇ]/g, '');
            const qereStam  = qereRaw.replace(/[֑-ׇ]/g, '');
            if (!ketivStam && !qereStam) continue;
            curVerse.words.push({
                stam: ketivStam,
                nikud: qereRaw,
                verseNum: curVerse.verseNum
            });
            continue;
        }

        const wordStam = word.replace(/[֑-ׇ]/g, '');
        if (wordStam === '') continue;

        curVerse.words.push({ stam: wordStam, nikud: word, verseNum: curVerse.verseNum });
    }
    flushVerse();

    if (verses.length === 0) return [];

    // טרים: שמירת רק חלק מהפסוקים בתחילה/בסוף הקטע
    if (section.trim) {
        if (section.trim.startKeepLast != null && verses.length > 0) {
            const n = section.trim.startKeepLast;
            verses[0].words = verses[0].words.slice(-n);
        }
        if (section.trim.endKeepFirst != null && verses.length > 0) {
            const m = section.trim.endKeepFirst;
            const lastV = verses[verses.length - 1];
            lastV.words = lastV.words.slice(0, m);
        }
    }

    // שטיחת המילים יחד עם verseNum
    const flatWords = [];
    for (const v of verses) {
        for (const w of v.words) {
            flatWords.push(w); // w.verseNum כבר מוטמע מקודם
        }
    }

    switch (section.layout) {
        case 'shira_parallel':
            return buildParallelLines(verses.map(v => v.words), section);
        case 'shira_zigzag':
            return buildZigzagLines(verses.map(v => v.words), section);
        case 'manual_zigzag':
            return buildManualRowsLines(flatWords, section.manualRows || []);
        case 'segment_pairs':
            return buildSegmentPairsLines(sectionTokens, context);
        case 'list_pairs':
            return buildListPairsLines(
                flatWords,
                section.pairSeparator,
                section.pairOrder || 'words_then_sep'
            );
        case 'list_alternating':
            return buildAlternatingLines(flatWords);
        case 'list_quad':
            return buildQuadLines(verses.map(v => v.words), section.pairSeparator);
        default:
            return [];
    }
}

if (typeof window !== 'undefined') {
    window.SpecialLayouts = {
        SPECIAL_SECTIONS,
        findSpecialSection,
        markSpecialSections,
        buildSpecialLines
    };
}
