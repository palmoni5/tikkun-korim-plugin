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
            if (currentLine.length > 0) {
                currentColumn.push({ words: currentLine, layout: 'petucha' });
                currentLine = [];
                charCount = 0;
                checkColumnFull();
            } else if (currentColumn.length > 0) {
                currentColumn[currentColumn.length - 1].layout = 'petucha';
            }
            continue;
        }

        if (word === '{SETUMA}') {
            currentLine.push({ nikud: '{GAP}', stam: '{GAP}' });
            layoutType = 'setuma';
            charCount += 9;
            continue;
        }

        const wordStam = word.replace(/[֑-ׇ]/g, '');
        currentLine.push({ stam: wordStam, nikud: word });
        charCount += wordStam.length + 1;

        if (charCount >= MAX_CHARS_PER_LINE || i === words.length - 1) {
            currentColumn.push({ words: currentLine, layout: layoutType });
            currentLine = [];
            charCount = 0;
            layoutType = 'regular';
            checkColumnFull();
        }
    }

    if (currentLine.length > 0) {
        currentColumn.push({ words: currentLine, layout: layoutType });
    }
    if (currentColumn.length > 0) {
        columns.push(currentColumn);
    }

    return columns;

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
 */
function maskDivineName(text) {
    if (!text) return text;
    return text.replace(
        /י([֑-ׇֿ-]*)ה([֑-ׇֿ-]*)ו([֑-ׇֿ-]*)ה/g,
        'י$1ק$2ו$3ק'
    );
}

/**
 * בונה אלמנט מילה בטור הסת"ם (כולל תמיכה בזעירא/רבתי).
 */
function buildStamWordEl(wordObj, maskName) {
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
    return wordEl;
}

/**
 * בונה span של מילת ניקוד (כולל זעירא/רבתי).
 */
function buildNikudWordEl(wordObj, maskName) {
    const nikudText = maskName ? maskDivineName(wordObj.nikud) : wordObj.nikud;
    const span = document.createElement('span');
    const html = nikudText
        .replace(/([\s\S]*?)/g, '<span class="letter-zeira">$1</span>')
        .replace(/([\s\S]*?)/g, '<span class="letter-rabati">$1</span>');
    span.innerHTML = html + ' ';
    return span;
}

/**
 * מוסיף רצף מילים לטור (stam או nikud). מוסיף text node רווח אחרי כל מילה.
 */
function appendWordsToCell(cell, words, maskName, isStam) {
    for (const wordObj of words) {
        if (wordObj.stam === '{GAP}') {
            const spacer = document.createElement(isStam ? 'div' : 'span');
            spacer.className = 'halachic-spacer spacer-setuma';
            cell.appendChild(spacer);
            continue;
        }
        if (isStam && wordObj.stam) {
            cell.appendChild(buildStamWordEl(wordObj, maskName));
            cell.appendChild(document.createTextNode(' '));
        }
        if (!isStam && wordObj.nikud) {
            cell.appendChild(buildNikudWordEl(wordObj, maskName));
        }
    }
}

/**
 * בונה שורה מיוחדת (שירה/רשימה) עם פריסה דו-טורית בכל אחד מטור הסת"ם וטור הניקוד.
 *
 * lineObj יכול לכלול:
 *   - rightWords, leftWords (לפריסת shira_parallel ו-list_pairs)
 *   - centerWords (לפריסת shira_zigzag שורה יחידה)
 *   - zigzagRow: 'double' | 'single'
 */
