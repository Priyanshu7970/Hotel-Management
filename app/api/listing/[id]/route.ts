import { string, z } from 'zod';
import { prismaClient } from '@/app/services/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const listFormSchema = z.object({
  location: z.string().min(1, { message: 'Location is required' }),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  propertyType: z.string().min(1, { message: 'Property type is required' }),
  requirements: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
  description: z.string(),
  title: z.string(), // Keep as string for parsing
  rent: z.string(), // Keep as string for parsing
  contact: z.string(),
  images: z.array(z.instanceof(File)),
});

export type listFormData = z.infer<typeof listFormSchema>;
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (req.method === 'POST') {
    try {
      const formData = await req.formData();
      const { id } = await params;
      const userId = Number(id); // Ensure userId is a number

      // First, let's check if the user with this ID exists
      const existingUser = await prismaClient.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!existingUser) {
        return new Response(
          JSON.stringify({ message: `User with ID ${userId} not found.` }),
          {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Get all 'requirements' entries from the form data
      const requirements = formData.getAll('requirements');

      const parsedDataResult = listFormSchema.safeParse({
        location: formData.get('location'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        propertyType: formData.get('propertyType'),
        requirements: requirements, // Pass the array of requirements
        additionalNotes: formData.get('additionalNotes'),
        description: formData.get('description'),
        title: formData.get('title'), // Keep as string
        rent: formData.get('rent'), // Keep as string
        contact: formData.get('contact'),
        images: formData.getAll('images'),
      });

      if (!parsedDataResult.success) {
        console.error('Zod validation error:', parsedDataResult.error.format());
        return new Response(
          JSON.stringify({ message: 'Invalid data', errors: parsedDataResult.error.format() }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      const parsedData = parsedDataResult.data;
      const imagesArray: string[] = [];

      if (parsedData.images) {
        for (const file of parsedData.images) {
          imagesArray.push(file.name);
        }
      }

      const listingQuery = await prismaClient.home.create({
        data: {
          location: parsedData.location,
          availableDates: {
            createMany: {
              data: {
                startDate: new Date(parsedData.startDate),
                endDate: new Date(parsedData.endDate),
              },
            },
          },
          requirements: parsedData.requirements as string[] | undefined,
          userId: userId, // Use the validated userId
          title: parsedData.title,
          description: parsedData.description,
          rent: Number(parsedData.rent),
          images: imagesArray,
          contact: parsedData.contact,
        },
      });

      return new Response(
        JSON.stringify({
          success: 'success',
          id: listingQuery.id,
          message: 'The Home is listed Successfully',
        }),
        {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Error saving list query:', error);
      return NextResponse.json(
        { message: 'Internal server error', error: String(error) },
        { status: 500 }
      );
    } finally {
      await prismaClient.$disconnect();
    }
  } else {
    return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
  }
}