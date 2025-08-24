
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
        items: []
      },
      {
        key: 'ablution',
        label: 'Ablution',
        icon: 'water',
        items: []
      },
      {
        key: 'mosque',
        label: 'Mosque',
        icon: 'mosque',
        items: []
      },
      {
        key: 'prayer',
        label: 'Prayer',
        icon: 'pray',
        items: []
      },
      {
        key: 'home',
        label: 'Home',
        icon: 'home',
        items: []
      },
      {
        key: 'garment',
        label: 'Garment',
        icon: 'tshirt',
        items: []
      },
      {
        key: 'travel',
        label: 'Travel',
        icon: 'airplane',
        items: []
      },
      {
        key: 'food',
        label: 'Food',
        icon: 'utensils',
        items: []
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
        items: []
      }
    ]
  }
];
