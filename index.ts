import { ApplicationFunction } from 'probot'
import { onIssueOpened } from './bot'
import redis from './bot/db'

const app: ApplicationFunction = async (app, { getRouter }) => {
  await redis.connect()
  app.on('issues.opened', onIssueOpened)
}

export default app
