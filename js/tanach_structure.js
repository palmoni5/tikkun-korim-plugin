// js/tanach_structure.js
// =================================================================
// מבנה תנ"ך: נביאים וכתובים.
// כל ספר עם שמו (כפי שמופיע באוצריא) + מספר פרקים.
// =================================================================

const TANACH_NEVIIM = [
    { id: 'yehoshua', name: 'יהושע', chapters: 24 },
    { id: 'shoftim', name: 'שופטים', chapters: 21 },
    { id: 'shmuel_a', name: 'שמואל א', chapters: 31 },
    { id: 'shmuel_b', name: 'שמואל ב', chapters: 24 },
    { id: 'melachim_a', name: 'מלכים א', chapters: 22 },
    { id: 'melachim_b', name: 'מלכים ב', chapters: 25 },
    { id: 'yeshayahu', name: 'ישעיהו', chapters: 66 },
    { id: 'yirmiyahu', name: 'ירמיהו', chapters: 52 },
    { id: 'yechezkel', name: 'יחזקאל', chapters: 48 },
    { id: 'hoshea', name: 'הושע', chapters: 14 },
    { id: 'yoel', name: 'יואל', chapters: 4 },
    { id: 'amos', name: 'עמוס', chapters: 9 },
    { id: 'ovadia', name: 'עובדיה', chapters: 1 },
    { id: 'yona', name: 'יונה', chapters: 4 },
    { id: 'micha', name: 'מיכה', chapters: 7 },
    { id: 'nachum', name: 'נחום', chapters: 3 },
    { id: 'chavakuk', name: 'חבקוק', chapters: 3 },
    { id: 'tzfania', name: 'צפניה', chapters: 3 },
    { id: 'chagai', name: 'חגי', chapters: 2 },
    { id: 'zecharia', name: 'זכריה', chapters: 14 },
    { id: 'malachi', name: 'מלאכי', chapters: 3 }
];

const TANACH_KETUVIM = [
    { id: 'tehilim', name: 'תהילים', chapters: 150 },
    { id: 'mishlei', name: 'משלי', chapters: 31 },
    { id: 'iyov', name: 'איוב', chapters: 42 },
    { id: 'shir_hashirim', name: 'שיר השירים', chapters: 8 },
    { id: 'ruth', name: 'רות', chapters: 4 },
    { id: 'eicha', name: 'איכה', chapters: 5 },
    { id: 'kohelet', name: 'קהלת', chapters: 12 },
    { id: 'esther', name: 'אסתר', chapters: 10 },
    { id: 'daniel', name: 'דניאל', chapters: 12 },
    { id: 'ezra', name: 'עזרא', chapters: 10 },
    { id: 'nechemia', name: 'נחמיה', chapters: 13 },
    { id: 'divrei_hayamim_a', name: 'דברי הימים א', chapters: 29 },
    { id: 'divrei_hayamim_b', name: 'דברי הימים ב', chapters: 36 }
];

const TANACH_SECTIONS = {
    torah: { name: 'תורה', books: null }, // מטופל בנפרד
    neviim: { name: 'נביאים', books: TANACH_NEVIIM },
    ketuvim: { name: 'כתובים', books: TANACH_KETUVIM },
    haftarot: { name: 'הפטרות', books: null } // מטופל בנפרד מול HAFTAROT_LIST
};

// מיפוי שם ספר נביא/כתוב (כפי שמופיע ב-HAFTAROT_LIST) למבנה הספר ב-TANACH_NEVIIM/KETUVIM
function findTanachBookByName(name) {
    const all = [...TANACH_NEVIIM, ...TANACH_KETUVIM];
    return all.find(b => b.name === name);
}

if (typeof window !== 'undefined') {
    window.TANACH_SECTIONS = TANACH_SECTIONS;
    window.TANACH_NEVIIM = TANACH_NEVIIM;
    window.TANACH_KETUVIM = TANACH_KETUVIM;
    window.findTanachBookByName = findTanachBookByName;
}
