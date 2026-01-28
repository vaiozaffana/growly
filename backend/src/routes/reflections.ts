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

export const reflectionRoutes = new Elysia({ prefix: '/reflections' })
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'super-secret-key',
  }))
  
  // Get all reflections
  .get('/', async ({ query, headers, jwt, set }) => {
    const userId = await getUserFromToken(headers, jwt);
    
    if (!userId) {
      set.status = 401;
      return { success: false, error: 'Unauthorized' };
    }
    
    const whereClause: any = { userId };
    
    if (query.habitId) {
      whereClause.habitId = query.habitId;
    }
    
    const reflections = await prisma.reflection.findMany({
      where: whereClause,
      include: {
        habit: {
          select: {
            id: true,
            name: true,
            icon: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit ? parseInt(query.limit) : 50,
    });
    
    return { success: true, data: reflections };
  }, {
    query: t.Object({
      habitId: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Reflections'],
      summary: 'Get reflections',
    },
  })
  
  // Create reflection
  .post('/', async ({ body, headers, jwt, set }) => {
    const userId = await getUserFromToken(headers, jwt);
    
    if (!userId) {
      set.status = 401;
      return { success: false, error: 'Unauthorized' };
    }
    
    const reflection = await prisma.reflection.create({
      data: {
        userId,
        ...body,
      },
    });
    
    return { success: true, data: reflection };
  }, {
    body: t.Object({
      habitId: t.Optional(t.String()),
      content: t.String(),
      aiResponse: t.Optional(t.String()),
      mood: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Reflections'],
      summary: 'Create reflection',
    },
  })
  
  // Get reflection by ID
  .get('/:id', async ({ params, headers, jwt, set }) => {
    const userId = await getUserFromToken(headers, jwt);
    
    if (!userId) {
      set.status = 401;
      return { success: false, error: 'Unauthorized' };
    }
    
    const reflection = await prisma.reflection.findFirst({
      where: { id: params.id, userId },
      include: {
        habit: {
          select: {
            id: true,
            name: true,
            icon: true,
            category: true,
          },
        },
      },
    });
    
    if (!reflection) {
      set.status = 404;
      return { success: false, error: 'Reflection not found' };
    }
    
    return { success: true, data: reflection };
  }, {
    detail: {
      tags: ['Reflections'],
      summary: 'Get reflection by ID',
    },
  })
  
  // Delete reflection
  .delete('/:id', async ({ params, headers, jwt, set }) => {
    const userId = await getUserFromToken(headers, jwt);
    
    if (!userId) {
      set.status = 401;
      return { success: false, error: 'Unauthorized' };
    }
    
    const reflection = await prisma.reflection.findFirst({
      where: { id: params.id, userId },
    });
    
    if (!reflection) {
      set.status = 404;
      return { success: false, error: 'Reflection not found' };
    }
    
    await prisma.reflection.delete({
      where: { id: params.id },
    });
    
    return { success: true, message: 'Reflection deleted' };
  }, {
    detail: {
      tags: ['Reflections'],
      summary: 'Delete reflection',
    },
  });
