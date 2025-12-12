import { FormEvent, useState } from 'react'

type Props = {
  onSuccess: () => Promise<void> | void
}

export function AdminLoginCard({ onSuccess }: Props) {
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        throw new Error('Credenciales inválidas')
      }

      setStatus('idle')
      setPassword('')
      await onSuccess()
    } catch (error) {
      console.error(error)
      setStatus('error')
      setMessage('Contraseña incorrecta. Vuelve a intentarlo.')
    }
  }

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white/70 p-6 text-center backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
      <h2 className="text-xl font-semibold">Acceso administrador</h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Ingresa la contraseña para habilitar la edición del catálogo.
      </p>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
        <input
          type="password"
          className="flex-1 rounded-2xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          placeholder="Contraseña de administrador"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-2xl bg-emerald-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'loading' ? 'Validando...' : 'Ingresar'}
        </button>
      </form>
      {message && <p className="mt-2 text-sm text-red-500">{message}</p>}
    </section>
  )
}

export default AdminLoginCard
