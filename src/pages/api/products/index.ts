import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../server/prisma'
import { requireAdmin } from '../../../server/auth'

const parsePrice = (value: unknown) => {
  if (typeof value === 'number') {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) {
      return null
    }
    return parsed
  }
  return null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const products = await prisma.product.findMany({
        orderBy: { name: 'asc' },
      })

      return res.status(200).json(products)
    } catch (error) {
      console.error('Error fetching products:', error)
      return res.status(500).json({ message: 'Error fetching products' })
    }
  }

  if (req.method === 'POST') {
    if (!requireAdmin(req, res)) {
      return
    }
    const { name, description, price, stock, imageUrl } = req.body ?? {}

    if (!name) {
      return res.status(400).json({ message: 'El nombre es obligatorio' })
    }

    const parsedPrice = parsePrice(price)
    const parsedStock = Number(stock)

    if (parsedPrice === null || !Number.isInteger(parsedStock)) {
      return res.status(400).json({ message: 'Precio o stock inválidos' })
    }

    try {
      const product = await prisma.product.create({
        data: {
          name,
          description,
          price: parsedPrice,
          stock: parsedStock,
          imageUrl,
        },
      })

      return res.status(201).json(product)
    } catch (error) {
      console.error('Error creating product:', error)
      return res.status(500).json({ message: 'No se pudo crear el producto' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
