import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { NextApiRequest, NextApiResponse } from 'next';
import Jwt  from 'jsonwebtoken';
const prisma = new PrismaClient();

const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(), // Consider adding a more specific regex
});

type UpdateUserInput = z.infer<typeof updateUserSchema>;
const securityKey: string = process.env.Security_Key!;

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'PUT') {
    return new Response(JSON.stringify({error:'error', message: 'Method Not Allowed' }),{
        headers:{
            'Content-Type':'application/json'
        },
        status:405
    }) 
  }

  try {
    const parsedId = parseInt(id as string, 10);
    if (isNaN(parsedId)) {
      return new Response(JSON.stringify({error:'error', message: 'Invalid user ID' }),{
        headers:{
            'Content-Type':'application/json'
        },
        status:400
    }) 
    }

    const bodyResult = updateUserSchema.safeParse(req.body);

    if (!bodyResult.success) {
      return res.status(400).json({ message: 'Invalid request body', errors: bodyResult.error.issues });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parsedId },
      data: bodyResult.data,
    });
    const token = Jwt.sign(updatedUser,securityKey,{expiresIn:'1h'});

   return new Response(JSON.stringify({success:"sucess",token}),{
    headers:{
        'Content-Type':'application/json'
        },
        status:200
   })
  } catch (error) {
    console.error('Error updating user:', error);
    return new Response(JSON.stringify({error:"error",message:'Something went wrong'}),{
        headers:{
            'Content-Type':'application/json'
        },
        status:500

    }) 
  } finally {
    await prisma.$disconnect();
  }
}
