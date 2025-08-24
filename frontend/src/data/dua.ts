
export type DuaItem = {
  id: string;
  titleKey: string; // Translation key instead of hardcoded title
  arabic?: string;
  transliteration?: {
    en: string;
    ar: string;
    ur: string;
    tr: string;
  };
  translation?: {
    en: string;
    ar: string;
    ur: string;
    tr: string;
  };
  note?: string;
};

export type DuaCategory = {
  key: string;
  labelKey: string; // Translation key instead of hardcoded label
  icon: string; // icon name or URI
  items: DuaItem[];
};

export type DuaSection = {
  key: string;
  labelKey: string; // Translation key instead of hardcoded label
  categories: DuaCategory[];
};

export const DUA_SECTIONS: DuaSection[] = [
  {
    key: 'daily',
    labelKey: 'daily',
    categories: [
      {
        key: 'sleeping',
        labelKey: 'sleeping',
        icon: 'bed',
        items: [
          {
            id: 'sleep-1',
            titleKey: 'whenYouWakeUp',
            arabic: 'الْـحَمْـدُ للهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
            transliteration: {
              en: 'Alhamdu lillaahil-lathee ahyaanaa ba\'da maa amaatanaa wa ilayhin-nushoor',
              ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
              ur: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
              tr: 'Elhamdü lillâhillezî ahyânâ ba\'de mâ emâtenâ ve ileyhin-nüşûr'
            },
            translation: {
              en: 'All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.',
              ar: 'الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور',
              ur: 'تمام تعریفیں اللہ کے لیے ہیں جس نے ہمیں موت کے بعد زندگی دی اور اسی کی طرف دوبارہ اٹھنا ہے',
              tr: 'Bizi öldürdükten sonra dirilten ve kendisine döndürecek olan Allaha hamd olsun.'
            }
          },
          {
            id: 'sleep-2',
            titleKey: 'reciteThisAfterEverySalah',
            arabic: 'اللَّهُمَّ أَجِرْنِي مِنْ النَّارِ',
            transliteration: {
              en: 'Allahumma ajirni min an-naar',
              ar: 'اللَّهُمَّ أَجِرْنِي مِنْ النَّارِ',
              ur: 'اللَّهُمَّ أَجِرْنِي مِنْ النَّارِ',
              tr: 'Allahümme ecirnî minen-nâr'
            },
            translation: {
              en: 'O Allah, save me from the Fire.',
              ar: 'اللهم أجرني من النار',
              ur: 'اے اللہ، مجھے آگ سے بچا',
              tr: 'Allahım, beni ateşten koru.'
            }
          }
        ]
      },
      {
        key: 'toilet',
        labelKey: 'toilet',
        icon: 'toilet',
        items: [
          {
            id: 'toilet-1',
            titleKey: 'beforeEnteringTheToilet',
            arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
            transliteration: {
              en: 'Allahumma inni a\'udhu bika minal-khubthi wal-khaba\'ith',
              ar: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
              ur: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
              tr: 'Allahümme innî e\'ûzü bike minel-hubsi vel-habâis'
            },
            translation: {
              en: 'O Allah, I seek refuge with You from all evil and evil-doers.',
              ar: 'اللهم إني أعوذ بك من الخبث والخبائث',
              ur: 'اے اللہ، میں آپ کی پناہ میں آتا ہوں تمام برائی اور برے لوگوں سے',
              tr: 'Allahım, bütün kötülük ve kötülerden sana sığınırım.'
            }
          },
          {
            id: 'toilet-2',
            titleKey: 'afterLeavingTheToilet',
            arabic: 'غُفْرَانَكَ',
            transliteration: {
              en: 'Ghufranak',
              ar: 'غُفْرَانَكَ',
              ur: 'غُفْرَانَكَ',
              tr: 'Ğufrânek'
            },
            translation: {
              en: 'I ask You (Allah) for forgiveness.',
              ar: 'أطلب منك (الله) المغفرة',
              ur: 'میں آپ (اللہ) سے معافی مانگتا ہوں',
              tr: 'Senden (Allah) bağışlanma dilerim.'
            }
          }
        ]
      },
      {
        key: 'ablution',
        labelKey: 'ablution',
        icon: 'water',
        items: [
          {
            id: 'wudu-1',
            titleKey: 'beforeStartingWudu',
            arabic: 'بِسْمِ اللَّهِ',
            transliteration: {
              en: 'Bismillah',
              ar: 'بِسْمِ اللَّهِ',
              ur: 'بِسْمِ اللَّهِ',
              tr: 'Bismillâh'
            },
            translation: {
              en: 'In the name of Allah.',
              ar: 'باسم الله',
              ur: 'اللہ کے نام سے',
              tr: 'Allahın adıyla.'
            }
          },
          {
            id: 'wudu-2',
            titleKey: 'afterCompletingWudu',
            arabic: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
            transliteration: {
              en: 'Ashhadu an la ilaha illallahu wahdahu la sharika lahu wa ashhadu anna Muhammadan abduhu wa rasuluh',
              ar: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
              ur: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
              tr: 'Eşhedü en lâ ilâhe illallâhü vahdehû lâ şerîke leh ve eşhedü enne Muhammeden abduhû ve resûlüh'
            },
            translation: {
              en: 'I bear witness that there is no deity but Allah alone; He has no partner. And I bear witness that Muhammad is His servant and Messenger.',
              ar: 'أشهد أن لا إله إلا الله وحده لا شريك له وأشهد أن محمدا عبده ورسوله',
              ur: 'میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے، اس کا کوئی شریک نہیں، اور میں گواہی دیتا ہوں کہ محمد اس کے بندے اور رسول ہیں',
              tr: 'Şahitlik ederim ki Allah\'tan başka ilah yoktur, O tektir, O\'nun ortağı yoktur. Ve şahitlik ederim ki Muhammed O\'nun kulu ve elçisidir.'
            }
          }
        ]
      },
      {
        key: 'mosque',
        labelKey: 'mosque',
        icon: 'mosque',
        items: [
          {
            id: 'mosque-1',
            titleKey: 'uponEnteringTheMosque',
            arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
            transliteration: {
              en: 'Allahumma iftah li abwaba rahmatik',
              ar: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
              ur: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
              tr: 'Allahümmeftah lî ebvâbe rahmetik'
            },
            translation: {
              en: 'O Allah, open the gates of Your mercy for me.',
              ar: 'اللهم افتح لي أبواب رحمتك',
              ur: 'اے اللہ، میرے لیے اپنی رحمت کے دروازے کھول',
              tr: 'Allahım, benim için rahmetinin kapılarını aç.'
            }
          },
          {
            id: 'mosque-2',
            titleKey: 'uponLeavingTheMosque',
            arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
            transliteration: {
              en: 'Allahumma inni as\'aluka min fadlik',
              ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
              ur: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
              tr: 'Allahümme innî es\'elüke min fadlik'
            },
            translation: {
              en: 'O Allah, I ask You from Your bounty.',
              ar: 'اللهم إني أسألك من فضلك',
              ur: 'اے اللہ، میں آپ سے آپ کے فضل میں سے مانگتا ہوں',
              tr: 'Allahım, senden fazlından dilerim.'
            }
          }
        ]
      },
      {
        key: 'prayer',
        labelKey: 'prayer',
        icon: 'pray',
        items: [
          {
            id: 'prayer-1',
            titleKey: 'afterTheOpeningTakbir',
            arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ',
            transliteration: {
              en: 'Subhanaka Allahumma wa bihamdika wa tabaarakasmuka wa ta\'ala jadduka wa la ilaha ghayruk',
              ar: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ',
              ur: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ',
              tr: 'Sübhânekellâhümme ve bihamdik ve tebârakesmük ve teâlâ ceddük ve lâ ilâhe ğayruk'
            },
            translation: {
              en: 'Glory is to You, O Allah, and praise; blessed is Your Name and exalted is Your Majesty; there is no god but You.',
              ar: 'سبحانك اللهم وبحمدك وتبارك اسمك وتعالى جدك ولا إله غيرك',
              ur: 'اے اللہ، آپ پاک ہیں اور آپ کی تعریف کے ساتھ، آپ کا نام مبارک ہے اور آپ کی عظمت بلند ہے، آپ کے سوا کوئی معبود نہیں',
              tr: 'Allahım, sen pak ve yücesin, hamd sana mahsustur. İsmin mübarektir ve şanın yücedir. Senden başka ilah yoktur.'
            }
          },
          {
            id: 'prayer-2',
            titleKey: 'betweenTheTwoProstrations',
            arabic: 'رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي',
            transliteration: {
              en: 'Rabbi ighfir li, Rabbi ighfir li',
              ar: 'رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي',
              ur: 'رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي',
              tr: 'Rabbîğfir lî, Rabbîğfir lî'
            },
            translation: {
              en: 'My Lord, forgive me. My Lord, forgive me.',
              ar: 'ربي اغفر لي، ربي اغفر لي',
              ur: 'اے میرے رب، مجھے معاف فرما، اے میرے رب، مجھے معاف فرما',
              tr: 'Rabbim, beni bağışla. Rabbim, beni bağışla.'
            }
          }
        ]
      },
      {
        key: 'home',
        labelKey: 'home',
        icon: 'home',
        items: [
          {
            id: 'home-1',
            titleKey: 'uponEnteringTheHome',
            arabic: 'بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا',
            transliteration: {
              en: 'Bismillahi walajna wa bismillahi kharajna wa \'ala Allahi rabbina tawakkalna',
              ar: 'بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا',
              ur: 'بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا',
              tr: 'Bismillâhi ve lecnâ ve bismillâhi harecnâ ve alâllâhi rabbinâ tevekkelnâ'
            },
            translation: {
              en: 'In the name of Allah we enter and in the name of Allah we leave, and upon our Lord we place our trust.',
              ar: 'باسم الله دخلنا وباسم الله خرجنا وعلى الله ربنا توكلنا',
              ur: 'اللہ کے نام سے ہم داخل ہوئے اور اللہ کے نام سے ہم نکلے اور اپنے رب اللہ پر ہم نے بھروسہ کیا',
              tr: 'Allahın adıyla girdik ve Allahın adıyla çıktık ve Rabbimiz Allaha tevekkül ettik.'
            }
          },
          {
            id: 'home-2',
            titleKey: 'uponLeavingTheHome',
            arabic: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
            transliteration: {
              en: 'Bismillahi tawakkaltu \'ala Allah wa la hawla wa la quwwata illa billah',
              ar: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
              ur: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
              tr: 'Bismillâhi tevekkeltü alâllâhi ve lâ havle ve lâ kuvvete illâ billâh'
            },
            translation: {
              en: 'In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah.',
              ar: 'باسم الله توكلت على الله ولا حول ولا قوة إلا بالله',
              ur: 'اللہ کے نام سے، میں نے اللہ پر بھروسہ کیا، اور کوئی طاقت اور قوت نہیں مگر اللہ کی',
              tr: 'Allahın adıyla, Allaha tevekkül ettim ve güç ve kuvvet yalnız Allah\'tandır.'
            }
          }
        ]
      },
      {
        key: 'Garment',
        labelKey: 'Garment',
        icon: 'Garment',
        items: [
          {
            id: 'Garment-1',
            titleKey: 'whenPuttingOnNewClothes',
            arabic: 'اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا صُنِعَ لَهُ وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ',
            transliteration: {
              en: 'Allahumma laka al-hamdu anta kasawtaneehi as\'aluka min khayrihi wa khayri ma suni\'a lahu wa a\'udhu bika min sharrihi wa sharri ma suni\'a lahu',
              ar: 'اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا صُنِعَ لَهُ وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ',
              ur: 'اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا صُنِعَ لَهُ وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ',
              tr: 'Allahümme lekel-hamdü ente keseytenîhi es\'elüke min hayrihî ve hayri mâ suni\'a lehû ve e\'ûzü bike min şerrihî ve şerri mâ suni\'a lehû'
            },
            translation: {
              en: 'O Allah, all praise is to You. You have clothed me with it. I ask You for its goodness and the goodness of what it was made for, and I seek refuge with You from its evil and the evil of what it was made for.',
              ar: 'اللهم لك الحمد أنت كسوتنيه أسألك من خيره وخير ما صنع له وأعوذ بك من شره وشر ما صنع له',
              ur: 'اے اللہ، تمام تعریفیں آپ کے لیے ہیں، آپ نے مجھے یہ پہنایا، میں آپ سے اس کی بھلائی اور اس کے لیے بنائی گئی چیز کی بھلائی مانگتا ہوں، اور میں آپ کی پناہ میں آتا ہوں اس کی برائی اور اس کے لیے بنائی گئی چیز کی برائی سے',
              tr: 'Allahım, hamd sanadır. Sen onu bana giydirdin. Senden onun hayrını ve onun için yapılan şeyin hayrını dilerim. Senden onun şerrinden ve onun için yapılan şeyin şerrinden sığınırım.'
            }
          }
        ]
      },
      {
        key: 'Travel',
        labelKey: 'Travel',
        icon: 'Travel',
        items: [
          {
            id: 'Travel-1',
            titleKey: 'whenStartingAJourney',
            arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
            transliteration: {
              en: 'Subhana alladhi sakhkhara lana hadha wama kunna lahu muqrineen wa inna ila rabbina lamunqaliboon',
              ar: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
              ur: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
              tr: 'Sübhânellezî sahhara lenâ hâzâ ve mâ künnâ lehû mukrinîn ve innâ ila rabbinâ le munkalibûn'
            },
            translation: {
              en: 'Glory to Him who has subjected this to us, and we could never have it (by our efforts). And to our Lord, surely, must we return.',
              ar: 'سبحان الذي سخر لنا هذا وما كنا له مقرنين وإنا إلى ربنا لمنقلبون',
              ur: 'پاک ہے وہ جس نے ہمارے لیے اسے مسخر کیا، اور ہم اسے کبھی نہیں پا سکتے تھے (اپنی کوششوں سے)، اور ہمیں اپنے رب کی طرف ضرور لوٹنا ہے',
              tr: 'Bunu bizim emrimize veren Allah\'ı tesbih ederim. Biz bunu kendi gücümüzle elde edemezdik. Şüphesiz Rabbimize döneceğiz.'
            }
          }
        ]
      },
      {
        key: 'Food',
        labelKey: 'Food',
        icon: 'Food',
        items: [
          {
            id: 'Food-1',
            titleKey: 'beforeEating',
            arabic: 'بِسْمِ اللَّهِ',
            transliteration: {
              en: 'Bismillah',
              ar: 'بِسْمِ اللَّهِ',
              ur: 'بِسْمِ اللَّهِ',
              tr: 'Bismillâh'
            },
            translation: {
              en: 'In the name of Allah.',
              ar: 'باسم الله',
              ur: 'اللہ کے نام سے',
              tr: 'Allahın adıyla.'
            }
          },
          {
            id: 'Food-2',
            titleKey: 'afterEating',
            arabic: 'الْـحَمْـدُ للهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مِنَ الْمُسْلِمِينَ',
            transliteration: {
              en: 'Alhamdu lillaahil-lathee at\'amanaa wa saqaanaa wa ja\'alanaa minal-muslimeen',
              ar: 'الْـحَمْـدُ للهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مِنَ الْمُسْلِمِينَ',
              ur: 'الْـحَمْـدُ للهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مِنَ الْمُسْلِمِينَ',
              tr: 'Elhamdü lillâhillezî et\'amenâ ve sekânâ ve ce\'alenâ minel-müslimîn'
            },
            translation: {
              en: 'All praise is for Allah who fed us and gave us drink and made us Muslims.',
              ar: 'الحمد لله الذي أطعمنا وسقانا وجعلنا من المسلمين',
              ur: 'تمام تعریفیں اللہ کے لیے ہیں جس نے ہمیں کھلایا اور پلایا اور ہمیں مسلمان بنایا',
              tr: 'Bizi yediren, içiren ve Müslümanlardan kılan Allaha hamd olsun.'
            }
          }
        ]
      }
    ]
  },
  {
    key: 'azkar',
    labelKey: 'azkar',
    categories: [
      {
        key: 'daily-dhikr',
        labelKey: 'dailyDhikr',
        icon: 'dhikr',
        items: [
          {
            id: 'dhikr-1',
            titleKey: 'morningRemembrance',
            arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
            transliteration: {
              en: 'Allahumma bika asbahna wa bika amsayna wa bika nahya wa bika namootu wa ilaykan-nushoor',
              ar: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
              ur: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
              tr: 'Allahümme bike asbahnâ ve bike emseynâ ve bike nahyâ ve bike nemûtü ve ileyken-nüşûr'
            },
            translation: {
              en: 'O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the resurrection.',
              ar: 'اللهم بك أصبحنا وبك أمسينا وبك نحيا وبك نموت وإليك النشور',
              ur: 'اے اللہ، آپ کے ذریعے ہم صبح میں داخل ہوئے اور آپ کے ذریعے ہم شام میں داخل ہوئے، آپ کے ذریعے ہم زندہ ہیں اور آپ کے ذریعے ہم مرتے ہیں، اور آپ کی طرف دوبارہ اٹھنا ہے',
              tr: 'Allahım, seninle sabaha erdik, seninle akşama erdik, seninle yaşarız, seninle ölürüz ve sana döndürüleceğiz.'
            }
          },
          {
            id: 'dhikr-2',
            titleKey: 'eveningRemembrance',
            arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
            transliteration: {
              en: 'Allahumma bika amsayna wa bika asbahna wa bika nahya wa bika namootu wa ilaykal-maseer',
              ar: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
              ur: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
              tr: 'Allahümme bike emseynâ ve bike asbahnâ ve bike nahyâ ve bike nemûtü ve ileykel-masîr'
            },
            translation: {
              en: 'O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is the final return.',
              ar: 'اللهم بك أمسينا وبك أصبحنا وبك نحيا وبك نموت وإليك المصير',
              ur: 'اے اللہ، آپ کے ذریعے ہم شام میں داخل ہوئے اور آپ کے ذریعے ہم صبح میں داخل ہوئے، آپ کے ذریعے ہم زندہ ہیں اور آپ کے ذریعے ہم مرتے ہیں، اور آپ کی طرف آخری واپسی ہے',
              tr: 'Allahım, seninle akşama erdik, seninle sabaha erdik, seninle yaşarız, seninle ölürüz ve sana döndürüleceğiz.'
            }
          },
          {
            id: 'dhikr-3',
            titleKey: 'sayyidulIstighfar',
            arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
            transliteration: {
              en: 'Allahumma anta rabbee la ilaha illa anta khalaqtanee wa ana abduka wa ana \'ala \'ahdika wa wa\'dika ma istata\'tu a\'udhu bika min sharri ma sana\'tu aboo\'u laka bini\'matika \'alayya wa aboo\'u bidhanbee faghfir lee fa innahu la yaghfiru adhdhunooba illa anta',
              ar: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
              ur: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
              tr: 'Allahümme ente rabbî lâ ilâhe illâ ente halaktanî ve ene abduke ve ene alâ ahdike ve va\'dike mâsteta\'tü e\'ûzü bike min şerri mâ sana\'tü ebûü leke bi ni\'metike aleyye ve ebûü bi zenbî fağfir lî fe innehu lâ yağfiruz-zünûbe illâ ente'
            },
            translation: {
              en: 'O Allah, You are my Lord, there is no deity but You. You created me and I am Your servant, and I am upon Your covenant and promise as much as I am able. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me and I acknowledge my sin, so forgive me, for verily none can forgive sin except You.',
              ar: 'اللهم أنت ربي لا إله إلا أنت خلقتني وأنا عبدك وأنا على عهدك ووعدك ما استطعت أعوذ بك من شر ما صنعت أبوء لك بنعمتك علي وأبوء بذنبي فاغفر لي فإنه لا يغفر الذنوب إلا أنت',
              ur: 'اے اللہ، آپ میرے رب ہیں، آپ کے سوا کوئی معبود نہیں، آپ نے مجھے پیدا کیا اور میں آپ کا بندہ ہوں، اور میں آپ کے عہد اور وعدے پر ہوں جتنا میں کر سکتا ہوں، میں آپ کی پناہ میں آتا ہوں اس برائی سے جو میں نے کی، میں آپ کے فضل کو تسلیم کرتا ہوں جو آپ نے مجھ پر کیا اور میں اپنے گناہ کو تسلیم کرتا ہوں، پس مجھے معاف فرما، بےشک گناہوں کو معاف کرنے والا آپ کے سوا کوئی نہیں',
              tr: 'Allahım, sen benim Rabbimsin. Senden başka ilah yoktur. Beni sen yarattın. Ben senin kulunum. Gücüm yettiğince sana olan ahdime ve vaadime bağlıyım. Yaptığım kötülüklerin şerrinden sana sığınırım. Bana verdiğin nimetini itiraf ederim. Günahımı da itiraf ederim. Beni bağışla. Çünkü günahları senden başka bağışlayan yoktur.'
            }
          }
        ]
      }
    ]
  }
];
