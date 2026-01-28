import { Ionicons } from '@expo/vector-icons';

export interface HabitCategory {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: keyof typeof Ionicons.glyphMap;
  reflectionPrompts: string[];
}

export const HABIT_CATEGORIES: HabitCategory[] = [
  { id: 'health', name: 'Kesehatan', icon: 'heart', color: '#FC8181' },
  { id: 'mindfulness', name: 'Mindfulness', icon: 'leaf', color: '#48BB78' },
  { id: 'ethics', name: 'Etika', icon: 'star', color: '#F6AD55' },
  { id: 'productivity', name: 'Produktivitas', icon: 'rocket', color: '#63B3ED' },
  { id: 'social', name: 'Sosial', icon: 'people', color: '#B794F4' },
];

export const HABIT_TEMPLATES: HabitTemplate[] = [
  // Health Habits
  {
    id: 'sleep',
    name: 'Tidur Cukup',
    description: 'Tidur 7-8 jam setiap malam untuk kesehatan optimal',
    category: 'health',
    icon: 'moon',
    reflectionPrompts: [
      'Bagaimana kualitas tidurmu semalam?',
      'Apa yang mempengaruhi kualitas tidurmu?',
      'Bagaimana perasaanmu saat bangun pagi ini?',
    ],
  },
  {
    id: 'exercise',
    name: 'Olahraga',
    description: 'Bergerak minimal 30 menit sehari',
    category: 'health',
    icon: 'fitness',
    reflectionPrompts: [
      'Aktivitas fisik apa yang kamu lakukan hari ini?',
      'Bagaimana perasaan tubuhmu setelah berolahraga?',
      'Apa yang memotivasimu untuk bergerak hari ini?',
    ],
  },
  {
    id: 'hydration',
    name: 'Minum Air',
    description: 'Minum 8 gelas air per hari',
    category: 'health',
    icon: 'water',
    reflectionPrompts: [
      'Sudahkah kamu minum cukup air hari ini?',
      'Bagaimana hidrasi mempengaruhi energimu?',
    ],
  },
  
  // Mindfulness Habits
  {
    id: 'meditation',
    name: 'Meditasi',
    description: 'Luangkan waktu untuk menenangkan pikiran',
    category: 'mindfulness',
    icon: 'flower',
    reflectionPrompts: [
      'Bagaimana perasaanmu sebelum dan sesudah meditasi?',
      'Apa yang kamu pelajari dari keheningan hari ini?',
      'Pikiran apa yang muncul saat bermeditasi?',
    ],
  },
  {
    id: 'gratitude',
    name: 'Bersyukur',
    description: 'Tuliskan 3 hal yang kamu syukuri setiap hari',
    category: 'mindfulness',
    icon: 'sunny',
    reflectionPrompts: [
      'Apa 3 hal yang membuatmu bersyukur hari ini?',
      'Siapa yang membuatmu merasa beruntung?',
      'Momen kecil apa yang membuatmu tersenyum?',
    ],
  },
  {
    id: 'journaling',
    name: 'Menulis Jurnal',
    description: 'Ekspresikan pikiran dan perasaanmu',
    category: 'mindfulness',
    icon: 'book',
    reflectionPrompts: [
      'Apa yang ada di pikiranmu hari ini?',
      'Emosi apa yang dominan hari ini?',
      'Apa yang ingin kamu lepaskan dari pikiranmu?',
    ],
  },
  
  // Ethics Habits
  {
    id: 'honesty',
    name: 'Kejujuran',
    description: 'Berkomitmen untuk selalu jujur',
    category: 'ethics',
    icon: 'shield-checkmark',
    reflectionPrompts: [
      'Apakah ada situasi hari ini di mana kejujuran terasa sulit?',
      'Bagaimana kejujuran mempengaruhi hubunganmu?',
      'Apa yang kamu pelajari tentang dirimu melalui kejujuran?',
    ],
  },
  {
    id: 'kindness',
    name: 'Kebaikan',
    description: 'Lakukan satu kebaikan setiap hari',
    category: 'ethics',
    icon: 'hand-left',
    reflectionPrompts: [
      'Kebaikan apa yang kamu lakukan hari ini?',
      'Bagaimana perasaanmu setelah berbuat baik?',
      'Siapa yang membutuhkan kebaikanmu besok?',
    ],
  },
  {
    id: 'empathy',
    name: 'Empati',
    description: 'Dengarkan dan pahami perspektif orang lain',
    category: 'ethics',
    icon: 'heart-half',
    reflectionPrompts: [
      'Apakah kamu mendengarkan seseorang dengan penuh perhatian hari ini?',
      'Bagaimana kamu mencoba memahami sudut pandang orang lain?',
      'Apa yang kamu pelajari dari pengalaman orang lain?',
    ],
  },
  
  // Productivity Habits
  {
    id: 'discipline',
    name: 'Disiplin',
    description: 'Patuhi jadwal dan komitmenmu',
    category: 'productivity',
    icon: 'time',
    reflectionPrompts: [
      'Apakah kamu berhasil mengikuti jadwalmu hari ini?',
      'Apa yang menghalangimu untuk disiplin?',
      'Bagaimana disiplin membantumu mencapai tujuan?',
    ],
  },
  {
    id: 'learning',
    name: 'Belajar',
    description: 'Pelajari sesuatu yang baru setiap hari',
    category: 'productivity',
    icon: 'school',
    reflectionPrompts: [
      'Apa yang baru kamu pelajari hari ini?',
      'Bagaimana pengetahuan baru ini bisa berguna?',
      'Apa yang ingin kamu pelajari selanjutnya?',
    ],
  },
  {
    id: 'focus',
    name: 'Fokus',
    description: 'Hindari distraksi dan fokus pada prioritas',
    category: 'productivity',
    icon: 'eye',
    reflectionPrompts: [
      'Berapa lama kamu bisa fokus tanpa distraksi hari ini?',
      'Apa yang paling sering mengganggumu?',
      'Bagaimana kamu bisa meningkatkan fokusmu?',
    ],
  },
  
  // Social Habits
  {
    id: 'connection',
    name: 'Koneksi',
    description: 'Hubungi teman atau keluarga',
    category: 'social',
    icon: 'chatbubble-ellipses',
    reflectionPrompts: [
      'Siapa yang kamu hubungi hari ini?',
      'Bagaimana percakapan itu membuatmu merasa?',
      'Hubungan mana yang ingin kamu perkuat?',
    ],
  },
  {
    id: 'listening',
    name: 'Mendengarkan',
    description: 'Dengarkan lebih banyak, bicara lebih sedikit',
    category: 'social',
    icon: 'ear',
    reflectionPrompts: [
      'Apakah kamu benar-benar mendengarkan seseorang hari ini?',
      'Apa yang kamu pelajari dari mendengarkan?',
      'Bagaimana mendengarkan mempengaruhi hubunganmu?',
    ],
  },
];

export const getHabitById = (id: string): HabitTemplate | undefined => {
  return HABIT_TEMPLATES.find((habit) => habit.id === id);
};

export const getHabitsByCategory = (categoryId: string): HabitTemplate[] => {
  return HABIT_TEMPLATES.filter((habit) => habit.category === categoryId);
};

export const getCategoryById = (id: string): HabitCategory | undefined => {
  return HABIT_CATEGORIES.find((category) => category.id === id);
};
