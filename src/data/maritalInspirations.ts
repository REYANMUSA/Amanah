export interface MaritalInspiration {
  id: string;
  type: 'quran' | 'hadith';
  theme: string;
  arabic: string;
  english: string;
  source: string;
  reflection: string;
}

export const MARITAL_INSPIRATIONS: MaritalInspiration[] = [
  {
    id: 'rum-21',
    type: 'quran',
    theme: 'Tranquility & Mutual Mercy',
    arabic: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
    english: 'And of His signs is that He created for you from yourselves spouses that you may find tranquility in them; and He placed between you affection and mercy.',
    source: 'Surah Ar-Rum (30:21)',
    reflection: 'Marriage in Islam is not built on competition or demands, but on being a safe sanctuary of calm (sakeenah) and mutual gentleness for one another.'
  },
  {
    id: 'tirmidhi-3895',
    type: 'hadith',
    theme: 'The Measure of Noble Character',
    arabic: 'خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ، وَأَنَا خَيْرُكُمْ لِأَهْلِي',
    english: 'The best of you are the best to their wives, and I am the best among you to my family.',
    source: 'Jami` at-Tirmidhi 3895 (Sahih)',
    reflection: 'A person’s true spiritual maturity is proven not before strangers in public, but behind closed doors in patience, humor, and tender care toward their spouse.'
  },
  {
    id: 'furqan-74',
    type: 'quran',
    theme: 'Comfort of the Eyes',
    arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    english: 'Our Lord, grant us from among our spouses and offspring comfort to our eyes and make us an example for the righteous.',
    source: 'Surah Al-Furqan (25:74)',
    reflection: 'To be the "coolness of the eyes" means your presence brings peaceful reassurance and gladness to your partner after the exhaustion of the world.'
  },
  {
    id: 'muslim-1469',
    type: 'hadith',
    theme: 'Grace & Looking for the Good',
    arabic: 'لَا يَفْرَكْ مُؤْمِنٌ مُؤْمِنَةً، إِنْ كَرِهَ مِنْهَا خُلُقًا رَضِيَ مِنْهَا آخَرَ',
    english: 'A believing husband must not hold resentment against a believing wife; if he dislikes one trait in her, he is pleased with another.',
    source: 'Sahih Muslim 1469',
    reflection: 'No spouse is flawless. Marital peace flourishes when we intentionally focus on each other’s virtues and overlook temporary human shortcomings.'
  },
  {
    id: 'baqarah-187',
    type: 'quran',
    theme: 'Mutual Garment & Protection',
    arabic: 'هُنَّ لِبَاسٌ لَّكُمْ وَأَنتُمْ لِبَاسٌ لَّهُنَّ',
    english: 'They are a garment for you, and you are a garment for them.',
    source: 'Surah Al-Baqarah (2:187)',
    reflection: 'Just like garments protect, warm, beautify, and conceal flaws, spouses shelter each other’s vulnerabilities and guard each other’s honor with love.'
  },
  {
    id: 'muslim-1467',
    type: 'hadith',
    theme: 'The Greatest Provision',
    arabic: 'الدُّنْيَا مَتَاعٌ، وَخَيْرُ مَتَاعِ الدُّنْيَا الْمَرْأَةُ الصَّالِحَةُ',
    english: 'The whole world is provision, and the best provision of this world is a righteous spouse.',
    source: 'Sahih Muslim 1467',
    reflection: 'A righteous companion who reminds you of Allah, stands by you in trial, and shares your prayers is the most valuable blessing on earth.'
  },
  {
    id: 'nisa-19',
    type: 'quran',
    theme: 'Honorable Companionship',
    arabic: 'وَعَاشِرُوهُنَّ بِالْمَعْرُوفِ',
    english: 'And live with them in honor, kindness, and equity.',
    source: 'Surah An-Nisa (4:19)',
    reflection: 'Kindness (Ma’roof) in marriage is an active daily practice—listening attentively, speaking softly, and sharing daily burdens with gratitude.'
  }
];

export function getDailyMaritalInspiration(dayOfYear: number): MaritalInspiration {
  const index = Math.abs(dayOfYear) % MARITAL_INSPIRATIONS.length;
  return MARITAL_INSPIRATIONS[index];
}
