// /pages/api/homes/index.ts (Browse Homes)

import { PrismaClient} from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();



export  async function GET(
  req:Request
) {
  if (req.method !== 'GET') {
    return new NextResponse(JSON.stringify({ message: 'Server configuration error' }),{
            status:405,
            headers:{
              'Content-Type':'application/json'
            }
          });
  }

  try {
    const homes = await prisma.home.findMany({});
    console.log("hello!");
    if(homes.length>0){
   return  new NextResponse(JSON.stringify({homes,success:"success"}),{
           status:200,
           headers:{
             'Content-Type':'application/json'
           }
          
         });
        }else{
          return new NextResponse(JSON.stringify({error:"error", message:'No homes found'}),{
            status:404,
            headers:{
              'Content-Type':'application/json'
              }
              });
        }

  } catch (error) {
      return new NextResponse(JSON.stringify({ message: 'Internal Server Error', error: error }),{
        status:400,
        headers:{
          'Content-Type':'application/json'
        }

      });
    }
   
}

