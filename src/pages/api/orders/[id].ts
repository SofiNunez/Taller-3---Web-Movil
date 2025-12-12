import { PrismaPg } from '@prisma/adapter-pg';
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Prisma} from '../../../../generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = parseInt(req.query.id as string);

  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'ID inválido' });
  }

  if (req.method === 'GET') {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          user: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
      }

      return res.status(200).json({ success: true, data: order });
    } catch (error) {
      console.error('Error al obtener pedido:', error);
      return res.status(500).json({ success: false, error: 'Error al obtener pedido' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { status } = req.body;

      // Verificar si el order existe
      const orderExiste = await prisma.order.findUnique({
        where: { id },
      });

      if (!orderExiste) {
        return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
      }

      // Validar estado
      const estadosValidos = ['pending', 'accepted', 'cancelled'];
      if (status && !estadosValidos.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Estado inválido. Estados válidos: ${estadosValidos.join(', ')}`,
        });
      }

      // Actualizar order
      const orderActualizado = await prisma.order.update({
        where: { id },
        data: {
          ...(status && { status }),
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

      return res.status(200).json({ success: true, data: orderActualizado });
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      return res.status(500).json({ success: false, error: 'Error al actualizar pedido' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          orderItems: true,
        },
      });

      if (!order) {
        return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
      }

      // Devolver stock a los productos
      for (const item of order.orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Eliminar order (los orderItems se eliminan automáticamente por cascade)
      await prisma.order.delete({
        where: { id },
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Pedido eliminado correctamente' 
      });
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      return res.status(500).json({ success: false, error: 'Error al eliminar pedido' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).json({ success: false, error: `Método ${req.method} no permitido` });
}