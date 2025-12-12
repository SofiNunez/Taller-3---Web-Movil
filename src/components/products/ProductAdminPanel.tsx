import { FormEvent, useState } from 'react'

type FormState = {
  name: string
  description: string
  price: string
  stock: string
  imageUrl: string
}

const emptyForm: FormState = {
  name: '',
  description: '',
  price: '',
  stock: '',
  imageUrl: '',
}

type Props = {
  onMutated: () => Promise<void> | void
  onLogout: () => Promise<void> | void
}

const parseNumber = (value: string) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function ProductAdminPanel({ onMutated, onLogout }: Props) {
  const [createForm, setCreateForm] = useState<FormState>(emptyForm)
  const [editId, setEditId] = useState('')
  const [editForm, setEditForm] = useState<FormState>(emptyForm)
  const [deleteId, setDeleteId] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setFeedback(null)
    const payload = {
      ...createForm,
      price: parseNumber(createForm.price),
      stock: parseNumber(createForm.stock),
    }

    if (payload.price === null || payload.stock === null) {
      setFeedback('Precio y stock deben ser valores numéricos válidos.')
      setBusy(false)
      return
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('No se pudo crear el producto')
      }

      setCreateForm(emptyForm)
      setFeedback('Producto creado correctamente ✅')
      await onMutated()
    } catch (error) {
      console.error(error)
      setFeedback('Error al crear el producto. Revisa los datos e intenta nuevamente.')
    } finally {
      setBusy(false)
    }
  }

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editId) {
      setFeedback('Debes indicar un ID para actualizar.')
      return
    }
    setBusy(true)
    setFeedback(null)

    const payload: Record<string, unknown> = {}
    if (editForm.name) payload.name = editForm.name
    if (editForm.description) payload.description = editForm.description
    if (editForm.imageUrl) payload.imageUrl = editForm.imageUrl
    if (editForm.price) {
      const price = parseNumber(editForm.price)
      if (price === null) {
        setFeedback('El precio debe ser numérico.')
        setBusy(false)
        return
      }
      payload.price = price
    }
    if (editForm.stock) {
      const stock = parseNumber(editForm.stock)
      if (stock === null) {
        setFeedback('El stock debe ser numérico.')
        setBusy(false)
        return
      }
      payload.stock = stock
    }

    if (Object.keys(payload).length === 0) {
      setFeedback('No hay campos para actualizar.')
      setBusy(false)
      return
    }

    try {
      const response = await fetch(`/api/products/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('No se pudo actualizar el producto')
      }

      setEditForm(emptyForm)
      setEditId('')
      setFeedback('Producto actualizado ✅')
      await onMutated()
    } catch (error) {
      console.error(error)
      setFeedback('Error al actualizar el producto. Verifica el ID y los datos ingresados.')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) {
      setFeedback('Debes indicar el ID a eliminar.')
      return
    }
    setBusy(true)
    setFeedback(null)
    try {
      const response = await fetch(`/api/products/${deleteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('No se pudo eliminar el producto')
      }

      setDeleteId('')
      setFeedback('Producto eliminado 🗑️')
      await onMutated()
    } catch (error) {
      console.error(error)
      setFeedback('No fue posible eliminar el producto. Verifica el ID.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-500">Administración</p>
        <h2 className="text-2xl font-semibold">Gestionar productos</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Usa estos formularios para crear, actualizar o eliminar ítems directamente desde la base de datos.
          </p>
        </div>
        <button
          type="button"
          className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-400/40 dark:text-red-300"
          onClick={() => onLogout()}
        >
          Cerrar sesión
        </button>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <form className="space-y-3" onSubmit={handleCreate}>
          <h3 className="text-lg font-semibold">Crear producto</h3>
          <input
            className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="Nombre"
            value={createForm.name}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <textarea
            className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="Descripción"
            value={createForm.description}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <div className="flex gap-3">
            <input
              className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="Precio CLP"
              value={createForm.price}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, price: e.target.value }))}
              required
            />
            <input
              className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="Stock"
              value={createForm.stock}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, stock: e.target.value }))}
              required
            />
          </div>
          <input
            className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="URL de imagen"
            value={createForm.imageUrl}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Crear producto
          </button>
        </form>

        <form className="space-y-3" onSubmit={handleUpdate}>
          <h3 className="text-lg font-semibold">Actualizar producto</h3>
          <input
            className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="ID del producto"
            value={editId}
            onChange={(e) => setEditId(e.target.value)}
            required
          />
          <input
            className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="Nuevo nombre (opcional)"
            value={editForm.name}
            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <textarea
            className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="Descripción"
            value={editForm.description}
            onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <div className="flex gap-3">
            <input
              className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="Precio CLP"
              value={editForm.price}
              onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
            />
            <input
              className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="Stock"
              value={editForm.stock}
              onChange={(e) => setEditForm((prev) => ({ ...prev, stock: e.target.value }))}
            />
          </div>
          <input
            className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="URL de imagen"
            value={editForm.imageUrl}
            onChange={(e) => setEditForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-amber-500 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Guardar cambios
          </button>
        </form>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-dashed border-zinc-200 pt-6 dark:border-zinc-700">
        <h3 className="text-lg font-semibold">Eliminar producto</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="ID a eliminar"
            value={deleteId}
            onChange={(e) => setDeleteId(e.target.value)}
          />
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className="rounded-xl bg-red-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Eliminar
          </button>
        </div>
        {feedback && <p className="text-sm text-zinc-600 dark:text-zinc-400">{feedback}</p>}
      </div>
    </section>
  )
}

export default ProductAdminPanel
