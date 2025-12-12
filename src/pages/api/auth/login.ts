import type { NextApiRequest, NextApiResponse } from 'next'
import { setAdminSession } from '../../../server/auth'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return res.status(500).json({ message: 'ADMIN_PASSWORD no está configurado' })
  }

  const { password } = req.body ?? {}
  if (password !== adminPassword) {
    return res.status(401).json({ message: 'Credenciales inválidas' })
  }

  setAdminSession(res)
  return res.status(200).json({ message: 'Autenticado' })
}
