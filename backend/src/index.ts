import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { jwt } from '@elysiajs/jwt';
import { swagger } from '@elysiajs/swagger';

import { authRoutes } from './routes/auth';
import { habitRoutes } from './routes/habits';
import { reflectionRoutes } from './routes/reflections';
import { aiRoutes } from './routes/ai';
import { statsRoutes } from './routes/stats';
import { calendarRoutes } from './routes/calendar';

const app = new Elysia()
  // Plugins
  .use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'super-secret-key',
    exp: '7d',
  }))
  .use(swagger({
    documentation: {
      info: {
        title: 'Growly API',
        version: '1.0.0',
        description: 'API for Growly - Habit Reflection App',
      },
      tags: [
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Habits', description: 'Habit management endpoints' },
        { name: 'Reflections', description: 'Reflection endpoints' },
        { name: 'AI', description: 'AI chat endpoints' },
        { name: 'Stats', description: 'Statistics endpoints' },
        { name: 'Calendar', description: 'Calendar data endpoints' },
      ],
    },
  }))
  
  // Health check
  .get('/', () => ({
    name: 'Growly API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  }))
  
  // Routes
  .use(authRoutes)
  .use(habitRoutes)
  .use(reflectionRoutes)
  .use(aiRoutes)
  .use(statsRoutes)
  .use(calendarRoutes)
  
  // Error handling
  .onError(({ code, error, set }) => {
    console.error(`Error [${code}]:`, error);
    
    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        success: false,
        error: 'Validation error',
        details: error.message,
      };
    }
    
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        success: false,
        error: 'Resource not found',
      };
    }
    
    set.status = 500;
    return {
      success: false,
      error: 'Internal server error',
    };
  })
  
  // Start server
  .listen(process.env.PORT || 3000);

console.log(`🌱 Growly API is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
