import { Elysia, t } from 'elysia';
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

export const calendarRoutes = new Elysia({ prefix: '/calendar' })
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'super-secret-key',
  }))
  
  // Get calendar data for a month
  .get('/', async ({ query, headers, jwt, set }) => {
    const userId = await getUserFromToken(headers, jwt);
    
    if (!userId) {
      set.status = 401;
      return { success: false, error: 'Unauthorized' };
    }
    
    const month = parseInt(query.month || String(new Date().getMonth() + 1));
    const year = parseInt(query.year || String(new Date().getFullYear()));
    
    // Get first and last day of month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    // Get all logs for the month
    const logs = await prisma.habitLog.findMany({
      where: {
        userId,
        completedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        habit: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });
    
    // Get total active habits
    const totalHabits = await prisma.habit.count({
      where: { userId, isActive: true },
    });
    
    // Group by date
    const calendarData: Record<string, {
      completed: number;
      total: number;
      habits: string[];
      logs: any[];
    }> = {};
    
    for (const log of logs) {
      const dateStr = log.completedAt.toISOString().split('T')[0];
      
      if (!calendarData[dateStr]) {
        calendarData[dateStr] = {
          completed: 0,
          total: totalHabits,
          habits: [],
          logs: [],
        };
      }
      
      calendarData[dateStr].completed += 1;
      calendarData[dateStr].habits.push(log.habit.name);
      calendarData[dateStr].logs.push({
        habitId: log.habitId,
        habitName: log.habit.name,
        habitIcon: log.habit.icon,
        mood: log.mood,
        reflection: log.reflection,
      });
    }
    
    return {
      success: true,
      data: {
        month,
        year,
        totalHabits,
        days: calendarData,
      },
    };
  }, {
    query: t.Object({
      month: t.Optional(t.String()),
      year: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Calendar'],
      summary: 'Get calendar data',
    },
  })
  
  // Get specific day details
  .get('/:date', async ({ params, headers, jwt, set }) => {
    const userId = await getUserFromToken(headers, jwt);
    
    if (!userId) {
      set.status = 401;
      return { success: false, error: 'Unauthorized' };
    }
    
    const date = new Date(params.date);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const logs = await prisma.habitLog.findMany({
      where: {
        userId,
        completedAt: {
          gte: date,
          lt: nextDate,
        },
      },
      include: {
        habit: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
            category: true,
          },
        },
      },
    });
    
    const reflections = await prisma.reflection.findMany({
      where: {
        userId,
        createdAt: {
          gte: date,
          lt: nextDate,
        },
      },
    });
    
    const totalHabits = await prisma.habit.count({
      where: { userId, isActive: true },
    });
    
    return {
      success: true,
      data: {
        date: params.date,
        totalHabits,
        completed: logs.length,
        logs,
        reflections,
      },
    };
  }, {
    detail: {
      tags: ['Calendar'],
      summary: 'Get day details',
    },
  });
