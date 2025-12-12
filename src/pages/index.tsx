import Image from 'next/image'
import Link from 'next/link'
import { Geist, Geist_Mono } from 'next/font/google'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setCategory, setSearch, setSort } from '../store/slices/productFiltersSlice'
import ProductAdminPanel from '../components/products/ProductAdminPanel'
import AdminLoginCard from '../components/products/AdminLoginCard'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

type Category = 'cafes' | 'sandwiches' | 'bebidas' | 'dulces' | 'otros'

type ProductPayload = {
  id: number
  name: string
  description: string | null
  price: string | number
  stock: number
  imageUrl: string | null
}

type Product = ProductPayload & {
  category: Category
}

const inferCategory = (product: ProductPayload): Category => {
  const name = product.name.toLowerCase()

  if (
    name.includes('espresso') ||
    name.includes('cappuccino') ||
    name.includes('latte') ||
    name.includes('mocha') ||
    name.includes('matcha') ||
    name.includes('té') ||
    name.includes('café')
  ) {
    return 'cafes'
  }

  if (name.includes('sándwich') || name.includes('sandwich') || name.includes('wrap') || name.includes('ensalada')) {
    return 'sandwiches'
  }

  if (name.includes('jugo') || name.includes('agua')) {
    return 'bebidas'
  }

  if (
    name.includes('kuchen') ||
    name.includes('brownie') ||
    name.includes('cheesecake') ||
    name.includes('muffin') ||
    name.includes('croissant') ||
    name.includes('granola')
  ) {
    return 'dulces'
  }

  return 'otros'
}

const categoryFilters: { id: 'all' | Category; label: string }[] = [
  { id: 'all', label: 'Todo' },
  { id: 'cafes', label: 'Cafés' },
  { id: 'sandwiches', label: 'Sándwiches' },
  { id: 'bebidas', label: 'Bebidas' },
  { id: 'dulces', label: 'Dulces' },
  { id: 'otros', label: 'Otros' },
]

export default function Home() {
  const dispatch = useAppDispatch()
  const { category, search, sort } = useAppSelector((state) => state.productFilters)

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products')
      if (!response.ok) {
        throw new Error('No se pudieron cargar los productos')
      }
      const data: ProductPayload[] = await response.json()
      setProducts(data.map((item) => ({ ...item, category: inferCategory(item) })))
    } catch (err) {
      console.error(err)
      setError('Ocurrió un problema al cargar el catálogo. Intenta nuevamente más tarde.')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (!response.ok) {
        throw new Error('No se pudo verificar la sesión')
      }
      const data = await response.json()
      setIsAdmin(Boolean(data.isAdmin))
    } catch (err) {
      console.error(err)
      setIsAdmin(false)
    } finally {
      setCheckingSession(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
    refreshSession()
  }, [loadProducts, refreshSession])

  const formatPrice = (value: Product['price']) => {
    const amount = typeof value === 'string' ? Number(value) : value
    return clpFormatter.format(amount ?? 0)
  }

  const handleLoginSuccess = useCallback(async () => {
    setCheckingSession(true)
    await refreshSession()
  }, [refreshSession])

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setCheckingSession(true)
    await refreshSession()
  }, [refreshSession])

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim()
    return products
      .filter((product) => (category === 'all' ? true : product.category === category))
      .filter((product) =>
        term
          ? product.name.toLowerCase().includes(term) || product.description?.toLowerCase().includes(term)
          : true
      )
      .sort((a, b) => {
        if (sort === 'name') {
          return a.name.localeCompare(b.name)
        }
        const priceA = typeof a.price === 'string' ? Number(a.price) : a.price
        const priceB = typeof b.price === 'string' ? Number(b.price) : b.price
        return priceA - priceB
      })
  }, [products, category, search, sort])

  return (
    <div className={`${geistSans.className} ${geistMono.className} min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50`}>
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 py-16 px-6">
        <header className="flex flex-col gap-3 text-center sm:text-left">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-500">Cafetería UCENIN</p>
          <h1 className="text-4xl font-semibold">¿Qué podemos ofrecerte?</h1>
          <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
            Revisa nuestro catálogo de productos y elige tu favorito para disfrutar en nuestra cafetería.
          </p>
        </header>

        {loading && (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500">
            Cargando productos...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-400/40 dark:bg-red-950/20">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white/70 p-5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="flex flex-1 flex-wrap gap-2">
                  {categoryFilters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => dispatch(setCategory(filter.id))}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        category === filter.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-200'
                          : 'border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                  <input
                    className="flex-1 rounded-2xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                    placeholder="Buscar por nombre o descripción"
                    value={search}
                    onChange={(e) => dispatch(setSearch(e.target.value))}
                  />
                  <select
                    className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                    value={sort}
                    onChange={(e) => dispatch(setSort(e.target.value as 'name' | 'price'))}
                  >
                    <option value="name">Ordenar por nombre</option>
                    <option value="price">Ordenar por precio</option>
                  </select>
                </div>
              </div>
            </div>

            <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="flex flex-col rounded-3xl border border-zinc-200 bg-white/80 shadow-sm shadow-zinc-900/5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={600}
                      height={400}
                      className="h-48 w-full rounded-t-3xl object-cover"
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center rounded-t-3xl bg-gradient-to-br from-zinc-100 to-zinc-200 text-sm text-zinc-500 dark:from-zinc-800 dark:to-zinc-900">
                      Sin imagen
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-4 p-5">
                    <div className="flex flex-col gap-2">
                      <span className="self-start rounded-full bg-zinc-100 px-3 py-1 text-xs uppercase tracking-widest text-zinc-500 dark:bg-zinc-800 dark:text-zinc-200">
                        {categoryFilters.find((filter) => filter.id === product.category)?.label ?? 'General'}
                      </span>
                      <h2 className="text-xl font-semibold">{product.name}</h2>
                      {product.description && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{product.description}</p>
                      )}
                    </div>
                    <div className="mt-auto flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
                      <span className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatPrice(product.price)}
                      </span>
                      <span>Stock: {product.stock}</span>
                    </div>
                    <Link
                      href={`/products/${product.id}`}
                      className="text-sm font-semibold text-emerald-600 hover:underline"
                    >
                      Ver detalle
                    </Link>
                  </div>
                </article>
              ))}

              {filteredProducts.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500">
                  No hay productos para esta vista.
                </div>
              )}

              {products.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500">
                  No hay productos cargados. Ejecuta <code className="rounded bg-zinc-100 px-2 py-1 font-mono text-sm">npx prisma db seed</code> para poblar el catálogo.
                </div>
              )}
            </section>

            {checkingSession ? (
              <div className="rounded-3xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
                Verificando credenciales...
              </div>
            ) : isAdmin ? (
              <ProductAdminPanel onMutated={loadProducts} onLogout={handleLogout} />
            ) : (
              <AdminLoginCard onSuccess={handleLoginSuccess} />
            )}
          </>
        )}
      </main>
    </div>
  )
}
