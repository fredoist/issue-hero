import { ApplicationFunction } from 'probot'
import { Router } from 'express'
import { onIssueOpened } from './bot'
import redis, { getConfig, setConfig } from './bot/db'

const app: ApplicationFunction = async (app, { getRouter }) => {
  await redis.connect()
  app.on('issues.opened', onIssueOpened)

  const router = (getRouter && getRouter('/')) as Router
  router.use((req, res, next) => {
    next()
  })

  router.use('/api', router, (req, res) => {

    router.get('/config', async (req, res) => {
      const repo = req.query.repo as string
      const config = await getConfig(repo)
      res.status(200).json(config)
    })

    router.patch('/config', async (req, res) => {
      const repo = req.query.repo as string
      const config = req.body
      const newConfig = await setConfig(repo, config)
      return res.status(200).json(newConfig)
    })

    res.status(200).json({ message: 'API is working' })
  })
}

export default app
