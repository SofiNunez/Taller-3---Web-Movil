import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../server/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return res.status(500).json({ message: 'Error fetching orders' })
  }
}
