import Link from 'next/link'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Image from 'next/image'
import { prisma } from '../../server/prisma'

const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

type ProductPayload = {
  id: number
  name: string
  description: string | null
  price: string | number
  stock: number
  imageUrl: string | null
}

export const getServerSideProps: GetServerSideProps<{ product: ProductPayload }> = async (context) => {
  const id = Number(context.params?.id)

  if (!id) {
    return { notFound: true }
  }

  const product = await prisma.product.findUnique({ where: { id } })

  if (!product) {
    return { notFound: true }
  }

  return {
    props: {
      product: JSON.parse(JSON.stringify(product)),
    },
  }
}

export default function ProductDetail({ product }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-12">
      <Link href="/" className="text-sm text-emerald-600">← Volver al catálogo</Link>
      <section className="rounded-3xl border border-zinc-200 bg-white/80 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={1200}
            height={600}
            className="h-80 w-full rounded-t-3xl object-cover"
          />
        ) : (
          <div className="flex h-80 w-full items-center justify-center rounded-t-3xl bg-gradient-to-br from-zinc-100 to-zinc-200 text-sm text-zinc-500 dark:from-zinc-800 dark:to-zinc-900">
            Sin imagen disponible
          </div>
        )}
        <div className="flex flex-col gap-4 p-8">
          <h1 className="text-4xl font-semibold">{product.name}</h1>
          {product.description && <p className="text-lg text-zinc-600 dark:text-zinc-300">{product.description}</p>}
          <div className="flex flex-wrap gap-6 text-sm text-zinc-500 dark:text-zinc-400">
            <div>
              <p className="text-xs uppercase tracking-widest">Precio</p>
              <p className="text-3xl font-semibold text-emerald-600 dark:text-emerald-400">
                {clpFormatter.format(typeof product.price === 'string' ? Number(product.price) : product.price)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest">Stock disponible</p>
              <p className="text-2xl font-semibold">{product.stock}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
