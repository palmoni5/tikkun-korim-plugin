// js/page_layout_engine.js
// =================================================================
// מנוע חלוקה לעמודים ושורות לפי שיטת הסת"ם הנבחרת.
//
// קלט: טקסט גולמי (מאוצריא, אחרי ניקוי בסיסי) + שיטה + פרשה
// פלט: רשימת עמודים, כל אחד עם רשימת שורות, כל שורה עם רשימת מילים +
//      מטה-דאטה על פרשיות פתוחות/סתומות.
// =================================================================

const STRETCHABLE_LETTERS = ['א', 'ד', 'ה', 'ח', 'ל', 'ר', 'ת'];

/**
 * שלב 1: ניקוי הטקסט הגולמי והפיכתו לרצף מילים עם סמני פרשיות.
 *
 * @param {string} rawText - הטקסט שחזר מאוצריא, אחרי הסרת תגיות בסיסית.
 * @returns {Array} מערך של אסימונים: { type: 'word'|'petucha'|'setuma'|'pagebreak_hint', value? }
 */
// אורך גלוי של מילת סת"ם - מתעלם מתווי PUA U+E020-E023 (סימוני זעירא/רבתי)
function visibleStamLen(stam) {
    let n = 0;
    for (let i = 0; i < stam.length; i++) {
        const code = stam.charCodeAt(i);
        if (code < 0xE020 || code > 0xE023) n++;
    }
    return n;
}


function tokenizeText(rawText) {
    // החלפת סימוני פרשיות פתוחות/סתומות בסימני מקום ייחודיים.
    // חשוב: לעשות זאת לפני פיצול לפי רווחים, כי {פ}/{ס} עשויים להופיע בלי רווח.
    let processed = rawText
        .replace(/[\n\r]/g, ' ')
        .replace(/\(פ\)|\[פ\]|\{פ\}/g, ' PETUCHA ')
        .replace(/\(ס\)|\[ס\]|\{ס\}/g, ' SETUMA ')
        .replace(/BOOKBREAKMARKER/g, ' BOOKBREAK ')
        .replace(/CHAPTERMARK(\d+)MARK/g, ' CHAPTER$1 ')
        .replace(/VERSEMARK(\d+)MARK/g, ' VERSE$1 ')
        .replace(/SEGBREAKMARK/g, ' SEGBREAK ')
        .replace(/\s+/g, ' ')
        .trim();

    const tokens = [];
    const parts = processed.split(' ');
    for (const part of parts) {
        if (!part) continue;
        if (part === 'PETUCHA') {
            tokens.push({ type: 'petucha' });
        } else if (part === 'SETUMA') {
            tokens.push({ type: 'setuma' });
        } else if (part === 'BOOKBREAK') {
            tokens.push({ type: 'book_break' });
        } else if (part === 'SEGBREAK') {
            tokens.push({ type: 'segment_break' });
        } else if (/^CHAPTER(\d+)$/.test(part)) {
            const num = parseInt(part.replace(/^CHAPTER/, ''));
            tokens.push({ type: 'chapter_break', chapterNum: num });
        } else if (/^VERSE(\d+)$/.test(part)) {
            const num = parseInt(part.replace(/^VERSE/, ''));
            tokens.push({ type: 'verse_break', verseNum: num });
        } else {
            tokens.push({ type: 'word', value: part });
        }
    }
    return tokens;
}

/**
 * שלב 2: מחלק את האסימונים לעמודים לפי טבלת השיטה.
 *
 * הלוגיקה: עוברים על האסימונים, ובכל פעם שמתחילה מילה חדשה, בודקים אם
 * המילה הזו תואמת ל-firstWord של העמוד הבא בטבלה. אם כן - סגירת עמוד נוכחי
 * ופתיחת חדש.
 *
 * המילה משוואה אחרי הסרת ניקוד (כי הטבלאות בלי ניקוד והטקסט עם ניקוד).
 *
 * @param {Array} tokens - אסימונים מ-tokenizeText
 * @param {Array} pageDefs - רשימת הגדרות עמודים (מ-TORAH_LAYOUTS)
 * @returns {Array} מערך עמודים: { definition, tokens }
 */
