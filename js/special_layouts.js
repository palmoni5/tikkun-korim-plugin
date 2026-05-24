// js/special_layouts.js
// =================================================================
// עיצוב מיוחד לקטעים בעלי לאאוט הלכתי שונה:
// - שירת הים (פרשת בשלח, שמות טו)
// - שירת האזינו (פרשת האזינו, דברים לב)
// - עשרת הדיברות (פרשת יתרו, שמות כ; ופרשת ואתחנן, דברים ה)
//
// כל קטע כזה דורש מבנה ויזואלי מיוחד שאינו 36 תווים לשורה.
// =================================================================

// סימני התחלה וסיום של כל קטע מיוחד (תוית-מילים)
const SPECIAL_SECTIONS = {
    shirat_hayam: {
        // שירת הים - שמות טו, א-יח
        // מתחילה ב"אז ישיר משה" וסיום "ה' ימלך לעלם ועד"
        startMarker: 'אז',     // מתחילה ב"אָ֣ז יָשִֽׁיר־מֹשֶׁה֩"
        startSecond: 'ישיר',
        endMarker: 'ועד',      // מסתיימת ב"לְעֹלָ֖ם וָעֶֽד"
        layoutType: 'shirat_hayam',
        description: 'שירת הים'
    },
    shirat_haazinu: {
        // שירת האזינו - דברים לב, א-מג
        startMarker: 'האזינו',
        startSecond: 'השמים',
        endMarker: 'עמו',     // "עַמּֽוֹ" סוף השיר
        layoutType: 'shirat_haazinu',
        description: 'שירת האזינו'
    },
    aseret_hadibrot: {
        // עשרת הדיברות - שתי גרסאות (שמות כ, דברים ה)
        startMarker: 'אנכי',
        startSecond: null,
        endMarker: 'לרעך',
        layoutType: 'aseret_hadibrot',
        description: 'עשרת הדיברות'
    }
};

/**
 * מזהה אסימונים של קטעים מיוחדים בתוך טוקנים, ומתייג אותם בסוג ה-layout המיוחד.
 *
 * @param {Array} tokens - אסימונים מ-tokenizeText
 * @returns {Array} אסימונים מתויגים: מילים בתוך קטעים מיוחדים יקבלו specialType
 */
function tagSpecialSections(tokens) {
    const tagged = tokens.map(t => ({ ...t }));

    for (const [key, section] of Object.entries(SPECIAL_SECTIONS)) {
        const startIdx = findStartOfSection(tagged, section);
        if (startIdx === -1) continue;

        const endIdx = findEndOfSection(tagged, startIdx, section);
        if (endIdx === -1) continue;

        for (let i = startIdx; i <= endIdx; i++) {
            if (tagged[i].type === 'word') {
                tagged[i].specialType = section.layoutType;
            }
        }
    }

    return tagged;
}

function findStartOfSection(tokens, section) {
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type !== 'word') continue;
        const clean = tokens[i].value.replace(/[֑-ׇ]/g, '');
        if (clean !== section.startMarker) continue;

        if (section.startSecond) {
            // נחפש את המילה השנייה תוך כדי דילוג על אסימוני פרשה
            for (let j = i + 1; j < tokens.length; j++) {
                if (tokens[j].type !== 'word') continue;
                const cleanNext = tokens[j].value.replace(/[֑-ׇ]/g, '');
                if (cleanNext === section.startSecond) return i;
                break; // אם המילה הבאה לא תואמת - לא ההתחלה
            }
        } else {
            return i;
        }
    }
    return -1;
}

function findEndOfSection(tokens, startIdx, section) {
    for (let i = startIdx; i < tokens.length; i++) {
        if (tokens[i].type !== 'word') continue;
        const clean = tokens[i].value.replace(/[֑-ׇ]/g, '');
        if (clean === section.endMarker) return i;
    }
    return -1;
}

/**
 * מחלק שורה של שירה לשני גושים ("ביתי"): גוש ימני וגוש שמאלי, עם רווח מרכזי.
 * זה הסידור של שירת הים ושירת האזינו בכתב סת"ם.
 *
 * שירת הים: כל שורה = ביתי ימני | ביתי שמאלי (לסירוגין על פני 30 שורות)
 * שירת האזינו: כל שורה = ביתי ימני | רווח | ביתי שמאלי (70 שורות)
 *
 * @param {Array} words - מערך של words בשורה
 * @param {string} layoutType - 'shirat_hayam' או 'shirat_haazinu'
 * @returns {Object} { rightWords, leftWords, layout: 'shira_yam'|'shira_haazinu' }
 */
function splitShiraLine(words, layoutType) {
    // אם השורה ריקה - מחזירים ריק
    if (words.length === 0) {
        return { rightWords: [], leftWords: [], layout: layoutType === 'shirat_hayam' ? 'shira_yam' : 'shira_haazinu' };
    }

    // חיתוך באמצע: חצי ראשון לימני, חצי שני לשמאלי
    const mid = Math.ceil(words.length / 2);
    return {
        rightWords: words.slice(0, mid),
        leftWords: words.slice(mid),
        layout: layoutType === 'shirat_hayam' ? 'shira_yam' : 'shira_haazinu'
    };
}

if (typeof window !== 'undefined') {
    window.SpecialLayouts = {
        SPECIAL_SECTIONS,
        tagSpecialSections,
        splitShiraLine
    };
}
