import type { Probot } from 'probot'
import type { Config } from './config'
import { defaultConfig } from './config'
import { addLabels, createSummary, filterSpam } from './models'

export default (app: Probot) => {
  app.on('issues.opened', async (context) => {
    const { private: isPrivateRepo } = context.payload.repository
    if (isPrivateRepo) return
    try {
      const config = (await context.config('issue-hero.yml', defaultConfig)) as Config

      const isSpam = await filterSpam(context, config)
      if (isSpam) return

      const summary = await createSummary(context, config)
      const labels = await addLabels(context, config)

      const comment = [summary, labels?.join(', ')].filter(Boolean).join('\n\n')
      if (comment) await context.octokit.issues.createComment(context.issue({ body: comment }))
      if (labels) await context.octokit.issues.addLabels(context.issue({ labels }))
    } catch (error) {
      return error && context.log.error(error)
    }
  })
}
