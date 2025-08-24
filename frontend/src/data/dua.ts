
export type DuaItem = {
  id: string;
  title: string;
  arabic?: string;
  transliteration?: string;
  translation?: string;
  note?: string;
};

export type DuaCategory = {
  key: string;
  label: string;
  icon: string; // icon name or URI
  items: DuaItem[];
};

export type DuaSection = {
  key: string;
  label: string;
  categories: DuaCategory[];
};

export const DUA_SECTIONS: DuaSection[] = [
  {
    key: 'daily',
    label: 'Daily',
    categories: [
      {
        key: 'sleeping',
        label: 'Sleeping',
        icon: 'bed',
        items: [
          {
            id: 'sleep-1',
            title: 'When you wake up',
            arabic: 'الْـحَمْـدُ للهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
            transliteration: 'Alhamdu lillaahil-lathee ahyaanaa ba’da maa amaatanaa wa ilayhin-nushoor',
            translation: 'All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.'
          },
          {
            id: 'sleep-2',
            title: 'Recite this after every Salah',
            arabic: 'اللَّهُمَّ أَجِرْنِي مِنْ النَّارِ',
            transliteration: 'Allahumma ajirni min an-naar',
            translation: 'O Allah, save me from the Fire.'
          }
        ]
      },
      {
        key: 'toilet',
        label: 'Toilet',
        icon: 'toilet',
        items: [
          {
            id: 'toilet-1',
            title: 'Before entering the toilet',
            arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
            transliteration: 'Allahumma inni a’udhu bika minal-khubthi wal-khaba’ith',
            translation: 'O Allah, I seek refuge with You from all evil and evil-doers.'
          },
          {
            id: 'toilet-2',
            title: 'After leaving the toilet',
            arabic: 'غُفْرَانَكَ',
            transliteration: 'Ghufranak',
            translation: 'I ask You (Allah) for forgiveness.'
          }
        ]
      },
      {
        key: 'ablution',
        label: 'Ablution',
        icon: 'water',
        items: [
          {
            id: 'wudu-1',
            title: 'Before starting wudu',
            arabic: 'بِسْمِ اللَّهِ',
            transliteration: 'Bismillah',
            translation: 'In the name of Allah.'
          },
          {
            id: 'wudu-2',
            title: 'After completing wudu',
            arabic: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
            transliteration: 'Ashhadu an la ilaha illallahu wahdahu la sharika lahu wa ashhadu anna Muhammadan abduhu wa rasuluh',
            translation: 'I bear witness that there is no deity but Allah alone; He has no partner. And I bear witness that Muhammad is His servant and Messenger.'
          }
        ]
      },
      {
        key: 'mosque',
        label: 'Mosque',
        icon: 'mosque',
        items: [
          {
            id: 'mosque-1',
            title: 'Upon entering the mosque',
            arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
            transliteration: 'Allahumma iftah li abwaba rahmatik',
            translation: 'O Allah, open the gates of Your mercy for me.'
          },
          {
            id: 'mosque-2',
            title: 'Upon leaving the mosque',
            arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
            transliteration: 'Allahumma inni as’aluka min fadlik',
            translation: 'O Allah, I ask You from Your bounty.'
          }
        ]
      },
      {
        key: 'prayer',
        label: 'Prayer',
        icon: 'pray',
        items: [
          {
            id: 'prayer-1',
            title: 'After the opening takbir',
            arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ',
            transliteration: 'Subhanaka Allahumma wa bihamdika wa tabaarakasmuka wa ta’ala jadduka wa la ilaha ghayruk',
            translation: 'Glory is to You, O Allah, and praise; blessed is Your Name and exalted is Your Majesty; there is no god but You.'
          },
          {
            id: 'prayer-2',
            title: 'Between the two prostrations',
            arabic: 'رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي',
            transliteration: 'Rabbi ighfir li, Rabbi ighfir li',
            translation: 'My Lord, forgive me. My Lord, forgive me.'
          }
        ]
      },
      {
        key: 'home',
        label: 'Home',
        icon: 'home',
        items: [
          {
            id: 'home-1',
            title: 'Upon entering the home',
            arabic: 'بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا',
            transliteration: 'Bismillahi walajna wa bismillahi kharajna wa ‘ala Allahi rabbina tawakkalna',
            translation: 'In the name of Allah we enter and in the name of Allah we leave, and upon our Lord we place our trust.'
          },
          {
            id: 'home-2',
            title: 'Upon leaving the home',
            arabic: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
            transliteration: 'Bismillahi tawakkaltu ‘ala Allah wa la hawla wa la quwwata illa billah',
            translation: 'In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah.'
          }
        ]
      },
      {
        key: 'garment',
        label: 'Garment',
        icon: 'tshirt',
        items: [
          {
            id: 'garment-1',
            title: 'When putting on new clothes',
            arabic: 'اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا صُنِعَ لَهُ وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ',
            transliteration: 'Allahumma laka al-hamdu anta kasawtaneehi as’aluka min khayrihi wa khayri ma suni’a lahu wa a’udhu bika min sharrihi wa sharri ma suni’a lahu',
            translation: 'O Allah, all praise is to You. You have clothed me with it. I ask You for its goodness and the goodness of what it was made for, and I seek refuge with You from its evil and the evil of what it was made for.'
          }
        ]
      },
      {
        key: 'travel',
        label: 'Travel',
        icon: 'airplane',
        items: [
          {
            id: 'travel-1',
            title: 'When starting a journey',
            arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
            transliteration: 'Subhana alladhi sakhkhara lana hadha wama kunna lahu muqrineen wa inna ila rabbina lamunqaliboon',
            translation: 'Glory to Him who has subjected this to us, and we could never have it (by our efforts). And to our Lord, surely, must we return.'
          }
        ]
      },
      {
        key: 'food',
        label: 'Food',
        icon: 'utensils',
        items: [
          {
            id: 'food-1',
            title: 'Before eating',
            arabic: 'بِسْمِ اللَّهِ',
            transliteration: 'Bismillah',
            translation: 'In the name of Allah.'
          },
          {
            id: 'food-2',
            title: 'After eating',
            arabic: 'الْـحَمْـدُ للهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مِنَ الْمُسْلِمِينَ',
            transliteration: 'Alhamdu lillaahil-lathee at’amanaa wa saqaanaa wa ja’alanaa minal-muslimeen',
            translation: 'All praise is for Allah who fed us and gave us drink and made us Muslims.'
          }
        ]
      }
    ]
  },
  {
    key: 'azkar',
    label: 'Azkar',
    categories: [
      {
        key: 'daily-dhikr',
        label: 'Daily Dhikr',
        icon: 'beads',
        items: [
          {
            id: 'dhikr-1',
            title: 'Morning remembrance',
            arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
            transliteration: 'Allahumma bika asbahna wa bika amsayna wa bika nahya wa bika namootu wa ilaykan-nushoor',
            translation: 'O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the resurrection.'
          },
          {
            id: 'dhikr-2',
            title: 'Evening remembrance',
            arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
            transliteration: 'Allahumma bika amsayna wa bika asbahna wa bika nahya wa bika namootu wa ilaykal-maseer',
            translation: 'O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is the final return.'
          },
          {
            id: 'dhikr-3',
            title: 'Sayyidul Istighfar',
            arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
            transliteration: 'Allahumma anta rabbee la ilaha illa anta khalaqtanee wa ana abduka wa ana ‘ala ‘ahdika wa wa’dika ma istata’tu a’udhu bika min sharri ma sana’tu aboo’u laka bini’matika ‘alayya wa aboo’u bidhanbee faghfir lee fa innahu la yaghfiru adhdhunooba illa anta',
            translation: 'O Allah, You are my Lord, there is no deity but You. You created me and I am Your servant, and I am upon Your covenant and promise as much as I am able. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me and I acknowledge my sin, so forgive me, for verily none can forgive sin except You.'
          }
        ]
      }
    ]
  }
];
