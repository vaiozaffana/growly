import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'super-secret-key',
  }))
  
  // Register
  .post('/register', async ({ body, jwt, set }) => {
    const { name, email, password } = body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      set.status = 400;
      return {
        success: false,
        error: 'Email sudah terdaftar',
      };
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    // Generate token
    const token = await jwt.sign({ userId: user.id });
    
    return {
      success: true,
      data: {
        user,
        token,
      },
    };
  }, {
    body: t.Object({
      name: t.String({ minLength: 2 }),
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 6 }),
    }),
    detail: {
      tags: ['Auth'],
      summary: 'Register new user',
    },
  })
  
  // Login
  .post('/login', async ({ body, jwt, set }) => {
    const { email, password } = body;
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      set.status = 401;
      return {
        success: false,
        error: 'Email atau kata sandi salah',
      };
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      set.status = 401;
      return {
        success: false,
        error: 'Email atau kata sandi salah',
      };
    }
    
    // Generate token
    const token = await jwt.sign({ userId: user.id });
    
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
    };
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String(),
    }),
    detail: {
      tags: ['Auth'],
      summary: 'Login user',
    },
  })
  
  // Get Profile
  .get('/profile', async ({ headers, jwt, set }) => {
    const authorization = headers.authorization;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      set.status = 401;
      return { success: false, error: 'Unauthorized' };
    }
    
    const token = authorization.split(' ')[1];
    const payload = await jwt.verify(token);
    
    if (!payload || typeof payload !== 'object' || !('userId' in payload)) {
      set.status = 401;
      return { success: false, error: 'Invalid token' };
    }
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      set.status = 404;
      return { success: false, error: 'User not found' };
    }
    
    return { success: true, data: user };
  }, {
    detail: {
      tags: ['Auth'],
      summary: 'Get user profile',
    },
  })
  
  // Update Profile
  .put('/profile', async ({ body, headers, jwt, set }) => {
    const authorization = headers.authorization;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      set.status = 401;
      return { success: false, error: 'Unauthorized' };
    }
    
    const token = authorization.split(' ')[1];
    const payload = await jwt.verify(token);
    
    if (!payload || typeof payload !== 'object' || !('userId' in payload)) {
      set.status = 401;
      return { success: false, error: 'Invalid token' };
    }
    
    const user = await prisma.user.update({
      where: { id: payload.userId as string },
      data: body,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return { success: true, data: user };
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      avatar: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Auth'],
      summary: 'Update user profile',
    },
  })
  
  // Delete Account
  .delete('/account', async ({ headers, jwt, set }) => {
    const authorization = headers.authorization;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      set.status = 401;
      return { success: false, error: 'Unauthorized' };
    }
    
    const token = authorization.split(' ')[1];
    const payload = await jwt.verify(token);
    
    if (!payload || typeof payload !== 'object' || !('userId' in payload)) {
      set.status = 401;
      return { success: false, error: 'Invalid token' };
    }
    
    const userId = payload.userId as string;
    
    // Delete all user data in order (due to foreign key constraints)
    // 1. Delete chat history
    await prisma.chatHistory.deleteMany({
      where: { userId },
    });
    
    // 2. Delete reflections
    await prisma.reflection.deleteMany({
      where: { userId },
    });
    
    // 3. Delete habit logs
    await prisma.habitLog.deleteMany({
      where: { userId },
    });
    
    // 4. Delete streaks
    await prisma.streak.deleteMany({
      where: { userId },
    });
    
    // 5. Delete habits
    await prisma.habit.deleteMany({
      where: { userId },
    });
    
    // 6. Finally delete the user
    await prisma.user.delete({
      where: { id: userId },
    });
    
    return { 
      success: true, 
      message: 'Akun berhasil dihapus beserta semua data terkait' 
    };
  }, {
    detail: {
      tags: ['Auth'],
      summary: 'Delete user account and all related data',
    },
  });
