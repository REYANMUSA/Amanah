export interface DhikrItem {
  id: string;
  title: string;
  period: 'morning' | 'evening' | 'both' | 'general';
  arabic: string;
  transliteration: string;
  translation: string;
  targetCount: number;
  source: string;
  benefit?: string;
}

export const DAILY_ADHKAR: DhikrItem[] = [
  // 1. Sayyid al-Istighfar
  {
    id: 'sayyidul-istighfar',
    title: 'Sayyid al-Istighfar (Chief of Repentance)',
    period: 'both',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration: "Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bini'matika 'alayya, wa abu'u laka bidhanbi faghfir li, fa-innahu la yaghfiru adh-dhunuba illa Ant",
    translation: 'O Allah, You are my Lord, none has the right to be worshipped but You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me, and I acknowledge my sin, so forgive me, for none forgives sins except You.',
    targetCount: 1,
    source: 'Sahih al-Bukhari 6306',
    benefit: 'Whoever recites it with firm faith during the day or night and dies, will be among the people of Jannah.'
  },
  // 2. Ayat al-Kursi
  {
    id: 'ayat-al-kursi',
    title: 'Ayat al-Kursi (The Verse of the Throne)',
    period: 'both',
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration: "Allahu la ilaha illa Huwa, al-Hayyul-Qayyum. La ta'khudhuhu sinatun wa la nawm. Lahu ma fis-samawati wa ma fil-ard. Man dhal-ladhi yashfa'u 'indahu illa bi-idhnih. Ya'lamu ma bayna aydihim wa ma khalfahum, wa la yuhituna bishay'im-min 'ilmihi illa bima sha'a. Wasi'a kursiyyuhus-samawati wal-ard, wa la ya'uduhu hifdhuhuma, wa Huwal-'Aliyyul-'Adheem",
    translation: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.',
    targetCount: 1,
    source: 'Surah al-Baqarah 2:255; Sahih al-Bukhari',
    benefit: 'Protection from harm throughout the day until evening, and through the night until dawn.'
  },
  // 3. Protection Prayer (Bismillahilladhi)
  {
    id: 'bismillahilladhi',
    title: 'Protection from All Harm',
    period: 'both',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: "Bismillahilladhi la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa Huwas-Sami'ul-'Aleem",
    translation: 'In the Name of Allah, with Whose Name nothing can cause harm in the earth nor in the heavens, and He is the All-Hearing, the All-Knowing.',
    targetCount: 3,
    source: 'Sunan Abi Dawud 5088, Jami` at-Tirmidhi 3388 (Sahih)',
    benefit: 'Whoever recites it three times in the morning and evening, nothing will harm him.'
  },
  // 4. Pleasure with Allah
  {
    id: 'radheetu-billah',
    title: 'Contentment with Faith & the Prophet (ﷺ)',
    period: 'both',
    arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
    transliteration: "Radheetu billahi Rabba, wa bil-Islami deena, wa bi Muhammadin sallallahu 'alayhi wa sallama Nabiyya",
    translation: 'I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (ﷺ) as my Prophet.',
    targetCount: 3,
    source: 'Sunan Abi Dawud 5072 (Sahih)',
    benefit: 'Allah has promised to please the servant who recites this thrice every morning and evening.'
  },
  // 5. Morning Declaration
  {
    id: 'asbahna-wa-asbaha',
    title: 'Morning Proclamation of Dominion',
    period: 'morning',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: "Asbahna wa asbahal-mulku lillah, wal-hamdulillahi, la ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa Huwa 'ala kulli shay'in Qadeer",
    translation: 'We have entered the morning and the dominion belongs to Allah; all praise is due to Allah. None has the right to be worshipped except Allah alone, without partner. To Him belongs the dominion, to Him belongs praise, and He is over all things competent.',
    targetCount: 1,
    source: 'Sahih Muslim 2723',
    benefit: 'Affirming Allah’s sovereignty at the commencement of the day.'
  },
  // 6. Evening Declaration
  {
    id: 'amsayna-wa-amsa',
    title: 'Evening Proclamation of Dominion',
    period: 'evening',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: "Amsayna wa amsal-mulku lillah, wal-hamdulillahi, la ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa Huwa 'ala kulli shay'in Qadeer",
    translation: 'We have reached the evening and the dominion belongs to Allah; all praise is due to Allah. None has the right to be worshipped except Allah alone, without partner. To Him belongs the dominion, to Him belongs praise, and He is over all things competent.',
    targetCount: 1,
    source: 'Sahih Muslim 2723',
    benefit: 'Affirming Allah’s sovereignty at dusk before resting.'
  },
  // 7. Evening Refuge
  {
    id: 'audhu-bikalimatillah',
    title: 'Seeking Refuge in the Perfect Words of Allah',
    period: 'evening',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration: "A'udhu bikalimatillahit-tammati min sharri ma khalaq",
    translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
    targetCount: 3,
    source: 'Sahih Muslim 2709',
    benefit: 'Protection from harmful creatures, stings, and night distress.'
  },
  // 8. SubhanAllahi wa bihamdih
  {
    id: 'subhanallahi-wa-bihamdih-100',
    title: 'Tasbih & Hamd (100 times)',
    period: 'both',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'SubhanAllahi wa bihamdih',
    translation: 'Glory be to Allah and His is the praise.',
    targetCount: 100,
    source: 'Sahih Muslim 2692',
    benefit: 'No one will come on the Day of Resurrection with anything better than this, except one who said the same or more.'
  },
  // 9. Astaghfirullah
  {
    id: 'astaghfirullah-100',
    title: 'Daily Istighfar (Seeking Forgiveness)',
    period: 'both',
    arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    transliteration: 'Astaghfirullaha wa atoobu ilayh',
    translation: 'I seek Allah’s forgiveness and repent to Him.',
    targetCount: 100,
    source: 'Sahih al-Bukhari 6307, Sahih Muslim 2702',
    benefit: 'The Prophet (ﷺ) would seek forgiveness more than 70 to 100 times daily.'
  }
];
