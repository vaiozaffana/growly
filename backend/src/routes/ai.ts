import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../lib/prisma';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

const SYSTEM_PROMPT = `Kamu adalah Growly, asisten AI yang membantu pengguna dalam perjalanan pengembangan kebiasaan sehat dan beretika. 

Karakteristik kamu:
- Ramah, empatik, dan suportif
- Menggunakan bahasa Indonesia yang santai tapi tetap bermakna
- Memberikan respons yang reflektif dan mendalam, bukan sekadar checklist
- Mengajukan pertanyaan yang mendorong introspeksi
- Memberikan perspektif baru tanpa menghakimi
- Merayakan pencapaian kecil dan besar
- Membantu pengguna memahami "mengapa" di balik kebiasaan mereka

Panduan interaksi:
1. Dengarkan dan validasi perasaan pengguna terlebih dahulu
2. Ajukan pertanyaan reflektif yang mendalam
3. Berikan insight yang personal dan bermakna
4. Dorong pengguna untuk berpikir tentang dampak jangka panjang
5. Jangan terlalu panjang - maksimal 2-3 paragraf
6. Gunakan emoji secara natural untuk menambah kehangatan

Topik fokus: tidur cukup, kejujuran, disiplin, empati, meditasi, bersyukur, kebaikan, dan kebiasaan positif lainnya.`;

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

// Fallback responses when AI is not available
const FALLBACK_RESPONSES = [
  "Terima kasih sudah berbagi! Refleksi yang mendalam seperti ini sangat berharga untuk pertumbuhanmu. Apa yang menurutmu menjadi pemicu utama keberhasilanmu hari ini? 🌱",
  "Menarik sekali! Aku melihat kamu benar-benar berkomitmen pada perjalanan ini. Bagaimana perasaanmu sekarang dibandingkan dengan saat pertama kali memulai? ✨",
  "Aku senang mendengar itu! Konsistensi adalah kunci. Apakah ada tantangan yang kamu hadapi saat menjalankan kebiasaan ini? 💪",
  "Wow, itu pencapaian yang luar biasa! Apa yang memotivasimu untuk terus melanjutkan meski ada rintangan? 🔥",
  "Refleksi seperti ini menunjukkan kesadaran diri yang tinggi. Menurutmu, apa pelajaran terbesar yang kamu dapatkan dari pengalaman ini? 🌟",
  "Terima kasih telah jujur dengan dirimu sendiri. Mengenali tantangan adalah langkah pertama untuk mengatasinya. Apa yang bisa kamu lakukan berbeda besok? 💭",
  "Aku menghargai kerentananmu dalam berbagi ini. Ingat, setiap hari adalah kesempatan baru. Apa satu hal kecil yang bisa kamu fokuskan untuk membuat kemajuan? 🌈",
];

export const aiRoutes = new Elysia({ prefix: '/ai' })
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'super-secret-key',
  }))
  
  // Chat with AI
  .post('/chat', async ({ body, headers, jwt, set }) => {
    const userId = await getUserFromToken(headers, jwt);
    
    if (!userId) {
      set.status = 401;
      return { success: false, error: 'Unauthorized' };
    }
    
    const { message, habitContext } = body;
    
    // Get user's recent chat history
    const recentChats = await prisma.chatHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    
    // Get habit info if context provided
    let habitInfo = '';
    if (habitContext) {
      const habit = await prisma.habit.findFirst({
        where: { id: habitContext, userId },
      });
      if (habit) {
        habitInfo = `Konteks kebiasaan: ${habit.name} - ${habit.description}`;
      }
    }
    
    // Save user message
    await prisma.chatHistory.create({
      data: {
        userId,
        role: 'user',
        content: message,
        habitContext,
      },
    });
    
    let aiResponse: string;
    
    try {
      // Try to use Gemini AI
      if (process.env.GOOGLE_AI_API_KEY) {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        // Build conversation history
        const history = recentChats
          .reverse()
          .map(chat => `${chat.role === 'user' ? 'User' : 'Growly'}: ${chat.content}`)
          .join('\n');
        
        const prompt = `${SYSTEM_PROMPT}

${habitInfo ? habitInfo + '\n\n' : ''}Riwayat percakapan terbaru:
${history}

User: ${message}

Growly:`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        aiResponse = response.text();
      } else {
        // Use fallback response
        aiResponse = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
      }
    } catch (error) {
      console.error('AI error:', error);
      // Use fallback response on error
      aiResponse = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    }
    
    // Save AI response
    await prisma.chatHistory.create({
      data: {
        userId,
        role: 'assistant',
        content: aiResponse,
        habitContext,
      },
    });
    
    // Create reflection record
    await prisma.reflection.create({
      data: {
        userId,
        habitId: habitContext || null,
        content: message,
        aiResponse,
      },
    });
    
    return {
      success: true,
      data: {
        response: aiResponse,
      },
    };
  }, {
    body: t.Object({
      message: t.String(),
      habitContext: t.Optional(t.String()),
    }),
    detail: {
      tags: ['AI'],
      summary: 'Chat with AI',
    },
  })
  
  // Get chat history
  .get('/history', async ({ query, headers, jwt, set }) => {
    const userId = await getUserFromToken(headers, jwt);
    
    if (!userId) {
      set.status = 401;
      return { success: false, error: 'Unauthorized' };
    }
    
    const whereClause: any = { userId };
    
    if (query.habitContext) {
      whereClause.habitContext = query.habitContext;
    }
    
    const history = await prisma.chatHistory.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
      take: query.limit ? parseInt(query.limit) : 50,
    });
    
    return { success: true, data: history };
  }, {
    query: t.Object({
      habitContext: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
    detail: {
      tags: ['AI'],
      summary: 'Get chat history',
    },
  })
  
  // Clear chat history
  .delete('/history', async ({ headers, jwt, set }) => {
    const userId = await getUserFromToken(headers, jwt);
    
    if (!userId) {
      set.status = 401;
      return { success: false, error: 'Unauthorized' };
    }
    
    await prisma.chatHistory.deleteMany({
      where: { userId },
    });
    
    return { success: true, message: 'Chat history cleared' };
  }, {
    detail: {
      tags: ['AI'],
      summary: 'Clear chat history',
    },
  });
