import type { NextApiRequest, NextApiResponse } from 'next'

const ADMIN_COOKIE = 'admin_session'
const ADMIN_COOKIE_VALUE = '1'
const COOKIE_MAX_AGE = 60 * 60 * 12 // 12 horas

export const isAdminRequest = (req: NextApiRequest) => {
  const cookies = req.headers.cookie?.split(';') ?? []
  return cookies.some((cookie) => cookie.trim() === `${ADMIN_COOKIE}=${ADMIN_COOKIE_VALUE}`)
}

export const requireAdmin = (req: NextApiRequest, res: NextApiResponse) => {
  if (!isAdminRequest(req)) {
    res.status(401).json({ message: 'Debes iniciar sesión como administrador' })
    return false
  }
  return true
}

export const setAdminSession = (res: NextApiResponse) => {
  res.setHeader(
    'Set-Cookie',
    `${ADMIN_COOKIE}=${ADMIN_COOKIE_VALUE}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`
  )
}

export const clearAdminSession = (res: NextApiResponse) => {
  res.setHeader('Set-Cookie', `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
}
