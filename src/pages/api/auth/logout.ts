import type { NextApiRequest, NextApiResponse } from 'next'
import { clearAdminSession } from '../../../server/auth'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  clearAdminSession(res)
  return res.status(200).json({ message: 'Sesión cerrada' })
}