function partitionTokensToPages(tokens, pageDefs) {
    if (pageDefs.length === 0) return [];

    const pages = pageDefs.map(def => ({ definition: def, tokens: [] }));
    let currentPageIdx = 0;
    let tokensSinceLastBreak = 0;
    const MIN_TOKENS_BETWEEN_BREAKS = 20; // הגנה: בין שני עמודים חייבות להיות לפחות 20 מילים

    for (let i = 0; i < tokens.length; i++) {
        const tok = tokens[i];

        // האם זו תחילת עמוד חדש?
        if (tok.type === 'word' && currentPageIdx + 1 < pageDefs.length) {
            const nextDef = pageDefs[currentPageIdx + 1];
            if (nextDef.firstWord && tokensSinceLastBreak >= MIN_TOKENS_BETWEEN_BREAKS) {
                // הסרת ניקוד מהמילה הנוכחית לצורך השוואה
                const cleanWord = tok.value.replace(/[֑-ׇ]/g, '');
                if (cleanWord === nextDef.firstWord) {
                    currentPageIdx++;
                    tokensSinceLastBreak = 0;
                }
            }
        }

        pages[currentPageIdx].tokens.push(tok);
        if (tok.type === 'word') {
            tokensSinceLastBreak++;
        }
    }

    return pages;
}

/**
 * חישוב מקסימום תווים בשורה דינמי, כדי למנוע שורה אחרונה ריקה למחצה.
 *
 * אם נחתוך ב-36 תווים יציבים, השורה האחרונה עלולה להיות קצרה מאוד.
 * הפתרון: חישוב כמה שורות העמוד "ירצה" ב-36, ואז התאמה כך שהמטען
 * יתחלק שווה יותר.
 *
 * @param {Array} tokens - אסימוני העמוד
 * @param {number} baseMaxChars - תקרה רגילה (36)
 * @returns {number} maxChars מותאם
 */
function computeBalancedMaxChars(tokens, baseMaxChars = 36) {
    let totalChars = 0;
    for (const tok of tokens) {
        if (tok.type === 'word') {
            const stamLen = visibleStamLen(tok.value.replace(/[֑-ׇ]/g, ''));
            totalChars += stamLen + 1; // +1 לרווח אחרי המילה
        } else if (tok.type === 'setuma') {
            totalChars += 9;
        }
        // petucha לא נספר - הוא בלאו הכי שורה חדשה
    }
    if (totalChars <= baseMaxChars) return baseMaxChars;

    // כמה שורות נצטרך אם נחתוך ב-baseMaxChars?
    const linesAtBase = Math.ceil(totalChars / baseMaxChars);
    // השורה האחרונה תהיה בגודל:
    const lastLineSize = totalChars - (linesAtBase - 1) * baseMaxChars;
    // אם השורה האחרונה תהיה קטנה משמעותית (פחות מ-50% מהשורה הרגילה),
    // נכוונן את ה-maxChars כך שכל השורות יהיו ~שוות.
    if (lastLineSize < baseMaxChars * 0.5) {
        return Math.ceil(totalChars / linesAtBase);
    }
    return baseMaxChars;
}

/**
 * שלב 3: חיתוך עמוד לשורות, תוך כדי טיפול בפרשיות פתוחות וסתומות.
 *
 * - פרשה פתוחה (petucha): סוף שורה. השורה החדשה מתחילה בריק (או יורדת שורה).
 * - פרשה סתומה (setuma): רווח של ~9 תווים באמצע השורה.
 *
 * @param {Object} pageObj - { definition, tokens } מ-partitionTokensToPages
 * @param {number} maxLines - מקסימום שורות לעמוד (42/51 לפי השיטה)
 * @param {number} baseMaxCharsPerLine - תקרת תווים בסיסית בשורה (ברירת מחדל 36)
 * @returns {Array} מערך שורות: { words: [{stam, nikud}], layout: 'regular'|'petucha'|'setuma' }
 */
