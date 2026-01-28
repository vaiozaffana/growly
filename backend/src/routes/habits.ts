import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import prisma from '../lib/prisma';

// Middleware to get user from token
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

export const habitRoutes = new Elysia({ prefix: '/habits' })
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'super-secret-key',
  }))
  
  // Get all habits for user
  .get('/', async ({ headers, jwt, set }) => {
    const userId = await getUserFromToken(headers, jwt);
    
    if (!userId) {
      set.status = 401;
      return { success: false, error: 'Unauthorized' };
    }
    
    const habits = await prisma.habit.findMany({
      where: { userId, isActive: true },
      include: {
        streaks: true,
        logs: {
          take: 1,
          orderBy: { completedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    
    return { success: true, data: habits };
  }, {
    detail: {
      tags: ['Habits'],
      summary: 'Get all habits',
    },
  })
  
  // Get today's progress
  .get('/today', async ({ headers, jwt, set }) => {
    const userId = await getUserFromToken(headers, jwt);
    
    if (!userId) {
      set.status = 401;
      return { success: false, error: 'Unauthorized' };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const habits = await prisma.habit.findMany({
      where: { userId, isActive: true },
    });
    
    const todayLogs = await prisma.habitLog.findMany({
      where: {
        userId,
        completedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
    
    const completedIds = todayLogs.map(log => log.habitId);
    
    return {
      success: true,
      data: {
        completed: completedIds,
        total: habits.length,
      },
    };
  }, {
    detail: {
      tags: ['Habits'],
      summary: 'Get today\'s progress',
    },
  })
  
  // Create habit
  .post('/', async ({ body, headers, jwt, set }) => {
    const userId = await getUserFromToken(headers, jwt);
    
    if (!userId) {
      set.status = 401;
      return { success: false, error: 'Unauthorized' };
    }
    
    const habit = await prisma.habit.create({
      data: {
        ...body,
        userId,
      },
    });
    
    // Create streak record
    await prisma.streak.create({
      data: {
        habitId: habit.id,
        userId,
      },
    });
    
    return { success: true, data: habit };
  }, {
    body: t.Object({
      templateId: t.Optional(t.String()),
      name: t.String(),
      description: t.String(),
      category: t.String(),
      icon: t.String(),
      reminderTime: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Habits'],
      summary: 'Create new habit',
    },
  })
  
  // Update habit
  .put('/:id', async ({ params, body, headers, jwt, set }) => {
    const userId = await getUserFromToken(headers, jwt);
    
    if (!userId) {
      set.status = 401;
      return { success: false, error: 'Unauthorized' };
    }
    
    const habit = await prisma.habit.findFirst({
      where: { id: params.id, userId },
    });
    
    if (!habit) {
      set.status = 404;
      return { success: false, error: 'Habit not found' };
    }
    
    const updated = await prisma.habit.update({
      where: { id: params.id },
      data: body,
    });
    
    return { success: true, data: updated };
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      description: t.Optional(t.String()),
      category: t.Optional(t.String()),
      icon: t.Optional(t.String()),
      isActive: t.Optional(t.Boolean()),
      reminderTime: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Habits'],
      summary: 'Update habit',
    },
  })
  
  // Delete habit
  .delete('/:id', async ({ params, headers, jwt, set }) => {
    const userId = await getUserFromToken(headers, jwt);
    
    if (!userId) {
      set.status = 401;
      return { success: false, error: 'Unauthorized' };
    }
    
    const habit = await prisma.habit.findFirst({
      where: { id: params.id, userId },
    });
    
    if (!habit) {
      set.status = 404;
      return { success: false, error: 'Habit not found' };
    }
    
    await prisma.habit.delete({
      where: { id: params.id },
    });
    
    return { success: true, message: 'Habit deleted' };
  }, {
    detail: {
      tags: ['Habits'],
      summary: 'Delete habit',
    },
  })
  
  // Log habit completion
  .post('/:id/log', async ({ params, body, headers, jwt, set }) => {
    const userId = await getUserFromToken(headers, jwt);
    
    if (!userId) {
      set.status = 401;
      return { success: false, error: 'Unauthorized' };
    }
    
    const habit = await prisma.habit.findFirst({
      where: { id: params.id, userId },
    });
    
    if (!habit) {
      set.status = 404;
      return { success: false, error: 'Habit not found' };
    }
    
    // Create log
    const log = await prisma.habitLog.create({
      data: {
        habitId: params.id,
        userId,
        ...body,
      },
    });
    
    // Update streak
    const streak = await prisma.streak.findFirst({
      where: { habitId: params.id, userId },
    });
    
    if (streak) {
      const now = new Date();
      const lastCompleted = streak.lastCompletedAt;
      let newCurrentStreak = streak.currentStreak;
      
      // Helper function to get date only (no time)
      const getDateOnly = (date: Date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
      };
      
      const todayDate = getDateOnly(now);
      
      if (lastCompleted) {
        const lastCompletedDate = getDateOnly(lastCompleted);
        
        // Calculate difference in days
        const timeDiff = todayDate.getTime() - lastCompletedDate.getTime();
        const daysDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0) {
          // Same day - don't increase streak, just update timestamp
          // Streak stays the same
        } else if (daysDiff === 1) {
          // Consecutive day - increase streak
          newCurrentStreak += 1;
        } else {
          // Gap of more than 1 day - reset streak
          newCurrentStreak = 1;
        }
      } else {
        // First completion ever
        newCurrentStreak = 1;
      }
      
      await prisma.streak.update({
        where: { id: streak.id },
        data: {
          currentStreak: newCurrentStreak,
          longestStreak: Math.max(streak.longestStreak, newCurrentStreak),
          lastCompletedAt: now,
        },
      });
    }
    
    return { success: true, data: log };
  }, {
    body: t.Object({
      reflection: t.Optional(t.String()),
      mood: t.Optional(t.String()),
      notes: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Habits'],
      summary: 'Log habit completion',
    },
  })
  
  // Get habit logs
  .get('/:id/logs', async ({ params, query, headers, jwt, set }) => {
    const userId = await getUserFromToken(headers, jwt);
    
    if (!userId) {
      set.status = 401;
      return { success: false, error: 'Unauthorized' };
    }
    
    const whereClause: any = {
      habitId: params.id,
      userId,
    };
    
    if (query.startDate) {
      whereClause.completedAt = {
        ...whereClause.completedAt,
        gte: new Date(query.startDate),
      };
    }
    
    if (query.endDate) {
      whereClause.completedAt = {
        ...whereClause.completedAt,
        lte: new Date(query.endDate),
      };
    }
    
    const logs = await prisma.habitLog.findMany({
      where: whereClause,
      orderBy: { completedAt: 'desc' },
    });
    
    return { success: true, data: logs };
  }, {
    query: t.Object({
      startDate: t.Optional(t.String()),
      endDate: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Habits'],
      summary: 'Get habit logs',
    },
  });
