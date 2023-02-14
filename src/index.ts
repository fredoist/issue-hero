import { Probot } from 'probot'
import { addLabels, createSummary, filterSpam } from './models'

export default (app: Probot) => {
  app.on('issues.opened', async (context) => {
    const { private: isPrivateRepo } = context.payload.repository
    if (isPrivateRepo) return
    try {
      return await Promise.all([filterSpam, createSummary, addLabels].map((fn) => fn(context)))
    } catch (error) {
      return error && context.log.error(error)
    }
  })
}
