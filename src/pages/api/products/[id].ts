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
  const id = Number(req.query.id)

  if (!id) {
    return res.status(400).json({ message: 'ID inválido' })
  }

  if (req.method === 'GET') {
    try {
      const product = await prisma.product.findUnique({ where: { id } })
      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' })
      }
      return res.status(200).json(product)
    } catch (error) {
      console.error('Error fetching product detail:', error)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  if (req.method === 'PUT') {
    if (!requireAdmin(req, res)) {
      return
    }
    const { name, description, price, stock, imageUrl } = req.body ?? {}

    const data: Record<string, unknown> = {}
    if (name) data.name = name
    if (description !== undefined) data.description = description
    if (imageUrl !== undefined) data.imageUrl = imageUrl
    if (price !== undefined) {
      const parsedPrice = parsePrice(price)
      if (parsedPrice === null) {
        return res.status(400).json({ message: 'Precio inválido' })
      }
      data.price = parsedPrice
    }
    if (stock !== undefined) {
      const parsedStock = Number(stock)
      if (!Number.isInteger(parsedStock)) {
        return res.status(400).json({ message: 'Stock inválido' })
      }
      data.stock = parsedStock
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'No se enviaron datos para actualizar' })
    }

    try {
      const updated = await prisma.product.update({ where: { id }, data })
      return res.status(200).json(updated)
    } catch (error) {
      console.error('Error updating product:', error)
      return res.status(500).json({ message: 'Error al actualizar el producto' })
    }
  }

  if (req.method === 'DELETE') {
    if (!requireAdmin(req, res)) {
      return
    }
    try {
      await prisma.product.delete({ where: { id } })
      return res.status(204).end()
    } catch (error) {
      console.error('Error deleting product:', error)
      return res.status(500).json({ message: 'No se pudo eliminar el producto' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