function paginatePage(pageObj, maxLines, baseMaxCharsPerLine = 36) {
    const lines = [];
    let currentLine = [];
    let charCount = 0;
    let lineLayout = 'regular';

    // חישוב maxChars מאוזן עבור הסגמנט הנוכחי - מחושב מחדש אחרי כל petucha,
    // כי כל "פסקה" היא יחידה עצמאית של איזון.
    let segmentTokens = [];
    let maxCharsPerLine = baseMaxCharsPerLine;

    // מצא segment - מקבץ אסימונים שמסתיים ב-petucha או בסוף עמוד.
    const recomputeMaxCharsForUpcomingSegment = (startIdx) => {
        const seg = [];
        for (let j = startIdx; j < pageObj.tokens.length; j++) {
            if (pageObj.tokens[j].type === 'petucha') break;
            seg.push(pageObj.tokens[j]);
        }
        return computeBalancedMaxChars(seg, baseMaxCharsPerLine);
    };

    maxCharsPerLine = recomputeMaxCharsForUpcomingSegment(0);

    const flushLine = () => {
        if (currentLine.length > 0) {
            lines.push({ words: currentLine, layout: lineLayout });
        }
        currentLine = [];
        charCount = 0;
        lineLayout = 'regular';
    };

    for (let i = 0; i < pageObj.tokens.length; i++) {
        const tok = pageObj.tokens[i];

        if (tok.type === 'petucha') {
            // פרשה פתוחה: סוגרים את השורה הנוכחית ומסמנים אותה כפתוחה.
            if (currentLine.length > 0) {
                lineLayout = 'petucha';
                flushLine();
            } else if (lines.length > 0) {
                // השורה הקודמת היא הפתוחה
                lines[lines.length - 1].layout = 'petucha';
            }
            // חישוב מחדש של maxChars לסגמנט החדש
            maxCharsPerLine = recomputeMaxCharsForUpcomingSegment(i + 1);
            continue;
        }

        if (tok.type === 'setuma') {
            // פרשה סתומה: רווח באמצע השורה הנוכחית (~9 תווים).
            currentLine.push({ stam: '{GAP}', nikud: '{GAP}' });
            lineLayout = 'setuma';
            charCount += 9;
            if (charCount >= maxCharsPerLine) {
                flushLine();
            }
            continue;
        }

        // אסימון רגיל (מילה)
        const word = tok.value;
        const wordStam = word.replace(/[֑-ׇ]/g, '');

        // אם המילה ריקה בסת"ם (רק סימן פיסוק כמו ׀ או ׃ בודדים),
        // נחבר אותה כניקוד למילה הקודמת - כדי שלא ייווצר רווח כפול בסת"ם.
        if (wordStam === '') {
            if (currentLine.length > 0) {
                // המילה הקודמת בניקוד מקבלת את הפיסוק
                const prev = currentLine[currentLine.length - 1];
                prev.nikud = prev.nikud + ' ' + word;
            }
            // לא סופרים תווים בסת"ם ולא חותכים שורה
            continue;
        }

        currentLine.push({ stam: wordStam, nikud: word });
        charCount += visibleStamLen(wordStam) + 1;

        // חיתוך שורה אם נגיע למקסימום תווים
        if (charCount >= maxCharsPerLine) {
            flushLine();
        }
    }

    // ניקוז שאריות - שומר את ה-layout הנוכחי (regular אם זו פשוט סוף הטקסט,
    // setuma/petucha אם זה מה שהיה). שורה אחרונה של עמוד שאיננה petucha
    // נחשבת רגילה ולכן מיושרת לשני הכיוונים.
    if (currentLine.length > 0) {
        flushLine();
    }

    return lines;
}

/**
 * חיתוך כל הטוקנים לשורות (בלי הגבלה לעמוד).
 * דומה ל-paginatePage אבל מקבל את כל הטקסט ולא עמוד בודד.
 *
 * כל שורה מוחזרת עם startTokenIdx - האינדקס של הטוקן הראשון שתרם לשורה.
 * זה מאפשר מיפוי מדויק בין tokens לשורות לצורך ניווט.
 */
