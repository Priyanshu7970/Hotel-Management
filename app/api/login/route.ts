
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { prismaClient } from '@/app/services/prisma';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return new NextResponse(JSON.stringify({message:"Method Not Allowed"}),{
      status:500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  try { 
    const body = await req.json();
    const validatedData = loginSchema.parse(body);
    const { email, password } = validatedData;
        
    const user = await prismaClient.user.findUnique({ where: { email } });

    if (!user) {
      return new NextResponse(JSON.stringify({message:"User Not Found"}),{
        status:401,
        headers: {
          'Content-Type': 'application/json',
          },
      })
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return new NextResponse(JSON.stringify({message:"Invalid credential"}),{
        status:401,
        headers:{
          'Content-Type':'application/json'
        }
      });
    }

    const secret = process.env.Security_Key!;
    console.log(secret)
    if (!secret) {
      console.error('JWT_SECRET environment variable not set!');
      return new NextResponse(JSON.stringify({ message: 'Server configuration error' }),{
        status:500,
        headers:{
          'Content-Type':'application/json'
        }
      });
    }
    const token = jwt.sign({ id: user.id , email:user.email,phone:user.phone,username:user.username}, secret, { expiresIn: '1h' });

   return new NextResponse(JSON.stringify({success:"sucess", message: 'Login successful', token }),{
      status:200,
      headers:{
        'Content-Type':'application/json'
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ message: 'Validation error', error: error.errors }),{
        status:400,
        headers:{
          'Content-Type':'application/json'
        }
      });
    }
    console.error('Login error:', error);
    return new NextResponse(JSON.stringify({ message: 'Something went wrong' }),{
      status:500,
      headers:{
        'Content-Type':'application/json'
      }
  });
  } finally {
    await prismaClient.$disconnect();
  }
}
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY: string;
      DATABASE_URL: string;
      NEXT_PUBLIC_ANALYTICS_ID?: string; 
    }
  }
}