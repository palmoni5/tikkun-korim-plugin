// data/torah_data.js

window.torahData = {
  "metadata": { "version": "1.0", "description": "STaM layout data" },
  "books": {
    "bereshit": {
      "bookName": "בראשית",
      "parashot": {
        "bereshit": {
          "parashaName": "בראשית",
          "columns": [
            {
              "columnIndex": 1,
              "lines": [
                {
                  "lineIndex": 1,
                  "layout": "regular",
                  "stamText": "בראשית ברא אלהים את השמים ואת הארץ",
                  "nikudText": "בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ",
                  "specialLetters": { "rabati": [{ "wordIndex": 0, "letterIndex": 0 }] } // ב' רבתי
                },
                {
                  "lineIndex": 2,
                  "layout": "setuma",
                  "stamText": "ויאמר אלהים יהי אור ויהי אור {GAP} וירא אלהים",
                  "nikudText": "וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר וַיְהִי אוֹר {GAP} וַיַּרְא אֱלֹהִים"
                },
                {
                  "lineIndex": 3,
                  "layout": "petucha",
                  "stamText": "את האור כי טוב ויבדל אלהים בין האור",
                  "nikudText": "אֶת הָאוֹר כִּי טוֹב וַיַּבְדֵּל אֱלֹהִים בֵּין הָאוֹר"
                },
                {
                  "lineIndex": 4,
                  "layout": "shira_hazinu",
                  "stamText": "האזינו השמים ואדברה {GAP} ותשמע הארץ אמרי פי",
                  "nikudText": "הַאֲזִינוּ הַשָּׁמַיִם וַאֲדַבֵּרָה {GAP} וְתִשְׁמַע הָאָרֶץ אִמְרֵי פִי"
                }
              ]
            }
          ]
        }
      }
    }
  }
};