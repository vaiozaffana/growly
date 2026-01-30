import prisma from './lib/prisma';
import bcrypt from 'bcryptjs';

const HABIT_TEMPLATES = [
  {
    templateId: 'sleep',
    name: 'Tidur Cukup',
    description: 'Tidur 7-8 jam setiap malam untuk kesehatan optimal',
    category: 'health',
    icon: 'moon',
  },
  {
    templateId: 'exercise',
    name: 'Olahraga',
    description: 'Bergerak minimal 30 menit sehari',
    category: 'health',
    icon: 'fitness',
  },
  {
    templateId: 'meditation',
    name: 'Meditasi',
    description: 'Luangkan waktu untuk menenangkan pikiran',
    category: 'mindfulness',
    icon: 'flower',
  },
  {
    templateId: 'gratitude',
    name: 'Bersyukur',
    description: 'Tuliskan 3 hal yang kamu syukuri setiap hari',
    category: 'mindfulness',
    icon: 'sunny',
  },
  {
    templateId: 'honesty',
    name: 'Kejujuran',
    description: 'Berkomitmen untuk selalu jujur',
    category: 'ethics',
    icon: 'shield-checkmark',
  },
  {
    templateId: 'kindness',
    name: 'Kebaikan',
    description: 'Lakukan satu kebaikan setiap hari',
    category: 'ethics',
    icon: 'hand-left',
  },
  {
    templateId: 'empathy',
    name: 'Empati',
    description: 'Dengarkan dan pahami perspektif orang lain',
    category: 'ethics',
    icon: 'heart-half',
  },
  {
    templateId: 'discipline',
    name: 'Disiplin',
    description: 'Patuhi jadwal dan komitmenmu',
    category: 'productivity',
    icon: 'time',
  },
];

async function seed() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@growly.app' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@growly.app',
      password: hashedPassword,
    },
  });

  console.log('✅ Created demo user:', user.email);

  // Create habits for demo user
  for (const template of HABIT_TEMPLATES) {
    const habit = await prisma.habit.upsert({
      where: {
        id: `${user.id}-${template.templateId}`,
      },
      update: {},
      create: {
        id: `${user.id}-${template.templateId}`,
        userId: user.id,
        ...template,
      },
    });

    // Create streak
    await prisma.streak.upsert({
      where: {
        habitId_userId: {
          habitId: habit.id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        habitId: habit.id,
        userId: user.id,
        currentStreak: Math.floor(Math.random() * 14),
        longestStreak: Math.floor(Math.random() * 30) + 7,
      },
    });

    console.log('✅ Created habit:', habit.name);
  }

  const habits = await prisma.habit.findMany({
    where: { userId: user.id },
  });

  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(Math.floor(Math.random() * 12) + 8, 0, 0, 0);

    // Randomly complete some habits each day
    const habitsToComplete = habits.filter(() => Math.random() > 0.3);

    for (const habit of habitsToComplete) {
      await prisma.habitLog.create({
        data: {
          habitId: habit.id,
          userId: user.id,
          completedAt: date,
          mood: ['great', 'good', 'neutral'][Math.floor(Math.random() * 3)],
        },
      });
    }
  }

  console.log('✅ Created demo habit logs');

  const reflectionTexts = [
    'Hari ini aku berhasil bangun pagi dan meditasi selama 10 menit. Rasanya sangat menyegarkan!',
    'Mencoba untuk lebih jujur dengan perasaanku sendiri. Tidak mudah, tapi aku merasa lebih ringan.',
    'Berhasil membantu teman yang sedang kesulitan. Empati memang membutuhkan usaha, tapi sangat bermakna.',
    'Hari yang penuh tantangan, tapi aku tetap disiplin dengan jadwalku.',
    'Bersyukur untuk kesehatan dan keluarga yang mendukung.',
  ];

  for (const text of reflectionTexts) {
    await prisma.reflection.create({
      data: {
        userId: user.id,
        habitId: habits[Math.floor(Math.random() * habits.length)].id,
        content: text,
        aiResponse: 'Terima kasih sudah berbagi! Refleksimu menunjukkan kesadaran diri yang baik. Teruslah melangkah dengan penuh makna. 🌱',
      },
    });
  }

  console.log('✅ Created demo reflections');
  console.log('🎉 Seeding completed!');
}

seed()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
