import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Prisma } from '../generated/prisma/client'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

const cafeteriaProducts = [
  {
    name: 'Espresso Doble',
    description: 'Dos shots de café arábica recién molido.',
    price: new Prisma.Decimal('1800'),
    stock: 40,
    imageUrl: '/images/products/espresso.jpg',
  },
  {
    name: 'Americano',
    description: 'Espresso rebajado con agua filtrada.',
    price: new Prisma.Decimal('1500'),
    stock: 45,
    imageUrl: '/images/products/americano.jpg',
  },
  {
    name: 'Cappuccino',
    description: 'Espresso con leche vaporizada y espuma.',
    price: new Prisma.Decimal('2500'),
    stock: 35,
    imageUrl: '/images/products/cappuccino.jpg',
  },
  {
    name: 'Latte Vainilla',
    description: 'Latte suave endulzado con jarabe de vainilla.',
    price: new Prisma.Decimal('2800'),
    stock: 30,
    imageUrl: '/images/products/vanilla_latte.jpg',
  },
  {
    name: 'Mocha Frío',
    description: 'Café frío con chocolate y crema batida.',
    price: new Prisma.Decimal('3000'),
    stock: 25,
    imageUrl: '/images/products/iced_mocha.jpg',
  },
  {
    name: 'Matcha Latte',
    description: 'Té matcha batido con leche vaporizada.',
    price: new Prisma.Decimal('3200'),
    stock: 20,
    imageUrl: '/images/products/matcha_latte.jpg',
  },
  {
    name: 'Té Chai Latte',
    description: 'Mezcla de especias chai con leche espumada.',
    price: new Prisma.Decimal('2700'),
    stock: 28,
    imageUrl: '/images/products/chai_latte.jpg',
  },
  {
    name: 'Chocolate Caliente',
    description: 'Chocolate semiamargo con leche entera y crema.',
    price: new Prisma.Decimal('2600'),
    stock: 22,
    imageUrl: '/images/products/hot_chocolate.jpg',
  },
  {
    name: 'Jugo Verde',
    description: 'Jugo prensado de espinaca, manzana y pepino.',
    price: new Prisma.Decimal('2500'),
    stock: 32,
    imageUrl: '/images/products/green_juice.jpg',
  },
  {
    name: 'Jugo Naranja',
    description: 'Naranjas recién exprimidas sin azúcar añadida.',
    price: new Prisma.Decimal('2300'),
    stock: 30,
    imageUrl: '/images/products/orange_juice.jpg',
  },
  {
    name: 'Sándwich Caprese',
    description: 'Pan ciabatta con tomate, mozzarella y pesto.',
    price: new Prisma.Decimal('4800'),
    stock: 18,
    imageUrl: '/images/products/caprese_sandwich.jpg',
  },
  {
    name: 'Sándwich Jamón Serrano',
    description: 'Pan baguette con jamón serrano, rúcula y mantequilla de hierbas.',
    price: new Prisma.Decimal('5200'),
    stock: 16,
    imageUrl: '/images/products/serrano_sandwich.jpg',
  },
  {
    name: 'Wrap Pollo Mediterráneo',
    description: 'Wrap de pollo grillado con hummus y vegetales.',
    price: new Prisma.Decimal('5400'),
    stock: 20,
    imageUrl: '/images/products/chicken_wrap.jpg',
  },
  {
    name: 'Ensalada Quinoa',
    description: 'Quinoa, verduras frescas y aderezo cítrico.',
    price: new Prisma.Decimal('5900'),
    stock: 15,
    imageUrl: '/images/products/quinoa_salad.jpg',
  },
  {
    name: 'Croissant de Mantequilla',
    description: 'Hojaldre clásico francés horneado a diario.',
    price: new Prisma.Decimal('1900'),
    stock: 24,
    imageUrl: '/images/products/croissant.jpg',
  },
  {
    name: 'Kuchen de Manzana',
    description: 'Porción de kuchen tradicional con crumble.',
    price: new Prisma.Decimal('2200'),
    stock: 14,
    imageUrl: '/images/products/apple_kuchen.jpg',
  },
  {
    name: 'Brownie con Nueces',
    description: 'Brownie de chocolate belga con nueces tostadas.',
    price: new Prisma.Decimal('2100'),
    stock: 18,
    imageUrl: '/images/products/brownie.jpg',
  },
  {
    name: 'Cheesecake Maracuyá',
    description: 'Cheesecake cremoso con salsa de maracuyá.',
    price: new Prisma.Decimal('2800'),
    stock: 12,
    imageUrl: '/images/products/passion_cheesecake.jpg',
  },
  {
    name: 'Granola Bowl',
    description: 'Yogurt griego, granola casera y fruta de temporada.',
    price: new Prisma.Decimal('3500'),
    stock: 17,
    imageUrl: '/images/products/granola_bowl.jpg',
  },
  {
    name: 'Agua Infusionada',
    description: 'Agua fría infusionada con pepino, limón y menta.',
    price: new Prisma.Decimal('1200'),
    stock: 40,
    imageUrl: '/images/products/infused_water.jpg',
  },
]

async function main() {
  console.info('Limpiando tabla de productos...')
  await prisma.product.deleteMany()
  console.info(`Insertando ${cafeteriaProducts.length} productos de cafetería...`)
  await prisma.product.createMany({ data: cafeteriaProducts })
  console.info('Seed completado.')
}

main()
  .catch((error) => {
    console.error('Error al ejecutar el seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

