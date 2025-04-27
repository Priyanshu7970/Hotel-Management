
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import type { NextApiRequest, NextApiResponse } from 'next';
import { json } from 'stream/consumers';

const prisma = new PrismaClient();

const bookingSchema = z.object({
  homeId: z.number().int().positive(),
  userId: z.number().int().positive(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  totalPrice: z.number().positive(),
});

type BookingData = z.infer<typeof bookingSchema>;

export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({error:"error" ,message:'Method Not Allowed'}),{
      headers:{
        'Content-Type': 'application/json',
      },
      status:405
    }) ;
  }

  try {
    const bookingData: BookingData = bookingSchema.parse(req.body);

    // Check if the home is available for the requested dates
    const conflictingDates = await prisma.availableDate.findMany({
      where: {
        homeId: bookingData.homeId,
        startDate: { lte: bookingData.endDate },
        endDate: { gte: bookingData.startDate },
      },
    });

    if (conflictingDates.length === 0) {
      return new Response(JSON.stringify({error:"error",message: 'Home is not available for those dates.' }),{
      status:400,
      headers:{
        'Content-Type': 'application/json',
      }  
      });
    }

    const booking = await prisma.booking.create({
      data: bookingData,
    });

    res.status(201).json(booking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ message: 'Validation Error', errors: error.errors }),{
        headers:{
          'Content-Type':'application/json'
        },
        status:400
      })
    }
    console.error('Error creating booking:', error);
    return new Response(JSON.stringify({message: 'Internal Server Error' ,error:'error'}),{
      headers:{
        'Content-Type':'application/json'
      },
      status:500
    })
  } finally {
    await prisma.$disconnect();
  }
}