// בודק כמה תווים נשארו בסגמנט הנוכחי (מאינדקס fromIdx ועד petucha/book_break הבא).
// בשימוש כ-look-ahead: אם השאריות לא יצדיקו שורה מלאה, נאפשר חריגה קלה בשורה הנוכחית
// במקום להוריד את המילה לשורה משלה (שתיראה דלילה).
function lookaheadCharsUntilBoundary(tokens, fromIdx) {
    let chars = 0;
    for (let j = fromIdx; j < tokens.length; j++) {
        const t = tokens[j];
        if (t.type === 'petucha' || t.type === 'book_break') break;
        if (t.type === 'word') {
            chars += t.value.replace(/[֑-ׇ]/g, '').length + 1;
        } else if (t.type === 'setuma') {
            chars += 9;
        }
    }
    return chars;
}

function paginateAllTokens(tokens, maxCharsPerLine = 36) {
    const lines = [];
    let currentLine = [];
    let currentLineStartTokenIdx = -1; // הטוקן הראשון של השורה הנוכחית
    let charCount = 0;
    let lineLayout = 'regular';
    // סף החלטה: אם השאריות בסגמנט (מהטוקן הבא ועד petucha) קטנות מסף זה,
    // לא נחתוך שורה - נאפשר חריגה קלה כדי שלא תיווצר שורה אחרונה דלילה.
    const NEW_LINE_THRESHOLD = maxCharsPerLine * 0.5;
    // markers ממתינים - יוצמדו לשורה הבאה שתכלול מילה
    let pendingChapterNum = null;
    let pendingVerseNum = null;
    // markers של השורה הנוכחית
    let currentLineFirstVerse = null;
    let currentLineFirstChapter = null;

    const flushLine = () => {
        if (currentLine.length > 0) {
            lines.push({
                words: currentLine,
                layout: lineLayout,
                startTokenIdx: currentLineStartTokenIdx,
                firstVerseNum: currentLineFirstVerse,
                firstChapterNum: currentLineFirstChapter
            });
        }
        currentLine = [];
        currentLineStartTokenIdx = -1;
        charCount = 0;
        lineLayout = 'regular';
        currentLineFirstVerse = null;
        currentLineFirstChapter = null;
    };

    // לפני הוספת מילה ראשונה לשורה - מצמיד את ה-pending markers לשורה הנוכחית
    const consumePendingMarkers = () => {
        if (pendingChapterNum !== null && currentLineFirstChapter === null) {
            currentLineFirstChapter = pendingChapterNum;
        }
        if (pendingVerseNum !== null && currentLineFirstVerse === null) {
            currentLineFirstVerse = pendingVerseNum;
        }
        pendingChapterNum = null;
        pendingVerseNum = null;
    };

    const wordLenOf = (w) => w.stam === '{GAP}' ? 9 : visibleStamLen(w.stam || '') + 1;

    // איזון ממוקד: אם השורה הנוכחית קצרה (פחות מ-40%), מנסים למזג אותה
    // עם השורה הקודמת לשורה אחת — גם אם זה חורג מעט מהרוחב המקסימלי.
    // המטרה: למנוע גם "מילה בודדת בשורה" וגם שורות קצרות שמתמתחות בגלל
    // justify-content: space-between. אם החריגה גדולה מדי, פשוט שומרים את
    // המצב הטבעי (לא מאזנים) ומשאירים את השורה הקצרה כפי שהיא.
    const rebalanceLastSegmentBeforeBoundary = () => {
        if (currentLine.length === 0) return;
        let curChars = 0;
        for (const w of currentLine) curChars += wordLenOf(w);
        const SHORT_THRESHOLD = maxCharsPerLine * 0.4;
        if (curChars >= SHORT_THRESHOLD) {
            flushLine();
            return;
        }
        if (lines.length === 0) {
            flushLine();
            return;
        }
        const prev = lines[lines.length - 1];
        if (prev.layout !== 'regular' && prev.layout !== 'partial') {
            flushLine();
            return;
        }
        const allWords = [...prev.words, ...currentLine];
        let totalChars = 0;
        for (const w of allWords) totalChars += wordLenOf(w);

        // אם הכל נכנס בשורה אחת (כולל חריגה של עד 20%) - מאחדים.
        const SOFT_MAX = maxCharsPerLine * 1.20;
        if (totalChars <= SOFT_MAX) {
            prev.words = allWords;
            prev.layout = 'regular';
            currentLine = [];
            currentLineStartTokenIdx = -1;
            charCount = 0;
            lineLayout = 'regular';
            currentLineFirstVerse = null;
            currentLineFirstChapter = null;
            return;
        }
        // אחרת - לא מאזנים (כי כל פיצול יוצר שורה קצרה שתימתח). פשוט פולטים.
        flushLine();
    };

    for (let i = 0; i < tokens.length; i++) {
        const tok = tokens[i];

        if (tok.type === 'special_start') {
            // לפני שיוצרים שורות מיוחדות - מאזנים מחדש את "הסגמנט" של הטקסט
            // הרגיל שמסתיים כאן: לוקחים את כל המילים מאז גבול הסגמנט האחרון
            // (petucha / book_break / special section קודם / תחילת הקלט), ומחלקים
            // אותם מחדש לשורות מאוזנות עם justify מלא, במקום להשאיר שורה אחרונה
            // קצרה ("partial") שלא נראית טוב כשהקטע המיוחד מתחיל אחריה.
            rebalanceLastSegmentBeforeBoundary();

            // אסוף טוקנים עד special_end
            const sectionTokens = [];
            let j = i + 1;
            while (j < tokens.length && tokens[j].type !== 'special_end') {
                sectionTokens.push(tokens[j]);
                j++;
            }

            // עדכן markers ממתינים על-ידי טוקנים בתוך הקטע
            for (const st of sectionTokens) {
                if (st.type === 'chapter_break') {
                    pendingChapterNum = st.chapterNum;
                    if (pendingVerseNum === null) pendingVerseNum = 1;
                } else if (st.type === 'verse_break') {
                    pendingVerseNum = st.verseNum;
                }
            }

            // הפק שורות מיוחדות. context מעביר את הפסוק/הפרק שהיו פעילים
            // ממש לפני special_start (למילים שלפני verse_break הבא בתוך הקטע).
            const specialLines = (typeof window !== 'undefined' && window.SpecialLayouts)
                ? window.SpecialLayouts.buildSpecialLines(sectionTokens, tok.section, {
                    openingChapter: tok.openingChapter,
                    openingVerse: tok.openingVerse
                })
                : [];

            // לוג אבחוני זמני
            console.log('[tikkun] special_start handled. section=', tok.section && tok.section.id,
                'fromCh=', tok.section && tok.section.fromCh,
                'fromVs=', tok.section && tok.section.fromVs,
                'pendingChapterNum=', pendingChapterNum,
                'specialLines.length=', specialLines.length);

            if (specialLines.length > 0) {
                // תמיד נסמן את שורת הפתיחה של קטע מיוחד בפרק שלה, כדי שהניווט
                // יוכל למצוא אותה. ההצגה החזותית ("ה:א" וכד') מובחנת ב-renderer
                // ע"י בדיקה אם זה באמת פרק חדש לעומת prev.ch.
                const startCh = tok.openingChapter != null
                    ? tok.openingChapter
                    : (tok.section && tok.section.fromCh);
                if (startCh != null && specialLines[0].firstChapterNum == null) {
                    specialLines[0].firstChapterNum = startCh;
                    console.log('[tikkun] set firstChapterNum on first special line:',
                        startCh, 'section:', tok.section && tok.section.id);
                } else {
                    console.log('[tikkun] did NOT set firstChapterNum. startCh:', startCh,
                        'firstChapterNum was:', specialLines[0].firstChapterNum);
                }
                // בקטעים מסוימים (מלכי כנען) - השורה הקודמת צריכה להיות
                // מיושרת לשני הכיוונים (לא petucha/partial). בקטעים שיש לפניהם
                // פתוחה בכתבי היד (שירת האזינו, שירת דבורה, שירת הים) -
                // השורה נשארת פתוחה כפי שהיא.
                if (tok.section && tok.section.justifyLineBefore && lines.length > 0) {
                    const last = lines[lines.length - 1];
                    if (last.layout === 'petucha' || last.layout === 'partial') {
                        last.layout = 'regular';
                    }
                }

                for (let k = 0; k < specialLines.length; k++) {
                    specialLines[k].startTokenIdx = i;
                    if (tok.section && tok.section.cssClass) {
                        specialLines[k].cssClass = tok.section.cssClass;
                    }
                }
                pendingChapterNum = null;
                pendingVerseNum = null;
                lines.push(...specialLines);
            } else {
                // fallback: עיבוד רגיל של הטוקנים בתוך הקטע
                // (יסתכל על i במחזור הבא - לא נעשה כלום מיוחד)
            }

            i = j; // קפיצה לסוף הקטע (special_end)
            continue;
        }

        if (tok.type === 'special_end') {
            // טופל בתוך special_start - דלג
            continue;
        }

        if (tok.type === 'segment_break') {
            // רווח ויזואלי גדול בתוך פסוק - רלוונטי רק לקטעים מיוחדים
            // (האזינו, הים וכד'). בטקסט רגיל פשוט מתעלמים.
            continue;
        }

        if (tok.type === 'petucha') {
            if (currentLine.length > 0) {
                lineLayout = 'petucha';
                flushLine();
            } else if (lines.length > 0) {
                lines[lines.length - 1].layout = 'petucha';
            }
            continue;
        }

        if (tok.type === 'aliya_break') {
            // הפסקה כפויה לתחילת עליה חדשה (בלי לשנות layout - נשאר רגיל)
            if (currentLine.length > 0) {
                flushLine();
            }
            continue;
        }

        if (tok.type === 'book_break') {
            // מעבר בין חומשים - 4 שורות ריקות (כמו בספר תורה אמיתי)
            if (currentLine.length > 0) {
                lineLayout = 'petucha';
                flushLine();
            }
            for (let k = 0; k < 4; k++) {
                lines.push({ words: [], layout: 'empty', startTokenIdx: i });
            }
            continue;
        }

        if (tok.type === 'chapter_break') {
            // מעבר פרק - יוצמד לשורה הבאה שתכלול מילה
            pendingChapterNum = tok.chapterNum;
            // פרק חדש מתחיל לרוב בפסוק א - אם אין pendingVerseNum, נגדיר ידנית
            if (pendingVerseNum === null) pendingVerseNum = 1;
            continue;
        }

        if (tok.type === 'verse_break') {
            // מעבר פסוק - יוצמד לשורה הבאה שתכלול מילה
            pendingVerseNum = tok.verseNum;
            continue;
        }

        if (tok.type === 'setuma') {
            // אם נשארו פחות מ-12 תווים בשורה (9 לרווח + ~3 למילה אחריו),
            // נעביר את המילה האחרונה של הפיסקה הקודמת לשורה הבאה,
            // כדי שה-setuma תהיה באמצע שורה ולא בסופה.
            const remaining = maxCharsPerLine - charCount;
            const MIN_AFTER_SETUMA = 12;
            if (remaining < MIN_AFTER_SETUMA && currentLine.length >= 2) {
                const lastWord = currentLine.pop();
                const lastLen = lastWord.stam === '{GAP}' ? 9
                    : lastWord.stam.replace(/[-]/g, '').length + 1;
                charCount -= lastLen;
                flushLine();
                if (currentLineStartTokenIdx < 0) currentLineStartTokenIdx = i;
                currentLine.push(lastWord);
                charCount = lastLen;
            }
            if (currentLineStartTokenIdx < 0) currentLineStartTokenIdx = i;
            currentLine.push({ stam: '{GAP}', nikud: '{GAP}' });
            lineLayout = 'setuma';
            charCount += 9;
            if (charCount >= maxCharsPerLine) {
                flushLine();
            }
            continue;
        }

        const word = tok.value;

        // טיפול ב-כתיב/קרי: ketivqere
        const kqMatch = word.match(/([\s\S]*?)([\s\S]*?)/);
        if (kqMatch) {
            const ketiv = kqMatch[1];
            const qere = kqMatch[2];
            const ketivStam = ketiv.replace(/[֑-ׇ]/g, '');
            const qereStam = qere.replace(/[֑-ׇ]/g, '');
            if (!ketivStam && !qereStam) continue;
            const baseLen = visibleStamLen(ketivStam || qereStam) + 1;
            // אם המילה לא נכנסת לשורה - יורדת לשורה הבאה.
            // שורה שיוצאת קצרה משמעותית (פחות מ-65% מהמכסה) - מסומנת 'partial'
            // כדי שלא תוצג עם רווחים מוזרים. שורות באורך תקין נשארות 'regular' עם יישור מלא.
            if (currentLine.length > 0 && charCount + baseLen > maxCharsPerLine) {
                if (lineLayout === 'regular' && charCount < maxCharsPerLine * 0.65) {
                    lineLayout = 'partial';
                }
                flushLine();
            }
            if (currentLineStartTokenIdx < 0) currentLineStartTokenIdx = i;
            if (typeof consumePendingMarkers === 'function') consumePendingMarkers();
            currentLine.push({ stam: ketivStam, nikud: qere });
            charCount += baseLen;
            continue;
        }

        const wordStam = word.replace(/[֑-ׇ]/g, '');

        // אם המילה ריקה בסת"ם (סימן פיסוק כמו ׀ או ׃) - חיבור לקודמת בניקוד
        if (wordStam === '') {
            if (currentLine.length > 0) {
                const prev = currentLine[currentLine.length - 1];
                prev.nikud = prev.nikud + ' ' + word;
            }
            continue;
        }

        // אם המילה לא נכנסת לשורה - יורדת לשורה הבאה.
        // שורה שיוצאת קצרה משמעותית (פחות מ-65% מהמכסה) - מסומנת 'partial'
        // כדי שלא תוצג עם רווחים מוזרים. שורות באורך תקין נשארות 'regular' עם יישור מלא.
        const wordLen = visibleStamLen(wordStam) + 1;
        if (currentLine.length > 0 && charCount + wordLen > maxCharsPerLine) {
            if (lineLayout === 'regular' && charCount < maxCharsPerLine * 0.65) {
                lineLayout = 'partial';
            }
            flushLine();
        }
        if (currentLineStartTokenIdx < 0) currentLineStartTokenIdx = i;
        consumePendingMarkers();
        currentLine.push({ stam: wordStam, nikud: word });
        charCount += wordLen;
    }

    if (currentLine.length > 0) {
        flushLine();
    }

    return lines;
}

