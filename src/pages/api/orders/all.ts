import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Prisma } from "../../../../generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  return res.status(200).json(prisma.order.findMany());
}