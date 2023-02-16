import { Probot } from 'probot'
import { Promise as BPromise } from 'bluebird'
import { addLabels, createSummary, filterSpam } from './models'

BPromise.config({ cancellation: true })

export default (app: Probot) => {
  app.on('issues.opened', async (context) => {
    const { private: isPrivateRepo } = context.payload.repository
    if (isPrivateRepo) return
    try {
      return BPromise.all([filterSpam, createSummary, addLabels].map((fn) => fn(context)))
    } catch (error) {
      return error && context.log.error(error)
    }
  })
}
