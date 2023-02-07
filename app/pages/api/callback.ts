import type { NextApiHandler } from 'next'

const CLIENT_ID = process.env.GITHUB_CLIENT_ID
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET

const handler: NextApiHandler = async (req, res) => {
  const { code } = req.query

  try {
    const response = await fetch(`https://github.com/login/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      }),
    })
    const data = await response.json()
    
    res.setHeader('Set-Cookie', `token=${data.access_token}; Path=/; HttpOnly; SameSite=Lax; Secure=true;`)
    res.redirect('/')
  } catch (error) {
    if (error) {
      res.status(500).json({ error: (error as any).message || error.toString() })
    }
  }
}

export default handler
