import type { NextApiHandler } from 'next'

const CLIENT_ID = process.env.GITHUB_CLIENT_ID

const handler: NextApiHandler = async (req, res) => {
  const authorizeUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=user`
  res.redirect(authorizeUrl)
}

export default handler
