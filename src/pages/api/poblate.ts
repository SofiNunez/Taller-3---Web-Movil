import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from "../../../generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
});

type ResponseData = {
  message: string;
};

const data = {
  "users": [
    { "id": 1, "name": "Juan Pérez", "email": "juan@example.com" },
    { "id": 2, "name": "María López", "email": "maria@example.com" }
  ],
  "products": [
    {
      "id": 1,
      "name": "Café Latte",
      "description": "Café con leche cremoso servido caliente",
      "price": 3500,
      "stock": 100,
      "imageUrl": "/latte.jpg"
    },
    {
      "id": 2,
      "name": "Cappuccino",
      "description": "Espuma suave con café intenso",
      "price": 3800,
      "stock": 80,
      "imageUrl": "/cap.jpeg"
    },
    {
      "id": 3,
      "name": "Espresso",
      "description": "Café corto y concentrado",
      "price": 2200,
      "stock": 120,
      "imageUrl": "/esp.jpg"
    },
    {
      "id": 4,
      "name": "Croissant",
      "description": "Croissant de mantequilla recién horneado",
      "price": 1800,
      "stock": 40,
      "imageUrl": "/italian-croissants-15.jpg"
    },
    {
      "id": 5,
      "name": "Muffin de Chocolate",
      "description": "Muffin húmedo con chips de chocolate",
      "price": 2000,
      "stock": 50,
      "imageUrl": "/mufin.jpg"
    },
    {
      "id": 6,
      "name": "Té Chai",
      "description": "Infusión especiada con leche",
      "price": 3000,
      "stock": 70,
      "imageUrl": "/te.jpg"
    }
  ],
  "orders": [
    {
      "id": 1,
      "userId": 1,
      "status": "pending",
      "orderItems": [
        { "productId": 1, "quantity": 1, "price": 3500 },
        { "productId": 4, "quantity": 1, "price": 1800 }
      ]
    },
    {
      "id": 2,
      "userId": 2,
      "status": "completed",
      "orderItems": [
        { "productId": 3, "quantity": 2, "price": 2200 },
        { "productId": 5, "quantity": 1, "price": 2000 }
      ]
    }
  ]
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    // Crear/actualizar usuarios
    for (const user of data.users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    }

    // Crear/actualizar productos
    for (const product of data.products) {
      await prisma.product.upsert({
        where: { id: product.id },
        update: {},
        create: product,
      });
    }

    // Crear/actualizar órdenes + items
    for (const order of data.orders) {
      await prisma.order.upsert({
        where: { id: order.id },
        update: {},
        create: {
          id: order.id,
          userId: order.userId,
          status: order.status,
          orderItems: {
            create: order.orderItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });
    }

    res.status(200).json({ message: "Base de datos poblada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al poblar la base de datos" });
  }
}
