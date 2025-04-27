import { z } from 'zod';
import { prismaClient } from '@/app/services/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const registrationSchema = z.object({
  username: z.string().min(3, { message: 'Username must have minimum 3 length' }),
  email: z.string().email({ message: 'Invalid email format.' }),
  phone:z.string()
  ,
  password: z.string().min(8, { message: 'Password must be at least 8 characters.Password must include alphabets in lowercases and uppercases, number, @, and no spaces.' }).refine(
      (password) => /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@])(?!.*\s).{6,}$/.test(password),
      { message: 'Password must be at least 8 characters.Password must include alphabets in lowercases and uppercases, number, @, and no spaces.' }
  ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const securityKey: string = process.env.Security_Key!;

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Failed to process data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const requestBody = await req.json(); 

    // Validate the parsed body
    const 
    registrationData = registrationSchema.parse(requestBody);

    // Hash the password
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    async function checkUserExists(username: string, email: string): Promise<boolean> {
      const userByUsername = await prismaClient.user.findUnique({
        where: { username },
      });
    
      if (userByUsername) {
        return true;
      }
    
      const userByEmail = await prismaClient.user.findUnique({
        where: { email },
      });
    
      return !!userByEmail;
    }

    // Check if username or email already exists
    const userExists = await checkUserExists(registrationData.username, registrationData.email);

    if (userExists) {
      return new Response(JSON.stringify({error:"error", message: 'Username or email already exists' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

   const user = await prismaClient.user.create({
  data: {
     username:registrationData.username,
     email:registrationData.email,
     password:hashedPassword,
     phone:registrationData.phone
  },
})
    // Generate JWT
    const token = jwt.sign(
      {id:user.id, username: registrationData.username, email: registrationData.email,password:registrationData.password },
      securityKey
    );

    return new Response(JSON.stringify({sucess:"sucess", message: 'User registered successfully', token }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `token=${token}; HttpOnly; Secure; SameSite=Lax`,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ message: 'Validation error', errors: error.errors }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ error:"error",message: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
