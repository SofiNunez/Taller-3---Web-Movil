import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../server/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
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
        orderBy: {
          createdAt: 'desc',
        },
      });
      return res.status(200).json({ success: true, data: orders });
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      return res.status(500).json({ success: false, error: 'Error al obtener pedidos' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { userId, orderItems } = req.body;

      if (!userId || !orderItems || orderItems.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Faltan campos requeridos (userId, orderItems)' 
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
        });
      }

      // Verificar que todos los productos existen y tienen stock suficiente
      for (const item of orderItems) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          return res.status(404).json({
            success: false,
            error: `Producto con ID ${item.productId} no encontrado`,
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            error: `Stock insuficiente para el producto ${product.name}`,
          });
        }
      }

      const order = await prisma.order.create({
        data: {
          userId,
          orderItems: {
            create: orderItems.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          user: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      // Actualizar stock de productos
      for (const item of orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return res.status(201).json({ success: true, data: order });
    } catch (error) {
      console.error('Error al crear pedido:', error);
      return res.status(500).json({ success: false, error: 'Error al crear pedido' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ success: false, error: `Método ${req.method} no permitido` });
}
