import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Allow', ['GET'])
  return res.status(501).json({ message: 'Endpoint aún no implementado' })
}
