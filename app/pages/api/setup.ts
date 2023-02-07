import type { NextApiHandler } from 'next'
import redis from '../../services/db'

const handler: NextApiHandler = async (req, res) => {
  const { installation_id } = req.query
  const { token } = req.cookies
  try {
    const response = await fetch(
      `https://api.github.com/user/installations/${installation_id}/repositories`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    )
    const { repositories } = await response.json()
    if (!repositories.length) {
      return res.status(404).json({ error: 'No repositories found' })
    }
    const repos = repositories.map((repo: any) => repo.full_name)
    await redis.set(repositories[0].owner.login, JSON.stringify(repos))
    res.redirect(`/${repos[0]}`)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

export default handler