/**
 * הפונקציה הראשית: מקבלת טקסט גולמי, שיטה ופרשה, ומחזירה את העמודים שלה.
 *
 * הגישה: חלוקה אוטומטית של הטקסט לשורות, ואז חלוקת השורות לעמודים
 * לפי מס' השורות בעמוד שמוגדר ב-TORAH_LAYOUTS (42 ברמ"ה/רמ"ח, 51 בתימני).
 *
 * @param {string} rawText - הטקסט הגולמי של הפרשה (לאחר ניקוי תגיות).
 * @param {string} methodId - 'ramah' / 'ramach' / 'rambamRosh'
 * @param {string} parashaName - שם הפרשה לבחירה.
 * @returns {Array} מערך עמודים, כל אחד: { definition, lines }
 */
function layoutPagesForParasha(rawText, methodId, parashaName) {
    const layout = window.TORAH_LAYOUTS[methodId];
    if (!layout) {
        console.error(`Unknown layout method: ${methodId}`);
        return [];
    }

    const tokens = tokenizeText(rawText);
    const maxLines = layout.linesPerPage;
    const maxChars = 36;

    // חלוקה לכל השורות
    const allLines = paginateAllTokens(tokens, maxChars);

    // חיתוך לעמודים של maxLines שורות
    const pages = [];
    for (let i = 0; i < allLines.length; i += maxLines) {
        const pageLines = allLines.slice(i, i + maxLines);
        const pageNum = Math.floor(i / maxLines) + 1;
        // חיפוש page definition לפי הפרשה (אם קיים בטבלה)
        const def = layout.pages.find(p =>
            p.parasha === parashaName && p.num >= pageNum
        ) || { num: pageNum, parasha: parashaName, sheet: '?' };
        pages.push({
            definition: { ...def, num: pageNum }, // override num למספור בתוך הפרשה
            lines: pageLines
        });
    }

    return pages;
}

// ייצוא לחלון
if (typeof window !== 'undefined') {
    window.PageLayoutEngine = {
        tokenizeText,
        partitionTokensToPages,
        paginatePage,
        paginateAllTokens,
        layoutPagesForParasha,
        STRETCHABLE_LETTERS
    };
}
