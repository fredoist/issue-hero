import type { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  res.setHeader('Set-Cookie', `token=; Path=/; HttpOnly; SameSite=Lax; Secure=true;`)
  res.redirect('/')
}

export default handler
