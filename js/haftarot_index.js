// js/haftarot_index.js
// רשימת הפטרות מאוחדת: פרשיות + שבתות מיוחדות + חגים
// מקור: hebcal/hebcal-leyning (BSD 2-Clause)
// https://github.com/hebcal/hebcal-leyning

const HAFTAROT_LIST = [
  {
    id: "p:Bereshit",
    category: "parasha",
    name: "בראשית",
    ashkenaz: [{"book":"ישעיהו","from":"42:5","to":"43:10"}],
    sephard: [{"book":"ישעיהו","from":"42:5","to":"42:21"}]
  },
  {
    id: "p:Noach",
    category: "parasha",
    name: "נח",
    ashkenaz: [{"book":"ישעיהו","from":"54:1","to":"55:5"}],
    sephard: [{"book":"ישעיהו","from":"54:1","to":"54:10"}]
  },
  {
    id: "p:Lech-Lecha",
    category: "parasha",
    name: "לך לך",
    ashkenaz: [{"book":"ישעיהו","from":"40:27","to":"41:16"}],
    sephard: [{"book":"ישעיהו","from":"40:27","to":"41:16"}]
  },
  {
    id: "p:Vayera",
    category: "parasha",
    name: "וירא",
    ashkenaz: [{"book":"מלכים ב","from":"4:1","to":"4:37"}],
    sephard: [{"book":"מלכים ב","from":"4:1","to":"4:23"}]
  },
  {
    id: "p:Chayei Sara",
    category: "parasha",
    name: "חיי שרה",
    ashkenaz: [{"book":"מלכים א","from":"1:1","to":"1:31"}],
    sephard: [{"book":"מלכים א","from":"1:1","to":"1:31"}]
  },
  {
    id: "p:Toldot",
    category: "parasha",
    name: "תולדות",
    ashkenaz: [{"book":"מלאכי","from":"1:1","to":"2:7"}],
    sephard: [{"book":"מלאכי","from":"1:1","to":"2:7"}]
  },
  {
    id: "p:Vayetzei",
    category: "parasha",
    name: "ויצא",
    ashkenaz: [{"book":"הושע","from":"12:13","to":"14:10"}],
    sephard: [{"book":"הושע","from":"11:7","to":"12:12"}]
  },
  {
    id: "p:Vayishlach",
    category: "parasha",
    name: "וישלח",
    ashkenaz: [{"book":"עובדיה","from":"1:1","to":"1:21"}],
    sephard: [{"book":"עובדיה","from":"1:1","to":"1:21"}]
  },
  {
    id: "p:Vayeshev",
    category: "parasha",
    name: "וישב",
    ashkenaz: [{"book":"עמוס","from":"2:6","to":"3:8"}],
    sephard: [{"book":"עמוס","from":"2:6","to":"3:8"}]
  },
  {
    id: "p:Miketz",
    category: "parasha",
    name: "מקץ",
    ashkenaz: [{"book":"מלכים א","from":"3:15","to":"4:1"}],
    sephard: [{"book":"מלכים א","from":"3:15","to":"4:1"}]
  },
  {
    id: "p:Vayigash",
    category: "parasha",
    name: "ויגש",
    ashkenaz: [{"book":"יחזקאל","from":"37:15","to":"37:28"}],
    sephard: [{"book":"יחזקאל","from":"37:15","to":"37:28"}]
  },
  {
    id: "p:Vayechi",
    category: "parasha",
    name: "ויחי",
    ashkenaz: [{"book":"מלכים א","from":"2:1","to":"2:12"}],
    sephard: [{"book":"מלכים א","from":"2:1","to":"2:12"}]
  },
  {
    id: "p:Shemot",
    category: "parasha",
    name: "שמות",
    ashkenaz: [{"book":"ישעיהו","from":"27:6","to":"28:13"},{"book":"ישעיהו","from":"29:22","to":"29:23"}],
    sephard: [{"book":"ירמיהו","from":"1:1","to":"2:3"}]
  },
  {
    id: "p:Vaera",
    category: "parasha",
    name: "וארא",
    ashkenaz: [{"book":"יחזקאל","from":"28:25","to":"29:21"}],
    sephard: [{"book":"יחזקאל","from":"28:25","to":"29:21"}]
  },
  {
    id: "p:Bo",
    category: "parasha",
    name: "בא",
    ashkenaz: [{"book":"ירמיהו","from":"46:13","to":"46:28"}],
    sephard: [{"book":"ירמיהו","from":"46:13","to":"46:28"}]
  },
  {
    id: "p:Beshalach",
    category: "parasha",
    name: "בשלח",
    ashkenaz: [{"book":"שופטים","from":"4:4","to":"5:31"}],
    sephard: [{"book":"שופטים","from":"5:1","to":"5:31"}]
  },
  {
    id: "p:Yitro",
    category: "parasha",
    name: "יתרו",
    ashkenaz: [{"book":"ישעיהו","from":"6:1","to":"7:6"},{"book":"ישעיהו","from":"9:5","to":"9:6"}],
    sephard: [{"book":"ישעיהו","from":"6:1","to":"6:13"}]
  },
  {
    id: "p:Mishpatim",
    category: "parasha",
    name: "משפטים",
    ashkenaz: [{"book":"ירמיהו","from":"34:8","to":"34:22"},{"book":"ירמיהו","from":"33:25","to":"33:26"}],
    sephard: [{"book":"ירמיהו","from":"34:8","to":"34:22"},{"book":"ירמיהו","from":"33:25","to":"33:26"}]
  },
  {
    id: "p:Terumah",
    category: "parasha",
    name: "תרומה",
    ashkenaz: [{"book":"מלכים א","from":"5:26","to":"6:13"}],
    sephard: [{"book":"מלכים א","from":"5:26","to":"6:13"}]
  },
  {
    id: "p:Tetzaveh",
    category: "parasha",
    name: "תצוה",
    ashkenaz: [{"book":"יחזקאל","from":"43:10","to":"43:27"}],
    sephard: [{"book":"יחזקאל","from":"43:10","to":"43:27"}]
  },
  {
    id: "p:Ki Tisa",
    category: "parasha",
    name: "כי תשא",
    ashkenaz: [{"book":"מלכים א","from":"18:1","to":"18:39"}],
    sephard: [{"book":"מלכים א","from":"18:20","to":"18:39"}]
  },
  {
    id: "p:Vayakhel",
    category: "parasha",
    name: "ויקהל",
    ashkenaz: [{"book":"מלכים א","from":"7:40","to":"7:50"}],
    sephard: [{"book":"מלכים א","from":"7:13","to":"7:26"}]
  },
  {
    id: "p:Pekudei",
    category: "parasha",
    name: "פקודי",
    ashkenaz: [{"book":"מלכים א","from":"7:51","to":"8:21"}],
    sephard: [{"book":"מלכים א","from":"7:40","to":"7:50"}]
  },
  {
    id: "p:Vayikra",
    category: "parasha",
    name: "ויקרא",
    ashkenaz: [{"book":"ישעיהו","from":"43:21","to":"44:23"}],
    sephard: [{"book":"ישעיהו","from":"43:21","to":"44:23"}]
  },
  {
    id: "p:Tzav",
    category: "parasha",
    name: "צו",
    ashkenaz: [{"book":"ירמיהו","from":"7:21","to":"8:3"},{"book":"ירמיהו","from":"9:22","to":"9:23"}],
    sephard: [{"book":"ירמיהו","from":"7:21","to":"8:3"},{"book":"ירמיהו","from":"9:22","to":"9:23"}]
  },
  {
    id: "p:Shmini",
    category: "parasha",
    name: "שמיני",
    ashkenaz: [{"book":"שמואל ב","from":"6:1","to":"7:17"}],
    sephard: [{"book":"שמואל ב","from":"6:1","to":"6:19"}]
  },
  {
    id: "p:Tazria",
    category: "parasha",
    name: "תזריע",
    ashkenaz: [{"book":"מלכים ב","from":"4:42","to":"5:19"}],
    sephard: [{"book":"מלכים ב","from":"4:42","to":"5:19"}]
  },
  {
    id: "p:Metzora",
    category: "parasha",
    name: "מצורע",
    ashkenaz: [{"book":"מלכים ב","from":"7:3","to":"7:20"}],
    sephard: [{"book":"מלכים ב","from":"7:3","to":"7:20"}]
  },
  {
    id: "p:Achrei Mot",
    category: "parasha",
    name: "אחרי מות",
    ashkenaz: [{"book":"עמוס","from":"9:7","to":"9:15"}],
    sephard: [{"book":"יחזקאל","from":"22:1","to":"22:16"}]
  },
  {
    id: "p:Kedoshim",
    category: "parasha",
    name: "קדושים",
    ashkenaz: [{"book":"יחזקאל","from":"22:1","to":"22:19"}],
    sephard: [{"book":"יחזקאל","from":"20:2","to":"20:20"}]
  },
  {
    id: "p:Achrei Mot-Kedoshim",
    category: "parasha",
    name: "אחרי מות-קדושים",
    ashkenaz: [{"book":"עמוס","from":"9:7","to":"9:15"}],
    sephard: [{"book":"יחזקאל","from":"20:2","to":"20:20"}]
  },
  {
    id: "p:Emor",
    category: "parasha",
    name: "אמור",
    ashkenaz: [{"book":"יחזקאל","from":"44:15","to":"44:31"}],
    sephard: [{"book":"יחזקאל","from":"44:15","to":"44:31"}]
  },
  {
    id: "p:Behar",
    category: "parasha",
    name: "בהר",
    ashkenaz: [{"book":"ירמיהו","from":"32:6","to":"32:27"}],
    sephard: [{"book":"ירמיהו","from":"32:6","to":"32:27"}]
  },
  {
    id: "p:Bechukotai",
    category: "parasha",
    name: "בחוקותי",
    ashkenaz: [{"book":"ירמיהו","from":"16:19","to":"17:14"}],
    sephard: [{"book":"ירמיהו","from":"16:19","to":"17:14"}]
  },
  {
    id: "p:Bamidbar",
    category: "parasha",
    name: "במדבר",
    ashkenaz: [{"book":"הושע","from":"2:1","to":"2:22"}],
    sephard: [{"book":"הושע","from":"2:1","to":"2:22"}]
  },
  {
    id: "p:Nasso",
    category: "parasha",
    name: "נשא",
    ashkenaz: [{"book":"שופטים","from":"13:2","to":"13:25"}],
    sephard: [{"book":"שופטים","from":"13:2","to":"13:25"}]
  },
  {
    id: "p:Beha'alotcha",
    category: "parasha",
    name: "בהעלותך",
    ashkenaz: [{"book":"זכריה","from":"2:14","to":"4:7"}],
    sephard: [{"book":"זכריה","from":"2:14","to":"4:7"}]
  },
  {
    id: "p:Sh'lach",
    category: "parasha",
    name: "שלח לך",
    ashkenaz: [{"book":"יהושע","from":"2:1","to":"2:24"}],
    sephard: [{"book":"יהושע","from":"2:1","to":"2:24"}]
  },
  {
    id: "p:Korach",
    category: "parasha",
    name: "קרח",
    ashkenaz: [{"book":"שמואל א","from":"11:14","to":"12:22"}],
    sephard: [{"book":"שמואל א","from":"11:14","to":"12:22"}]
  },
  {
    id: "p:Chukat",
    category: "parasha",
    name: "חקת",
    ashkenaz: [{"book":"שופטים","from":"11:1","to":"11:33"}],
    sephard: [{"book":"שופטים","from":"11:1","to":"11:33"}]
  },
  {
    id: "p:Balak",
    category: "parasha",
    name: "בלק",
    ashkenaz: [{"book":"מיכה","from":"5:6","to":"6:8"}],
    sephard: [{"book":"מיכה","from":"5:6","to":"6:8"}]
  },
  {
    id: "p:Pinchas",
    category: "parasha",
    name: "פנחס",
    ashkenaz: [{"book":"מלכים א","from":"18:46","to":"19:21"}],
    sephard: [{"book":"מלכים א","from":"18:46","to":"19:21"}]
  },
  {
    id: "p:Matot",
    category: "parasha",
    name: "מטות",
    ashkenaz: [{"book":"ירמיהו","from":"1:1","to":"2:3"}],
    sephard: [{"book":"ירמיהו","from":"1:1","to":"2:3"}]
  },
  {
    id: "p:Masei",
    category: "parasha",
    name: "מסעי",
    ashkenaz: [{"book":"ירמיהו","from":"2:4","to":"2:28"},{"book":"ירמיהו","from":"3:4","to":"3:4"}],
    sephard: [{"book":"ירמיהו","from":"2:4","to":"2:28"},{"book":"ירמיהו","from":"4:1","to":"4:2"}]
  },
  {
    id: "p:Devarim",
    category: "parasha",
    name: "דברים",
    ashkenaz: [{"book":"ישעיהו","from":"1:1","to":"1:27"}],
    sephard: [{"book":"ישעיהו","from":"1:1","to":"1:27"}]
  },
  {
    id: "p:Vaetchanan",
    category: "parasha",
    name: "ואתחנן",
    ashkenaz: [{"book":"ישעיהו","from":"40:1","to":"40:26"}],
    sephard: [{"book":"ישעיהו","from":"40:1","to":"40:26"}]
  },
  {
    id: "p:Eikev",
    category: "parasha",
    name: "עקב",
    ashkenaz: [{"book":"ישעיהו","from":"49:14","to":"51:3"}],
    sephard: [{"book":"ישעיהו","from":"49:14","to":"51:3"}]
  },
  {
    id: "p:Re'eh",
    category: "parasha",
    name: "ראה",
    ashkenaz: [{"book":"ישעיהו","from":"54:11","to":"55:5"}],
    sephard: [{"book":"ישעיהו","from":"54:11","to":"55:5"}]
  },
  {
    id: "p:Shoftim",
    category: "parasha",
    name: "שופטים",
    ashkenaz: [{"book":"ישעיהו","from":"51:12","to":"52:12"}],
    sephard: [{"book":"ישעיהו","from":"51:12","to":"52:12"}]
  },
  {
    id: "p:Ki Teitzei",
    category: "parasha",
    name: "כי תצא",
    ashkenaz: [{"book":"ישעיהו","from":"54:1","to":"54:10"}],
    sephard: [{"book":"ישעיהו","from":"54:1","to":"54:10"}]
  },
  {
    id: "p:Ki Tavo",
    category: "parasha",
    name: "כי תבוא",
    ashkenaz: [{"book":"ישעיהו","from":"60:1","to":"60:22"}],
    sephard: [{"book":"ישעיהו","from":"60:1","to":"60:22"}]
  },
  {
    id: "p:Nitzavim",
    category: "parasha",
    name: "נצבים",
    ashkenaz: [{"book":"ישעיהו","from":"61:10","to":"63:9"}],
    sephard: [{"book":"ישעיהו","from":"61:10","to":"63:9"}]
  },
  {
    id: "p:Vayeilech",
    category: "parasha",
    name: "וילך",
    ashkenaz: [{"book":"ישעיהו","from":"55:6","to":"56:8"}],
    sephard: [{"book":"ישעיהו","from":"55:6","to":"56:8"}]
  },
  {
    id: "p:Ha'azinu",
    category: "parasha",
    name: "האזינו",
    ashkenaz: [{"book":"שמואל ב","from":"22:1","to":"22:51"}],
    sephard: [{"book":"שמואל ב","from":"22:1","to":"22:51"}]
  },
  {
    id: "p:Vezot Haberakhah",
    category: "parasha",
    name: "וזאת הברכה",
    ashkenaz: [{"book":"יהושע","from":"1:1","to":"1:18"}],
    sephard: [{"book":"יהושע","from":"1:1","to":"1:9"}]
  },
  {
    id: "h:Pesach I",
    category: "special",
    name: "פסח - יום ראשון",
    ashkenaz: [{"book":"יהושע","from":"3:5","to":"3:7"},{"book":"יהושע","from":"5:2","to":"6:1"},{"book":"יהושע","from":"6:27","to":"6:27"}],
    sephard: [{"book":"יהושע","from":"5:2","to":"6:1"},{"book":"יהושע","from":"6:27","to":"6:27"}]
  },
  {
    id: "h:Pesach I (on Shabbat)",
    category: "special",
    name: "פסח - יום ראשון (כשחל בשבת)",
    ashkenaz: [{"book":"יהושע","from":"3:5","to":"3:7"},{"book":"יהושע","from":"5:2","to":"6:1"},{"book":"יהושע","from":"6:27","to":"6:27"}],
    sephard: [{"book":"יהושע","from":"5:2","to":"6:1"},{"book":"יהושע","from":"6:27","to":"6:27"}]
  },
  {
    id: "h:Pesach II",
    category: "special",
    name: "פסח - יום שני (חו\"ל)",
    ashkenaz: [{"book":"מלכים ב","from":"23:1","to":"23:9"},{"book":"מלכים ב","from":"23:21","to":"23:25"}],
    sephard: [{"book":"מלכים ב","from":"23:1","to":"23:9"},{"book":"מלכים ב","from":"23:21","to":"23:25"}]
  },
  {
    id: "h:Pesach Shabbat Chol ha-Moed",
    category: "special",
    name: "פסח - שבת חול המועד",
    ashkenaz: [{"book":"יחזקאל","from":"37:1","to":"37:14"}],
    sephard: [{"book":"יחזקאל","from":"37:1","to":"37:14"}]
  },
  {
    id: "h:Pesach VII",
    category: "special",
    name: "פסח - שביעי של פסח",
    ashkenaz: [{"book":"שמואל ב","from":"22:1","to":"22:51"}],
    sephard: [{"book":"שמואל ב","from":"22:1","to":"22:51"}]
  },
  {
    id: "h:Pesach VII (on Shabbat)",
    category: "special",
    name: "פסח - שביעי של פסח (כשחל בשבת)",
    ashkenaz: [{"book":"שמואל ב","from":"22:1","to":"22:51"}],
    sephard: [{"book":"שמואל ב","from":"22:1","to":"22:51"}]
  },
  {
    id: "h:Pesach VIII",
    category: "special",
    name: "פסח - אחרון של פסח (חו\"ל)",
    ashkenaz: [{"book":"ישעיהו","from":"10:32","to":"12:6"}],
    sephard: [{"book":"ישעיהו","from":"10:32","to":"12:6"}]
  },
  {
    id: "h:Pesach VIII (on Shabbat)",
    category: "special",
    name: "פסח - אחרון של פסח (כשחל בשבת)",
    ashkenaz: [{"book":"ישעיהו","from":"10:32","to":"12:6"}],
    sephard: [{"book":"ישעיהו","from":"10:32","to":"12:6"}]
  },
  {
    id: "h:Shavuot",
    category: "special",
    name: "שבועות",
    ashkenaz: [{"book":"יחזקאל","from":"1:1","to":"1:28"},{"book":"יחזקאל","from":"3:12","to":"3:12"}],
    sephard: [{"book":"יחזקאל","from":"1:1","to":"1:28"},{"book":"יחזקאל","from":"3:12","to":"3:12"}]
  },
  {
    id: "h:Shavuot I",
    category: "special",
    name: "שבועות - יום ראשון",
    ashkenaz: [{"book":"יחזקאל","from":"1:1","to":"1:28"},{"book":"יחזקאל","from":"3:12","to":"3:12"}],
    sephard: [{"book":"יחזקאל","from":"1:1","to":"1:28"},{"book":"יחזקאל","from":"3:12","to":"3:12"}]
  },
  {
    id: "h:Shavuot II",
    category: "special",
    name: "שבועות - יום שני (חו\"ל)",
    ashkenaz: [{"book":"חבקוק","from":"3:1","to":"3:19"}],
    sephard: [{"book":"חבקוק","from":"2:20","to":"3:19"}]
  },
  {
    id: "h:Shavuot II (on Shabbat)",
    category: "special",
    name: "שבועות - יום שני (כשחל בשבת)",
    ashkenaz: [{"book":"חבקוק","from":"3:1","to":"3:19"}],
    sephard: [{"book":"חבקוק","from":"2:20","to":"3:19"}]
  },
  {
    id: "h:Tish'a B'Av",
    category: "special",
    name: "תשעה באב - שחרית",
    ashkenaz: [{"book":"ירמיהו","from":"8:13","to":"9:23"}],
    sephard: [{"book":"ירמיהו","from":"8:13","to":"9:23"}]
  },
  {
    id: "h:Fast Day (Afternoon)",
    category: "special",
    name: "תענית - מנחה",
    ashkenaz: [{"book":"ישעיהו","from":"55:6","to":"56:8"}],
    sephard: [{"book":"ישעיהו","from":"55:6","to":"56:8"}]
  },
  {
    id: "h:Rosh Hashana I",
    category: "special",
    name: "ראש השנה - יום ראשון",
    ashkenaz: [{"book":"שמואל א","from":"1:1","to":"2:10"}],
    sephard: [{"book":"שמואל א","from":"1:1","to":"2:10"}]
  },
  {
    id: "h:Rosh Hashana I (on Shabbat)",
    category: "special",
    name: "ראש השנה - יום ראשון (כשחל בשבת)",
    ashkenaz: [{"book":"שמואל א","from":"1:1","to":"2:10"}],
    sephard: [{"book":"שמואל א","from":"1:1","to":"2:10"}]
  },
  {
    id: "h:Rosh Hashana II",
    category: "special",
    name: "ראש השנה - יום שני",
    ashkenaz: [{"book":"ירמיהו","from":"31:2","to":"31:20"}],
    sephard: [{"book":"ירמיהו","from":"31:2","to":"31:20"}]
  },
  {
    id: "h:Yom Kippur",
    category: "special",
    name: "יום כיפור - שחרית",
    ashkenaz: [{"book":"ישעיהו","from":"57:14","to":"58:14"}],
    sephard: [{"book":"ישעיהו","from":"57:14","to":"58:14"}]
  },
  {
    id: "h:Yom Kippur (on Shabbat)",
    category: "special",
    name: "יום כיפור - שחרית (כשחל בשבת)",
    ashkenaz: [{"book":"ישעיהו","from":"57:14","to":"58:14"}],
    sephard: [{"book":"ישעיהו","from":"57:14","to":"58:14"}]
  },
  {
    id: "h:Yom Kippur (Mincha, Traditional)",
    category: "special",
    name: "יום כיפור - מנחה (נוסח מסורתי)",
    ashkenaz: [{"book":"יונה","from":"1:1","to":"4:11"},{"book":"מיכה","from":"7:18","to":"7:20"}],
    sephard: [{"book":"יונה","from":"1:1","to":"4:11"},{"book":"מיכה","from":"7:18","to":"7:20"}]
  },
  {
    id: "h:Yom Kippur (Mincha, Alternate)",
    category: "special",
    name: "יום כיפור - מנחה (נוסח חלופי)",
    ashkenaz: [{"book":"יונה","from":"1:1","to":"4:11"},{"book":"מיכה","from":"7:18","to":"7:20"}],
    sephard: [{"book":"יונה","from":"1:1","to":"4:11"},{"book":"מיכה","from":"7:18","to":"7:20"}]
  },
  {
    id: "h:Sukkot I",
    category: "special",
    name: "סוכות - יום ראשון",
    ashkenaz: [{"book":"זכריה","from":"14:1","to":"14:21"}],
    sephard: [{"book":"זכריה","from":"14:1","to":"14:21"}]
  },
  {
    id: "h:Sukkot I (on Shabbat)",
    category: "special",
    name: "סוכות - יום ראשון (כשחל בשבת)",
    ashkenaz: [{"book":"זכריה","from":"14:1","to":"14:21"}],
    sephard: [{"book":"זכריה","from":"14:1","to":"14:21"}]
  },
  {
    id: "h:Sukkot II",
    category: "special",
    name: "סוכות - יום שני (חו\"ל)",
    ashkenaz: [{"book":"מלכים א","from":"8:2","to":"8:21"}],
    sephard: [{"book":"מלכים א","from":"8:2","to":"8:21"}]
  },
  {
    id: "h:Sukkot Shabbat Chol ha-Moed",
    category: "special",
    name: "סוכות - שבת חול המועד",
    ashkenaz: [{"book":"יחזקאל","from":"38:18","to":"39:16"}],
    sephard: [{"book":"יחזקאל","from":"38:18","to":"39:16"}]
  },
  {
    id: "h:Shmini Atzeret",
    category: "special",
    name: "שמיני עצרת",
    ashkenaz: [{"book":"מלכים א","from":"8:54","to":"8:66"}],
    sephard: [{"book":"מלכים א","from":"8:54","to":"8:66"}]
  },
  {
    id: "h:Shmini Atzeret (on Shabbat)",
    category: "special",
    name: "שמיני עצרת (כשחל בשבת)",
    ashkenaz: [{"book":"מלכים א","from":"8:54","to":"8:66"}],
    sephard: [{"book":"מלכים א","from":"8:54","to":"8:66"}]
  },
  {
    id: "h:Simchat Torah",
    category: "special",
    name: "שמחת תורה",
    ashkenaz: [{"book":"יהושע","from":"1:1","to":"1:18"}],
    sephard: [{"book":"יהושע","from":"1:1","to":"1:18"}]
  },
  {
    id: "h:Simchat Torah (on Shabbat)",
    category: "special",
    name: "שמחת תורה (כשחל בשבת)",
    ashkenaz: [{"book":"יהושע","from":"1:1","to":"1:18"}],
    sephard: [{"book":"יהושע","from":"1:1","to":"1:18"}]
  },
  {
    id: "h:Shabbat Rosh Chodesh Chanukah",
    category: "special",
    name: "שבת ראש חודש חנוכה",
    ashkenaz: [{"book":"זכריה","from":"2:14","to":"4:7"}],
    sephard: [{"book":"זכריה","from":"2:14","to":"4:7"}]
  },
  {
    id: "h:Chanukah Day 1 (on Shabbat)",
    category: "special",
    name: "חנוכה - שבת ראשון",
    ashkenaz: [{"book":"זכריה","from":"2:14","to":"4:7"}],
    sephard: [{"book":"זכריה","from":"2:14","to":"4:7"}]
  },
  {
    id: "h:Chanukah Day 2 (on Shabbat)",
    category: "special",
    name: "חנוכה - שבת שני",
    ashkenaz: [{"book":"זכריה","from":"2:14","to":"4:7"}],
    sephard: [{"book":"זכריה","from":"2:14","to":"4:7"}]
  },
  {
    id: "h:Chanukah Day 3 (on Shabbat)",
    category: "special",
    name: "חנוכה - שבת שלישי",
    ashkenaz: [{"book":"זכריה","from":"2:14","to":"4:7"}],
    sephard: [{"book":"זכריה","from":"2:14","to":"4:7"}]
  },
  {
    id: "h:Chanukah Day 4 (on Shabbat)",
    category: "special",
    name: "חנוכה - שבת רביעי",
    ashkenaz: [{"book":"זכריה","from":"2:14","to":"4:7"}],
    sephard: [{"book":"זכריה","from":"2:14","to":"4:7"}]
  },
  {
    id: "h:Chanukah Day 5 (on Shabbat)",
    category: "special",
    name: "חנוכה - שבת חמישי",
    ashkenaz: [{"book":"זכריה","from":"2:14","to":"4:7"}],
    sephard: [{"book":"זכריה","from":"2:14","to":"4:7"}]
  },
  {
    id: "h:Chanukah Day 7 (on Shabbat)",
    category: "special",
    name: "חנוכה - שבת שביעי",
    ashkenaz: [{"book":"זכריה","from":"2:14","to":"4:7"}],
    sephard: [{"book":"זכריה","from":"2:14","to":"4:7"}]
  },
  {
    id: "h:Chanukah Day 8 (on Shabbat)",
    category: "special",
    name: "חנוכה - שבת שמיני",
    ashkenaz: [{"book":"מלכים א","from":"7:40","to":"7:50"}],
    sephard: [{"book":"מלכים א","from":"7:40","to":"7:50"}]
  },
  {
    id: "h:Shabbat Shekalim",
    category: "special",
    name: "שבת שקלים",
    ashkenaz: [{"book":"מלכים ב","from":"12:1","to":"12:17"}],
    sephard: [{"book":"מלכים ב","from":"11:17","to":"12:17"}]
  },
  {
    id: "h:Shabbat Shekalim (on Rosh Chodesh)",
    category: "special",
    name: "שבת שקלים (כשחל בראש חודש)",
    ashkenaz: [{"book":"מלכים ב","from":"12:1","to":"12:17"}],
    sephard: [{"book":"מלכים ב","from":"11:17","to":"12:17"}]
  },
  {
    id: "h:Shabbat Zachor",
    category: "special",
    name: "שבת זכור",
    ashkenaz: [{"book":"שמואל א","from":"15:2","to":"15:34"}],
    sephard: [{"book":"שמואל א","from":"15:1","to":"15:34"}]
  },
  {
    id: "h:Shabbat Parah",
    category: "special",
    name: "שבת פרה",
    ashkenaz: [{"book":"יחזקאל","from":"36:16","to":"36:38"}],
    sephard: [{"book":"יחזקאל","from":"36:16","to":"36:36"}]
  },
  {
    id: "h:Shabbat HaChodesh",
    category: "special",
    name: "שבת החודש",
    ashkenaz: [{"book":"יחזקאל","from":"45:16","to":"46:18"}],
    sephard: [{"book":"יחזקאל","from":"45:18","to":"46:15"}]
  },
  {
    id: "h:Shabbat HaChodesh (on Rosh Chodesh)",
    category: "special",
    name: "שבת החודש (כשחל בראש חודש)",
    ashkenaz: [{"book":"יחזקאל","from":"45:16","to":"46:18"}],
    sephard: [{"book":"יחזקאל","from":"45:18","to":"46:15"}]
  },
  {
    id: "h:Shabbat HaGadol",
    category: "special",
    name: "שבת הגדול",
    ashkenaz: [{"book":"מלאכי","from":"3:4","to":"3:24"}],
    sephard: [{"book":"מלאכי","from":"3:4","to":"3:24"}]
  },
  {
    id: "h:Shabbat Shuva",
    category: "special",
    name: "שבת שובה",
    ashkenaz: [{"book":"הושע","from":"14:2","to":"14:10"},{"book":"מיכה","from":"7:18","to":"7:20"},{"book":"יואל","from":"2:15","to":"2:27"}],
    sephard: [{"book":"הושע","from":"14:2","to":"14:10"},{"book":"מיכה","from":"7:18","to":"7:20"},{"book":"יואל","from":"2:15","to":"2:27"}]
  },
  {
    id: "h:Shabbat Shuva (with Vayeilech)",
    category: "special",
    name: "שבת שובה (פרשת וילך)",
    ashkenaz: [{"book":"הושע","from":"14:2","to":"14:10"},{"book":"מיכה","from":"7:18","to":"7:20"}],
    sephard: [{"book":"הושע","from":"14:2","to":"14:10"},{"book":"מיכה","from":"7:18","to":"7:20"}]
  },
  {
    id: "h:Shabbat Shuva (with Ha'azinu)",
    category: "special",
    name: "שבת שובה (פרשת האזינו)",
    ashkenaz: [{"book":"הושע","from":"14:2","to":"14:10"},{"book":"יואל","from":"2:15","to":"2:27"}],
    sephard: [{"book":"הושע","from":"14:2","to":"14:10"},{"book":"מיכה","from":"7:18","to":"7:20"}]
  },
  {
    id: "h:Shabbat Rosh Chodesh",
    category: "special",
    name: "שבת ראש חודש",
    ashkenaz: [{"book":"ישעיהו","from":"66:1","to":"66:24"}],
    sephard: [{"book":"ישעיהו","from":"66:1","to":"66:24"}]
  },
  {
    id: "h:Shabbat Machar Chodesh",
    category: "special",
    name: "שבת מחר חודש",
    ashkenaz: [{"book":"שמואל א","from":"20:18","to":"20:42"}],
    sephard: [{"book":"שמואל א","from":"20:18","to":"20:42"}]
  },
  {
    id: "h:Pinchas occurring after 17 Tammuz",
    category: "special",
    name: "פנחס - כשחל אחרי י\"ז תמוז",
    ashkenaz: [{"book":"ירמיהו","from":"1:1","to":"2:3"}],
    sephard: [{"book":"ירמיהו","from":"1:1","to":"2:3"}]
  },
  {
    id: "h:Kedoshim following Special Shabbat",
    category: "special",
    name: "קדושים אחרי שבת מיוחדת",
    ashkenaz: [{"book":"עמוס","from":"9:7","to":"9:15"}],
    sephard: [{"book":"יחזקאל","from":"20:2","to":"20:20"}]
  },
  {
    id: "h:Masei on Shabbat Rosh Chodesh",
    category: "special",
    name: "מסעי - בשבת ראש חודש",
    ashkenaz: [{"book":"ירמיהו","from":"2:4","to":"2:28"},{"book":"ירמיהו","from":"3:4","to":"3:4"}],
    sephard: [{"book":"ירמיהו","from":"2:4","to":"2:28"},{"book":"ירמיהו","from":"4:1","to":"4:2"},{"book":"ישעיהו","from":"66:1","to":"66:1"},{"book":"ישעיהו","from":"66:23","to":"66:23"}]
  },
  {
    id: "h:Ki Teitzei with 3rd Haftarah of Consolation",
    category: "special",
    name: "כי תצא - עם הפטרה ג' של נחמתא",
    ashkenaz: [{"book":"ישעיהו","from":"54:1","to":"54:10"},{"book":"ישעיהו","from":"54:11","to":"55:5"}],
    sephard: [{"book":"ישעיהו","from":"54:1","to":"54:10"},{"book":"ישעיהו","from":"54:11","to":"55:5"}]
  }
];

if (typeof window !== "undefined") {
  window.HAFTAROT_LIST = HAFTAROT_LIST;
}