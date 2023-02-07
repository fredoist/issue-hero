import { NextApiHandler } from 'next'
import redis, { setConfig } from '../../services/db'

const handler: NextApiHandler = async (req, res) => {
  const { repo, config } = req.body
  try {
    await setConfig(repo, config)
    res.status(200).json({ success: true })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: (error as any).message })
  }
}

export default handler
