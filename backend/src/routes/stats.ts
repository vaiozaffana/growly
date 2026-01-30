import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import prisma from '../lib/prisma';

async function getUserFromToken(headers: any, jwt: any) {
  const authorization = headers.authorization;
  
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authorization.split(' ')[1];
  const payload = await jwt.verify(token);
  
  if (!payload || typeof payload !== 'object' || !('userId' in payload)) {
    return null;
  }
  
  return payload.userId as string;
}

export const statsRoutes = new Elysia({ prefix: '/stats' })
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'super-secret-key',
  }))
  
  // Get user stats
  .get('/', async ({ headers, jwt, set }) => {
    const userId = await getUserFromToken(headers, jwt);
    
    if (!userId) {
      set.status = 401;
      return { success: false, error: 'Unauthorized' };
    }
    
    // Get total habits
    const totalHabits = await prisma.habit.count({
      where: { userId, isActive: true },
    });
    
    // Get today's completed habits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const completedToday = await prisma.habitLog.count({
      where: {
        userId,
        completedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
    
    // Get current and longest streak
    const streaks = await prisma.streak.findMany({
      where: { userId },
    });
    
    let currentStreak = 0;
    let longestStreak = 0;
    
    const getDateOnly = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };
    
    const todayDate = getDateOnly(new Date());
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    
    for (const streak of streaks) {
      // Check if streak is still valid (completed today or yesterday)
      let validCurrentStreak = 0;
      
      if (streak.lastCompletedAt) {
        const lastCompletedDate = getDateOnly(streak.lastCompletedAt);
        const timeDiff = todayDate.getTime() - lastCompletedDate.getTime();
        const daysDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));
        
        // Streak is valid if last completed was today (0 days) or yesterday (1 day)
        if (daysDiff <= 1) {
          validCurrentStreak = streak.currentStreak;
        }
        // If more than 1 day gap, streak is broken (validCurrentStreak stays 0)
      }
      
      if (validCurrentStreak > currentStreak) {
        currentStreak = validCurrentStreak;
      }
      if (streak.longestStreak > longestStreak) {
        longestStreak = streak.longestStreak;
      }
    }
    
    // Get total reflections
    const totalReflections = await prisma.reflection.count({
      where: { userId },
    });
    
    // Get weekly progress (last 7 days)
    const weeklyProgress: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const completed = await prisma.habitLog.count({
        where: {
          userId,
          completedAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });
      
      // Calculate as percentage of total habits
      weeklyProgress.push(totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0);
    }
    
    return {
      success: true,
      data: {
        totalHabits,
        completedToday,
        currentStreak,
        longestStreak,
        totalReflections,
        weeklyProgress,
      },
    };
  }, {
    detail: {
      tags: ['Stats'],
      summary: 'Get user statistics',
    },
  });