function renderSpecialRow(lineObj, maskName, prev) {
    const row = document.createElement('div');
    row.className = `reader-row layout-${lineObj.layout} layout-special`;
    if (lineObj.zigzagRow) {
        row.classList.add(`zigzag-${lineObj.zigzagRow}`);
    }
    if (lineObj.cssClass) {
        // תמיכה במספר classes מופרדים ברווח
        for (const c of String(lineObj.cssClass).split(/\s+/)) {
            if (c) row.classList.add('special-' + c);
        }
    }

    const buildSplitCell = (isStam) => {
        const cell = document.createElement('div');
        cell.className = isStam ? 'stam-col' : 'nikud-col';
        cell.classList.add('special-cell');

        if (lineObj.cells) {
            // פריסה בשני זוגות עם רווח אמצעי:
            // [pair-right: name1 → אחד1] [GAP] [pair-left: name2 → אחד2].
            // בתוך כל זוג: justify-content: space-between דוחף את הילד הראשון
            // לקצה ה-RTL הטבעי (ימין) ואת השני לקצה השני (שמאל).
            const halfIdx = Math.floor(lineObj.cells.length / 2);
            const rightCells = lineObj.cells.slice(0, halfIdx);
            const leftCells = lineObj.cells.slice(halfIdx);

            const rightPair = document.createElement('div');
            rightPair.className = 'quad-pair quad-pair-right';
            for (let i = 0; i < rightCells.length; i++) {
                const block = document.createElement('div');
                block.className = 'quad-cell sub-cell sub-cell-' + i;
                appendWordsToCell(block, rightCells[i] || [], maskName, isStam);
                rightPair.appendChild(block);
            }

            const gap = document.createElement('div');
            gap.className = 'quad-gap';

            const leftPair = document.createElement('div');
            leftPair.className = 'quad-pair quad-pair-left';
            for (let i = 0; i < leftCells.length; i++) {
                const block = document.createElement('div');
                block.className = 'quad-cell sub-cell sub-cell-' + (i + halfIdx);
                appendWordsToCell(block, leftCells[i] || [], maskName, isStam);
                leftPair.appendChild(block);
            }

            cell.appendChild(rightPair);
            cell.appendChild(gap);
            cell.appendChild(leftPair);
        } else if (lineObj.zigzagRow === 'manual' && lineObj.manualCells) {
            // פריסה ידנית: כל תא עם רוחב משלו (באחוזים) ויישור לפי המיקום:
            // תא יחיד ברוחב מלא = מיושר לשני הכיוונים (space-between).
            // תא ראשון = ימין, תא אחרון = שמאל, אמצעי = מרכז.
            const cellCount = lineObj.manualCells.length;
            for (let i = 0; i < cellCount; i++) {
                const c = lineObj.manualCells[i];
                const block = document.createElement('div');
                block.className = 'special-block manual-cell';
                // flex-basis = רוחב המוצהר; flex-grow=1, flex-shrink=1 מאפשר
                // לתא להתרחב אם השכן צריך פחות מקום, ולהתכווץ במידת הצורך.
                // min-width מבטיח שהשכן ישמור על מינימום של 22% מהשורה.
                block.style.flex = `1 1 ${c.width}%`;
                block.style.minWidth = '0';
                let alignClass;
                if (cellCount === 1) alignClass = 'manual-full';
                else if (i === 0) alignClass = 'manual-right';
                else if (i === cellCount - 1) alignClass = 'manual-left';
                else alignClass = 'manual-center';
                block.classList.add(alignClass);
                appendWordsToCell(block, c.words || [], maskName, isStam);
                cell.appendChild(block);
            }
        } else if (lineObj.zigzagRow === 'triple') {
            // שורה עם 3 בלוקים: ימין 25% / מרכז 50% / שמאל 25%.
            const rightBlock = document.createElement('div');
            rightBlock.className = 'special-block triple-right';
            appendWordsToCell(rightBlock, lineObj.rightWords || [], maskName, isStam);
            const centerBlock = document.createElement('div');
            centerBlock.className = 'special-block triple-center';
            appendWordsToCell(centerBlock, lineObj.centerWords || [], maskName, isStam);
            const leftBlock = document.createElement('div');
            leftBlock.className = 'special-block triple-left';
            appendWordsToCell(leftBlock, lineObj.leftWords || [], maskName, isStam);
            cell.appendChild(rightBlock);
            cell.appendChild(centerBlock);
            cell.appendChild(leftBlock);
        } else if (lineObj.zigzagRow === 'single') {
            // (שמור לגיבוי - לא בשימוש כרגע. שירות זיגזג ממירות single ל-triple.)
            const leftSp = document.createElement('div');
            leftSp.className = 'special-spacer';
            const center = document.createElement('div');
            center.className = 'special-block center';
            appendWordsToCell(center, lineObj.centerWords || [], maskName, isStam);
            const rightSp = document.createElement('div');
            rightSp.className = 'special-spacer';
            cell.appendChild(rightSp);
            cell.appendChild(center);
            cell.appendChild(leftSp);
        } else {
            const rightBlock = document.createElement('div');
            rightBlock.className = 'special-block right';
            appendWordsToCell(rightBlock, lineObj.rightWords || [], maskName, isStam);
            const gap = document.createElement('div');
            gap.className = 'special-gap';
            const leftBlock = document.createElement('div');
            leftBlock.className = 'special-block left';
            appendWordsToCell(leftBlock, lineObj.leftWords || [], maskName, isStam);
            cell.appendChild(rightBlock);
            cell.appendChild(gap);
            cell.appendChild(leftBlock);
        }
        return cell;
    };

    const stamCell = buildSplitCell(true);
    const markersCell = document.createElement('div');
    markersCell.className = 'markers-col';
    const markerParts = buildMarkerContent(lineObj, prev);
    markerParts.forEach(p => markersCell.appendChild(p));
    const nikudCell = buildSplitCell(false);

    if (lineObj.firstChapterNum != null) prev.ch = lineObj.firstChapterNum;
    if (lineObj.firstVerseNum != null) prev.vs = lineObj.firstVerseNum;

    row.appendChild(stamCell);
    row.appendChild(markersCell);
    row.appendChild(nikudCell);
    return row;
}

/**
 * ציור העמודה ל-HTML
 */
function renderColumnUI(columnLines) {
    const container = document.getElementById('reader-container');
    container.innerHTML = '';

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

    const prev = { ch: null, vs: null };
    const maskName = !!(typeof AppState !== 'undefined' && AppState.settings && AppState.settings.hideDivineName);

    columnLines.forEach(lineObj => {
        // שורה מיוחדת (שירה/רשימה)
        if (lineObj.specialKind === 'shira' || lineObj.specialKind === 'list' || lineObj.specialKind === 'list_quad') {
            page.appendChild(renderSpecialRow(lineObj, maskName, prev));
            return;
        }

        const row = document.createElement('div');
        row.className = `reader-row layout-${lineObj.layout}`;

        const stamCell = document.createElement('div');
        stamCell.className = 'stam-col';

        const markersCell = document.createElement('div');
        markersCell.className = 'markers-col';
        const markerParts = buildMarkerContent(lineObj, prev);
        markerParts.forEach(p => markersCell.appendChild(p));

        if (lineObj.firstChapterNum != null) prev.ch = lineObj.firstChapterNum;
        if (lineObj.firstVerseNum != null) prev.vs = lineObj.firstVerseNum;

        const nikudCell = document.createElement('div');
        nikudCell.className = 'nikud-col';

        appendWordsToCell(stamCell, lineObj.words, maskName, true);
        appendWordsToCell(nikudCell, lineObj.words, maskName, false);

        row.appendChild(stamCell);
        row.appendChild(markersCell);
        row.appendChild(nikudCell);
        page.appendChild(row);
    });

    container.appendChild(page);
}
